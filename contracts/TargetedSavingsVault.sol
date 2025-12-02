// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TargetedSavingsVault
 * @notice Allows users (and optionally their community) to fund towards a named goal.
 */
contract TargetedSavingsVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Goal {
        address owner;
        IERC20 token;
        uint256 targetAmount;
        uint256 deadline;
        uint256 balance;
        bool released;
        bool cancelled;
        bool allowExternalContributors;
    }

    struct Contribution {
        uint256 amount;
        uint256 timestamp;
    }

    /// @notice USDC token address (set at deployment or via setUSDC)
    IERC20 public usdc;
    
    /// @notice Protocol fee recipient address
    address public protocolFeeRecipient;
    
    uint256 public constant WITHDRAWAL_FEE_BPS = 200; // 2% = 200 basis points

    uint256 private _goalIdTracker;
    mapping(uint256 => Goal) public goals;
    mapping(uint256 => mapping(address => uint256)) public contributorTotals;

    event GoalCreated(uint256 indexed goalId, address indexed owner, string name);
    event ContributionReceived(uint256 indexed goalId, address indexed contributor, uint256 amount);
    event GoalReleased(uint256 indexed goalId, address indexed destination, uint256 amount, uint256 fee);
    event GoalCancelled(uint256 indexed goalId, uint256 amountReturned);
    event ProtocolFeeRecipientUpdated(address indexed newRecipient);
    event ProtocolFeeCollected(address indexed token, uint256 amount);

    error GoalNotActive();
    error NotOwner();
    error DeadlineNotReached();
    error TargetNotMet();
    error ExternalContributionsDisabled();
    error InvalidDeadline();
    error ZeroAmount();
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

    mapping(uint256 => string) private _goalNames;

    function goalName(uint256 goalId) external view returns (string memory) {
        return _goalNames[goalId];
    }

    function createGoal(
        IERC20 token,
        string calldata name,
        uint256 targetAmount,
        uint256 deadline,
        bool allowExternalContributors,
        uint256 initialContribution
    ) external nonReentrant returns (uint256 goalId) {
        if (targetAmount == 0) revert ZeroAmount();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        goalId = ++_goalIdTracker;
        goals[goalId] = Goal({
            owner: msg.sender,
            token: token,
            targetAmount: targetAmount,
            deadline: deadline,
            balance: 0,
            released: false,
            cancelled: false,
            allowExternalContributors: allowExternalContributors
        });
        _goalNames[goalId] = name;

        emit GoalCreated(goalId, msg.sender, name);

        if (initialContribution > 0) {
            _contribute(goalId, msg.sender, initialContribution);
        }
    }

    function contribute(uint256 goalId, uint256 amount) external nonReentrant {
        Goal memory goal = goals[goalId];
        if (goal.owner == address(0) || goal.released || goal.cancelled) revert GoalNotActive();

        if (msg.sender != goal.owner && !goal.allowExternalContributors) {
            revert ExternalContributionsDisabled();
        }

        _contribute(goalId, msg.sender, amount);
    }

    function _contribute(uint256 goalId, address contributor, uint256 amount) internal {
        if (amount == 0) revert ZeroAmount();

        Goal storage goal = goals[goalId];
        goal.token.safeTransferFrom(contributor, address(this), amount);
        goal.balance += amount;
        contributorTotals[goalId][contributor] += amount;

        emit ContributionReceived(goalId, contributor, amount);
    }

    function release(uint256 goalId, address destination) external nonReentrant {
        Goal storage goal = goals[goalId];
        if (goal.owner != msg.sender) revert NotOwner();
        if (goal.released || goal.cancelled) revert GoalNotActive();

        bool targetReached = goal.balance >= goal.targetAmount;
        bool deadlineReached = block.timestamp >= goal.deadline;

        if (!targetReached && !deadlineReached) revert TargetNotMet();
        if (destination == address(0)) destination = goal.owner;

        uint256 amount = goal.balance;
        
        // Calculate and deduct 2% withdrawal fee
        uint256 fee = (amount * WITHDRAWAL_FEE_BPS) / 10000;
        uint256 userAmount = amount - fee;

        goal.balance = 0;
        goal.released = true;
        
        if (fee > 0 && protocolFeeRecipient != address(0)) {
            goal.token.safeTransfer(protocolFeeRecipient, fee);
            emit ProtocolFeeCollected(address(goal.token), fee);
        }
        
        goal.token.safeTransfer(destination, userAmount);
        emit GoalReleased(goalId, destination, userAmount, fee);
    }

    function cancel(uint256 goalId, address destination) external nonReentrant {
        Goal storage goal = goals[goalId];
        if (goal.owner != msg.sender) revert NotOwner();
        if (goal.released || goal.cancelled) revert GoalNotActive();

        goal.cancelled = true;
        uint256 amount = goal.balance;
        goal.balance = 0;

        if (destination == address(0)) destination = goal.owner;
        goal.token.safeTransfer(destination, amount);

        emit GoalCancelled(goalId, amount);
    }

    /**
     * @notice Create a savings goal using USDC. Requires USDC address to be set.
     * @param name Name of the savings goal.
     * @param targetAmount Target amount in USDC (6 decimals).
     * @param deadline Deadline timestamp for the goal.
     * @param allowExternalContributors Whether external addresses can contribute.
     * @param initialContribution Optional initial contribution amount.
     */
    function createGoalWithUSDC(
        string calldata name,
        uint256 targetAmount,
        uint256 deadline,
        bool allowExternalContributors,
        uint256 initialContribution
    ) external nonReentrant returns (uint256 goalId) {
        if (address(usdc) == address(0)) revert USDCNotSet();
        return createGoal(usdc, name, targetAmount, deadline, allowExternalContributors, initialContribution);
    }
}

