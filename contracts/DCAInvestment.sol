// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DCAInvestment
 * @notice Dollar-cost averaging planner. Users pre-fund plans and anyone can execute a due cycle.
 */
contract DCAInvestment is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Plan {
        address owner;
        address beneficiary;
        IERC20 token;
        uint128 amountPerInterval;
        uint64 interval;
        uint64 nextExecution;
        uint256 remainingBalance;
        bool active;
    }

    uint64 public constant MIN_INTERVAL = 1 days;
    uint64 public constant MAX_INTERVAL = 90 days;
    uint256 public constant WITHDRAWAL_FEE_BPS = 200; // 2% = 200 basis points

    /// @notice USDC token address (set at deployment or via setUSDC)
    IERC20 public usdc;
    
    /// @notice Protocol fee recipient address
    address public protocolFeeRecipient;

    uint256 private _planIdTracker;
    mapping(uint256 => Plan) public plans;

    event PlanCreated(uint256 indexed planId, address indexed owner, address indexed beneficiary, address token);
    event PlanFunded(uint256 indexed planId, uint256 amount, uint256 newBalance);
    event PlanExecuted(uint256 indexed planId, address indexed executor, uint256 amount, uint64 nextExecution);
    event PlanUpdated(uint256 indexed planId, address beneficiary, uint128 amountPerInterval, uint64 interval);
    event PlanCancelled(uint256 indexed planId, uint256 refund);
    event ProtocolFeeRecipientUpdated(address indexed newRecipient);
    event ProtocolFeeCollected(address indexed token, uint256 amount);

    modifier onlyOwner(uint256 planId) {
        if (plans[planId].owner != msg.sender) revert Unauthorized();
        _;
    }

    error InvalidInterval();
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
     * @notice Create a new DCA plan.
     * @param token ERC20 asset used for purchases.
     * @param beneficiary Destination wallet or on-ramp that receives executions.
     * @param amountPerInterval Amount sent each interval.
     * @param interval Interval length in seconds.
     * @param prefund Optional amount transferred immediately to seed the plan.
     * @param startTime Optional first execution timestamp (0 means now + interval).
     */
    function createPlan(
        IERC20 token,
        address beneficiary,
        uint128 amountPerInterval,
        uint64 interval,
        uint256 prefund,
        uint64 startTime
    ) external nonReentrant returns (uint256 planId) {
        if (amountPerInterval == 0) revert InvalidAmount();
        if (interval < MIN_INTERVAL || interval > MAX_INTERVAL) revert InvalidInterval();
        if (beneficiary == address(0)) revert Unauthorized();

        planId = ++_planIdTracker;
        uint64 firstExecution = startTime == 0 ? uint64(block.timestamp) + interval : startTime;

        plans[planId] = Plan({
            owner: msg.sender,
            beneficiary: beneficiary,
            token: token,
            amountPerInterval: amountPerInterval,
            interval: interval,
            nextExecution: firstExecution,
            remainingBalance: 0,
            active: true
        });

        if (prefund > 0) {
            token.safeTransferFrom(msg.sender, address(this), prefund);
            plans[planId].remainingBalance = prefund;
        }

        emit PlanCreated(planId, msg.sender, beneficiary, address(token));
        if (prefund > 0) emit PlanFunded(planId, prefund, prefund);
    }

    function fundPlan(uint256 planId, uint256 amount) external nonReentrant onlyOwner(planId) {
        if (!plans[planId].active) revert PlanInactive();
        plans[planId].token.safeTransferFrom(msg.sender, address(this), amount);
        plans[planId].remainingBalance += amount;
        emit PlanFunded(planId, amount, plans[planId].remainingBalance);
    }

    function updatePlan(
        uint256 planId,
        address newBeneficiary,
        uint128 newAmountPerInterval,
        uint64 newInterval
    ) external onlyOwner(planId) {
        Plan storage plan = plans[planId];
        if (!plan.active) revert PlanInactive();

        if (newBeneficiary != address(0)) plan.beneficiary = newBeneficiary;
        if (newAmountPerInterval != 0) plan.amountPerInterval = newAmountPerInterval;

        if (newInterval != 0) {
            if (newInterval < MIN_INTERVAL || newInterval > MAX_INTERVAL) revert InvalidInterval();
            plan.interval = newInterval;
        }

        emit PlanUpdated(planId, plan.beneficiary, plan.amountPerInterval, plan.interval);
    }

    /**
     * @notice Execute a due plan. Callable by anyone (keepers can earn off-chain rewards).
     */
    function executePlan(uint256 planId) external nonReentrant {
        Plan storage plan = plans[planId];
        if (!plan.active) revert PlanInactive();
        if (block.timestamp < plan.nextExecution) revert NotDueYet();
        if (plan.remainingBalance < plan.amountPerInterval) revert InsufficientBalance();

        uint256 amount = plan.amountPerInterval;
        plan.remainingBalance -= amount;
        plan.nextExecution += plan.interval; // Update BEFORE transfer to prevent multiple executions in same block
        plan.token.safeTransfer(plan.beneficiary, amount);

        emit PlanExecuted(planId, msg.sender, amount, plan.nextExecution);
    }

    function cancelPlan(uint256 planId) external nonReentrant onlyOwner(planId) {
        Plan storage plan = plans[planId];
        if (!plan.active) revert PlanInactive();

        uint256 refund = plan.remainingBalance;
        if (refund == 0) revert NothingToRefund();

        plan.active = false;
        plan.remainingBalance = 0;
        plan.token.safeTransfer(plan.owner, refund);
        emit PlanCancelled(planId, refund);
    }

    /**
     * @notice Create a DCA plan using USDC. Requires USDC address to be set.
     * @param beneficiary Destination wallet or on-ramp that receives executions.
     * @param amountPerInterval Amount in USDC (6 decimals) sent each interval.
     * @param interval Interval length in seconds.
     * @param prefund Optional amount transferred immediately to seed the plan.
     * @param startTime Optional first execution timestamp (0 means now + interval).
     */
    function createPlanWithUSDC(
        address beneficiary,
        uint128 amountPerInterval,
        uint64 interval,
        uint256 prefund,
        uint64 startTime
    ) external nonReentrant returns (uint256 planId) {
        if (address(usdc) == address(0)) revert USDCNotSet();
        return createPlan(usdc, beneficiary, amountPerInterval, interval, prefund, startTime);
    }

    function getPlan(uint256 planId) external view returns (Plan memory) {
        return plans[planId];
    }
}

