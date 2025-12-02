// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {SafeLockVault} from "../contracts/SafeLockVault.sol";
import {MockERC20, MockUSDC} from "./MockERC20.sol";

contract SafeLockVaultTest is Test {
    SafeLockVault public vault;
    MockERC20 public token;
    MockUSDC public usdc;

    address public owner = address(1);
    address public user = address(2);
    address public protocolFeeRecipient = address(3);

    uint256 constant INITIAL_BALANCE = 10000 * 10**18;
    uint256 constant LOCK_AMOUNT = 1000 * 10**18;

    event LockCreated(uint256 indexed lockId, address indexed owner, address token, uint256 amount, uint64 unlockTime);
    event LockClaimed(uint256 indexed lockId, address indexed owner, uint256 amount, uint256 fee);
    event ProtocolFeeCollected(address indexed token, uint256 amount);

    function setUp() public {
        vm.startPrank(owner);
        vault = new SafeLockVault();
        token = new MockERC20("Test Token", "TEST");
        usdc = new MockUSDC();
        vm.stopPrank();

        token.mint(user, INITIAL_BALANCE);
        usdc.mint(user, INITIAL_BALANCE);
        
        vm.prank(user);
        token.approve(address(vault), type(uint256).max);
        
        vm.prank(user);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_CreateLock() public {
        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        assertEq(lockId, 1);
        assertEq(vault.locks(lockId).owner, user);
        assertEq(address(vault.locks(lockId).token), address(token));
        assertEq(vault.locks(lockId).amount, LOCK_AMOUNT);
        assertEq(vault.locks(lockId).duration, 60 days);
        assertTrue(vault.locks(lockId).active);
        assertFalse(vault.locks(lockId).autoRelock);
    }

    function test_CreateLockWithUSDC() public {
        vm.prank(owner);
        vault.setUSDC(address(usdc));

        vm.prank(user);
        uint256 lockId = vault.createLockWithUSDC(1000 * 10**6, 60 days, false);

        assertEq(address(vault.locks(lockId).token), address(usdc));
    }

    function test_Claim_WithFee() public {
        vm.prank(owner);
        vault.setProtocolFeeRecipient(protocolFeeRecipient);

        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        uint64 unlockTime = vault.locks(lockId).unlockTime;
        vm.warp(unlockTime);

        uint256 fee = (LOCK_AMOUNT * 200) / 10000; // 2%
        uint256 userAmount = LOCK_AMOUNT - fee;

        uint256 userBalanceBefore = token.balanceOf(user);
        uint256 feeRecipientBalanceBefore = token.balanceOf(protocolFeeRecipient);

        vm.prank(user);
        vault.claim(lockId);

        assertEq(token.balanceOf(user), userBalanceBefore + userAmount);
        assertEq(token.balanceOf(protocolFeeRecipient), feeRecipientBalanceBefore + fee);
        assertFalse(vault.locks(lockId).active);
        assertEq(vault.locks(lockId).amount, 0);
    }

    function test_Claim_NoFeeRecipient() public {
        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        uint64 unlockTime = vault.locks(lockId).unlockTime;
        vm.warp(unlockTime);

        uint256 userBalanceBefore = token.balanceOf(user);

        vm.prank(user);
        vault.claim(lockId);

        // Should receive full amount if no fee recipient set
        assertEq(token.balanceOf(user), userBalanceBefore + LOCK_AMOUNT);
    }

    function test_EmergencyWithdraw_WithFee() public {
        vm.prank(owner);
        vault.setProtocolFeeRecipient(protocolFeeRecipient);

        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        // Emergency withdraw before unlock time
        uint256 fee = (LOCK_AMOUNT * 1000) / 10000; // 10%
        uint256 userAmount = LOCK_AMOUNT - fee;

        uint256 userBalanceBefore = token.balanceOf(user);
        uint256 feeRecipientBalanceBefore = token.balanceOf(protocolFeeRecipient);

        vm.prank(user);
        vault.emergencyWithdraw(lockId);

        assertEq(token.balanceOf(user), userBalanceBefore + userAmount);
        assertEq(token.balanceOf(protocolFeeRecipient), feeRecipientBalanceBefore + fee);
        assertFalse(vault.locks(lockId).active);
    }

    function test_AutoRelock() public {
        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, true);

        uint64 unlockTime = vault.locks(lockId).unlockTime;
        vm.warp(unlockTime);

        uint256 userBalanceBefore = token.balanceOf(user);

        vm.prank(user);
        vault.claim(lockId);

        // Should receive funds and relock
        assertEq(token.balanceOf(user), userBalanceBefore + LOCK_AMOUNT);
        assertTrue(vault.locks(lockId).active);
        assertGt(vault.locks(lockId).unlockTime, unlockTime);
    }

    function test_AddFunds() public {
        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        vm.prank(user);
        vault.addFunds(lockId, 500 * 10**18, token);

        assertEq(vault.locks(lockId).amount, LOCK_AMOUNT + 500 * 10**18);
    }

    function test_ExtendLock() public {
        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        uint64 originalUnlockTime = vault.locks(lockId).unlockTime;

        vm.prank(user);
        vault.extendLock(lockId, 30 days);

        assertEq(vault.locks(lockId).duration, 90 days);
        assertEq(vault.locks(lockId).unlockTime, originalUnlockTime + 30 days);
    }

    function test_Revert_Claim_NotUnlocked() public {
        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        vm.prank(user);
        vm.expectRevert(SafeLockVault.NotUnlocked.selector);
        vault.claim(lockId);
    }

    function test_Revert_InvalidDuration() public {
        vm.prank(user);
        vm.expectRevert(SafeLockVault.InvalidDuration.selector);
        vault.createLock(token, LOCK_AMOUNT, 29 days, false);

        vm.prank(user);
        vm.expectRevert(SafeLockVault.InvalidDuration.selector);
        vault.createLock(token, LOCK_AMOUNT, 181 days, false);
    }

    function test_Revert_TokenMismatch() public {
        MockERC20 otherToken = new MockERC20("Other", "OTHER");
        otherToken.mint(user, INITIAL_BALANCE);
        
        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        vm.prank(user);
        otherToken.approve(address(vault), type(uint256).max);

        vm.prank(user);
        vm.expectRevert(SafeLockVault.TokenMismatch.selector);
        vault.addFunds(lockId, 100 * 10**18, otherToken);
    }

    function test_SetAutoRelock() public {
        vm.prank(user);
        uint256 lockId = vault.createLock(token, LOCK_AMOUNT, 60 days, false);

        vm.prank(user);
        vault.setAutoRelock(lockId, true);

        assertTrue(vault.locks(lockId).autoRelock);
    }
}

