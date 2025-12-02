// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SafeLockVault
 * @notice Non-custodial time-lock vault with optional auto relock.
 */
contract SafeLockVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct LockPosition {
        address owner;
        IERC20 token;
        uint256 amount;
        uint64 unlockTime;
        uint64 duration;
        bool autoRelock;
        bool active;
    }

    uint64 public constant MIN_DURATION = 30 days;
    uint64 public constant MAX_DURATION = 180 days;
    uint256 public constant WITHDRAWAL_FEE_BPS = 200; // 2% = 200 basis points
    uint256 public constant PREMATURE_WITHDRAWAL_FEE_BPS = 1000; // 10% = 1000 basis points

    /// @notice USDC token address (set at deployment or via setUSDC)
    IERC20 public usdc;
    
    /// @notice Protocol fee recipient address
    address public protocolFeeRecipient;

    uint256 private _lockIdTracker;
    mapping(uint256 => LockPosition) public locks;

    event LockCreated(uint256 indexed lockId, address indexed owner, address token, uint256 amount, uint64 unlockTime);
    event LockExtended(uint256 indexed lockId, uint64 newUnlockTime);
    event AutoRelockUpdated(uint256 indexed lockId, bool enabled);
    event LockFunded(uint256 indexed lockId, uint256 addedAmount, uint256 totalAmount);
    event LockClaimed(uint256 indexed lockId, address indexed owner, uint256 amount, uint256 fee);
    event LockRelocked(uint256 indexed lockId, uint64 nextUnlockTime);
    event ProtocolFeeRecipientUpdated(address indexed newRecipient);
    event ProtocolFeeCollected(address indexed token, uint256 amount);

    error InvalidDuration();
    error LockInactive();
    error NotOwner();
    error NotUnlocked();
    error ZeroAmount();
    error USDCNotSet();
    error TokenMismatch();
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

    modifier onlyOwner(uint256 lockId) {
        if (locks[lockId].owner != msg.sender) revert NotOwner();
        _;
    }

    function createLock(
        IERC20 token,
        uint256 amount,
        uint64 duration,
        bool autoRelock
    ) external nonReentrant returns (uint256 lockId) {
        if (amount == 0) revert ZeroAmount();
        if (duration < MIN_DURATION || duration > MAX_DURATION) revert InvalidDuration();

        lockId = ++_lockIdTracker;
        locks[lockId] = LockPosition({
            owner: msg.sender,
            token: token,
            amount: amount,
            unlockTime: uint64(block.timestamp) + duration,
            duration: duration,
            autoRelock: autoRelock,
            active: true
        });

        token.safeTransferFrom(msg.sender, address(this), amount);
        emit LockCreated(lockId, msg.sender, address(token), amount, locks[lockId].unlockTime);
    }

    function addFunds(uint256 lockId, uint256 amount, IERC20 token) external nonReentrant onlyOwner(lockId) {
        LockPosition storage position = locks[lockId];
        if (!position.active) revert LockInactive();
        if (amount == 0) revert ZeroAmount();
        if (address(token) != address(position.token)) revert TokenMismatch();

        position.amount += amount;
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit LockFunded(lockId, amount, position.amount);
    }

    function extendLock(uint256 lockId, uint64 additionalDuration) external nonReentrant onlyOwner(lockId) {
        LockPosition storage position = locks[lockId];
        if (!position.active) revert LockInactive();
        uint64 newDuration = position.duration + additionalDuration;
        if (newDuration > MAX_DURATION) revert InvalidDuration();
        
        // Extend from current unlockTime, not from block.timestamp
        uint64 newUnlockTime = position.unlockTime + additionalDuration;
        uint64 maxUnlockTime = uint64(block.timestamp) + MAX_DURATION;
        if (newUnlockTime > maxUnlockTime) revert InvalidDuration();

        position.duration = newDuration;
        position.unlockTime = newUnlockTime;
        emit LockExtended(lockId, position.unlockTime);
    }

    function setAutoRelock(uint256 lockId, bool enabled) external onlyOwner(lockId) {
        LockPosition storage position = locks[lockId];
        if (!position.active) revert LockInactive();
        position.autoRelock = enabled;
        emit AutoRelockUpdated(lockId, enabled);
    }

    function claim(uint256 lockId) external nonReentrant onlyOwner(lockId) {
        LockPosition storage position = locks[lockId];
        if (!position.active) revert LockInactive();
        if (block.timestamp < position.unlockTime) revert NotUnlocked();

        uint256 amount = position.amount;
        
        // Calculate and deduct 2% withdrawal fee
        uint256 fee = (amount * WITHDRAWAL_FEE_BPS) / 10000;
        uint256 userAmount = amount - fee;

        if (position.autoRelock) {
            // Transfer funds even when auto-relocking
            position.unlockTime = uint64(block.timestamp) + position.duration;
            
            if (fee > 0 && protocolFeeRecipient != address(0)) {
                position.token.safeTransfer(protocolFeeRecipient, fee);
                emit ProtocolFeeCollected(address(position.token), fee);
            }
            
            position.token.safeTransfer(msg.sender, userAmount);
            emit LockRelocked(lockId, position.unlockTime);
            emit LockClaimed(lockId, msg.sender, userAmount, fee);
            return;
        }

        position.amount = 0;
        position.active = false;
        
        if (fee > 0 && protocolFeeRecipient != address(0)) {
            position.token.safeTransfer(protocolFeeRecipient, fee);
            emit ProtocolFeeCollected(address(position.token), fee);
        }
        
        position.token.safeTransfer(msg.sender, userAmount);
        emit LockClaimed(lockId, msg.sender, userAmount, fee);
    }

    /**
     * @notice Emergency withdrawal that bypasses time lock. Use only in emergencies.
     * @dev This function intentionally bypasses the unlock time check for emergency situations.
     * Charges 10% fee for premature withdrawal.
     */
    function emergencyWithdraw(uint256 lockId) external nonReentrant onlyOwner(lockId) {
        LockPosition storage position = locks[lockId];
        if (!position.active) revert LockInactive();

        uint256 amount = position.amount;
        
        // Calculate and deduct 10% premature withdrawal fee
        uint256 fee = (amount * PREMATURE_WITHDRAWAL_FEE_BPS) / 10000;
        uint256 userAmount = amount - fee;

        position.amount = 0;
        position.active = false;
        position.autoRelock = false;
        
        if (fee > 0 && protocolFeeRecipient != address(0)) {
            position.token.safeTransfer(protocolFeeRecipient, fee);
            emit ProtocolFeeCollected(address(position.token), fee);
        }
        
        position.token.safeTransfer(msg.sender, userAmount);
        emit LockClaimed(lockId, msg.sender, userAmount, fee);
    }

    /**
     * @notice Create a lock using USDC. Requires USDC address to be set.
     * @param amount Amount in USDC (6 decimals) to lock.
     * @param duration Lock duration in seconds.
     * @param autoRelock Whether to automatically relock when unlocked.
     */
    function createLockWithUSDC(
        uint256 amount,
        uint64 duration,
        bool autoRelock
    ) external nonReentrant returns (uint256 lockId) {
        if (address(usdc) == address(0)) revert USDCNotSet();
        return createLock(usdc, amount, duration, autoRelock);
    }
}

