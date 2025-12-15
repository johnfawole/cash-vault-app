// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DCAInvestment
 * @notice Flexible savings vault used as the funding leg for a DCA strategy.
 * @dev
 * - Users create "plans" that are simply token buckets they can top up any time.
 * - The actual DCA behaviour (e.g. recurring buys) is handled off-chain using these balances.
 * - On-chain we only enforce deposits, withdrawals (with protocol fee), and plan closure (no fee).
 */
contract DCAInvestment is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Plan {
        address owner;
        IERC20 token;
        uint256 balance;
        bool active;
    }
    uint256 public constant WITHDRAWAL_FEE_BPS = 200; // 2% = 200 basis points

    /// @notice USDC token address (set at deployment or via setUSDC)
    IERC20 public usdc;
    
    /// @notice Protocol fee recipient address
    address public protocolFeeRecipient;

    uint256 private _planIdTracker;
    mapping(uint256 => Plan) public plans;

    event PlanCreated(uint256 indexed planId, address indexed owner, address token);
    event PlanFunded(uint256 indexed planId, uint256 amount, uint256 newBalance);
    event PlanWithdrawn(uint256 indexed planId, address indexed owner, uint256 amount, uint256 fee);
    event PlanClosed(uint256 indexed planId, uint256 refund);
    event ProtocolFeeRecipientUpdated(address indexed newRecipient);
    event ProtocolFeeCollected(address indexed token, uint256 amount);

    modifier onlyPlanOwner(uint256 planId) {
        if (plans[planId].owner != msg.sender) revert Unauthorized();
        _;
    }

    error InvalidAmount();
    error PlanInactive();
    error Unauthorized();
    error NothingToRefund();
    error NotDueYet();
    error InsufficientBalance();
    error USDCNotSet();
    error InvalidFeeRecipient();

    /// @notice Set the USDC token address. Can be called multiple times to update.
    /// @param usdcAddress The USDC token contract address
    function setUSDC(address usdcAddress) external onlyOwner {
        if (usdcAddress == address(0)) revert USDCNotSet();
        usdc = IERC20(usdcAddress);
    }

    /// @notice Set the protocol fee recipient address.
    /// @param feeRecipient The address that will receive protocol fees
    function setProtocolFeeRecipient(address feeRecipient) external onlyOwner {
        if (feeRecipient == address(0)) revert InvalidFeeRecipient();
        protocolFeeRecipient = feeRecipient;
        emit ProtocolFeeRecipientUpdated(feeRecipient);
    }

    /**
     * @notice Create a new savings plan for a specific ERC20 token.
     * @param token ERC20 asset users will deposit into this plan.
     * @param prefund Optional amount to deposit immediately.
     */
    function createPlan(
        IERC20 token,
        uint256 prefund
    ) external nonReentrant returns (uint256 planId) {
        planId = ++_planIdTracker;

        plans[planId] = Plan({
            owner: msg.sender,
            token: token,
            balance: 0,
            active: true
        });

        if (prefund > 0) {
            token.safeTransferFrom(msg.sender, address(this), prefund);
            plans[planId].balance = prefund;
        }

        emit PlanCreated(planId, msg.sender, address(token));
        if (prefund > 0) emit PlanFunded(planId, prefund, prefund);
    }

    /// @notice Deposit more tokens into an existing plan.
    function fundPlan(uint256 planId, uint256 amount) external nonReentrant onlyPlanOwner(planId) {
        if (!plans[planId].active) revert PlanInactive();
        plans[planId].token.safeTransferFrom(msg.sender, address(this), amount);
        plans[planId].balance += amount;
        emit PlanFunded(planId, amount, plans[planId].balance);
    }

    /**
     * @notice Withdraw from a plan to the caller, applying the protocol withdrawal fee.
     * @param planId The plan to withdraw from.
     * @param amount Amount of tokens to withdraw from the plan.
     */
    function withdraw(
        uint256 planId,
        uint256 amount
    ) external nonReentrant onlyPlanOwner(planId) {
        Plan storage plan = plans[planId];
        if (!plan.active) revert PlanInactive();
        if (amount == 0) revert InvalidAmount();
        if (plan.balance < amount) revert InsufficientBalance();

        plan.balance -= amount;

        uint256 fee = (amount * WITHDRAWAL_FEE_BPS) / 10000;
        uint256 userAmount = amount - fee;

        if (fee > 0 && protocolFeeRecipient != address(0)) {
            plan.token.safeTransfer(protocolFeeRecipient, fee);
            emit ProtocolFeeCollected(address(plan.token), fee);
        }

        // Always send withdrawals to the plan owner (msg.sender is enforced by onlyPlanOwner)
        plan.token.safeTransfer(plan.owner, userAmount);

        emit PlanWithdrawn(planId, plan.owner, userAmount, fee);
    }

    /**
     * @notice Close a plan and withdraw the full remaining balance to the owner, applying the protocol withdrawal fee.
     * @param planId The plan to close.
     * @param to Optional recipient address (defaults to plan owner if zero address).
     */
    function closePlan(uint256 planId, address to) external nonReentrant onlyPlanOwner(planId) {
        Plan storage plan = plans[planId];
        if (!plan.active) revert PlanInactive();

        uint256 amount = plan.balance;
        if (amount == 0) revert NothingToRefund();

        plan.active = false;
        plan.balance = 0;

        // Apply the same withdrawal fee as regular withdrawals
        uint256 fee = (amount * WITHDRAWAL_FEE_BPS) / 10000;
        uint256 userAmount = amount - fee;

        if (fee > 0 && protocolFeeRecipient != address(0)) {
            plan.token.safeTransfer(protocolFeeRecipient, fee);
            emit ProtocolFeeCollected(address(plan.token), fee);
        }

        address recipient = to == address(0) ? plan.owner : to;
        plan.token.safeTransfer(recipient, userAmount);
        emit PlanClosed(planId, userAmount);
    }

    /**
     * @notice Create a savings plan using USDC. Requires USDC address to be set.
     * @param prefund Optional amount in USDC (6 decimals) to deposit immediately.
     */
    function createPlanWithUSDC(
        uint256 prefund
    ) external nonReentrant returns (uint256 planId) {
        if (address(usdc) == address(0)) revert USDCNotSet();
        return createPlan(usdc, prefund);
    }

    function getPlan(uint256 planId) external view returns (Plan memory) {
        return plans[planId];
    }
}

