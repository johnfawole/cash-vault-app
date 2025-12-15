// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {TargetedSavingsVault} from "../contracts/TargetedSavingsVault.sol";
import {MockERC20, MockUSDC} from "./MockERC20.sol";

contract TargetedSavingsVaultTest is Test {
    TargetedSavingsVault public vault;
    MockERC20 public token;
    MockUSDC public usdc;

    address public owner = address(1);
    address public user = address(2);
    address public contributor = address(3);
    address public protocolFeeRecipient = address(4);

    uint256 constant INITIAL_BALANCE = 10000 * 10**18;
    uint256 constant TARGET_AMOUNT = 5000 * 10**18;

    event GoalCreated(uint256 indexed goalId, address indexed owner, string name);
    event ContributionReceived(uint256 indexed goalId, address indexed contributor, uint256 amount);
    event GoalReleased(uint256 indexed goalId, address indexed destination, uint256 amount, uint256 fee);
    event GoalCancelled(uint256 indexed goalId, uint256 amountReturned);
    event ProtocolFeeCollected(address indexed token, uint256 amount);

    function setUp() public {
        vm.startPrank(owner);
        vault = new TargetedSavingsVault();
        token = new MockERC20("Test Token", "TEST");
        usdc = new MockUSDC();
        vm.stopPrank();

        token.mint(user, INITIAL_BALANCE);
        token.mint(contributor, INITIAL_BALANCE);
        usdc.mint(user, INITIAL_BALANCE);
        
        vm.prank(user);
        token.approve(address(vault), type(uint256).max);
        
        vm.prank(contributor);
        token.approve(address(vault), type(uint256).max);
        
        vm.prank(user);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_CreateGoal() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(
            token,
            "Education Fund",
            TARGET_AMOUNT,
            block.timestamp + 365 days,
            true,
            0
        );

        assertEq(goalId, 1);
        assertEq(vault.goals(goalId).owner, user);
        assertEq(vault.goals(goalId).targetAmount, TARGET_AMOUNT);
        assertEq(vault.goals(goalId).balance, 0);
        assertTrue(vault.goals(goalId).allowExternalContributors);
        assertEq(vault.goalName(goalId), "Education Fund");
    }

    function test_CreateGoalWithInitialContribution() public {
        uint256 initialContribution = 1000 * 10**18;
        
        vm.prank(user);
        uint256 goalId = vault.createGoal(
            token,
            "Startup Fund",
            TARGET_AMOUNT,
            block.timestamp + 365 days,
            false,
            initialContribution
        );

        assertEq(vault.goals(goalId).balance, initialContribution);
        assertEq(vault.contributorTotals(goalId, user), initialContribution);
    }

    function test_CreateGoalWithUSDC() public {
        vm.prank(owner);
        vault.setUSDC(address(usdc));

        vm.prank(user);
        uint256 goalId = vault.createGoalWithUSDC(
            "USDC Goal",
            5000 * 10**6,
            block.timestamp + 365 days,
            true,
            0
        );

        assertEq(address(vault.goals(goalId).token), address(usdc));
    }

    function test_Contribute() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, true, 0);

        uint256 contribution = 1000 * 10**18;
        vm.prank(contributor);
        vault.contribute(goalId, contribution);

        assertEq(vault.goals(goalId).balance, contribution);
        assertEq(vault.contributorTotals(goalId, contributor), contribution);
    }

    function test_Revert_Contribute_ExternalDisabled() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, false, 0);

        vm.prank(contributor);
        vm.expectRevert(TargetedSavingsVault.ExternalContributionsDisabled.selector);
        vault.contribute(goalId, 1000 * 10**18);
    }

    function test_Release_TargetReached_WithFee() public {
        vm.prank(owner);
        vault.setProtocolFeeRecipient(protocolFeeRecipient);

        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, true, 0);

        // Contribute to reach target
        vm.prank(user);
        vault.contribute(goalId, TARGET_AMOUNT);

        uint256 fee = (TARGET_AMOUNT * 200) / 10000; // 2%
        uint256 userAmount = TARGET_AMOUNT - fee;

        uint256 userBalanceBefore = token.balanceOf(user);
        uint256 feeRecipientBalanceBefore = token.balanceOf(protocolFeeRecipient);

        vm.prank(user);
        vault.release(goalId, address(0));

        assertEq(token.balanceOf(user), userBalanceBefore + userAmount);
        assertEq(token.balanceOf(protocolFeeRecipient), feeRecipientBalanceBefore + fee);
        assertTrue(vault.goals(goalId).released);
        assertEq(vault.goals(goalId).balance, 0);
    }

    function test_Release_DeadlineReached() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, true, 0);

        // Contribute less than target
        vm.prank(user);
        vault.contribute(goalId, 2000 * 10**18);

        // Warp past deadline
        vm.warp(block.timestamp + 366 days);

        vm.prank(user);
        vault.release(goalId, address(0));

        assertTrue(vault.goals(goalId).released);
    }

    function test_Revert_Release_TargetNotMet() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, true, 0);

        vm.prank(user);
        vault.contribute(goalId, 2000 * 10**18);

        vm.prank(user);
        vm.expectRevert(TargetedSavingsVault.TargetNotMet.selector);
        vault.release(goalId, address(0));
    }

    function test_Cancel_NoFee() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, true, 0);

        uint256 contribution = 2000 * 10**18;
        vm.prank(user);
        vault.contribute(goalId, contribution);

        uint256 userBalanceBefore = token.balanceOf(user);

        vm.prank(user);
        vault.cancel(goalId, address(0));

        // Should receive full amount (no fee on cancellation)
        assertEq(token.balanceOf(user), userBalanceBefore + contribution);
        assertTrue(vault.goals(goalId).cancelled);
        assertEq(vault.goals(goalId).balance, 0);
    }

    function test_Release_NoFeeRecipient() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, true, 0);

        vm.prank(user);
        vault.contribute(goalId, TARGET_AMOUNT);

        uint256 userBalanceBefore = token.balanceOf(user);

        vm.prank(user);
        vault.release(goalId, address(0));

        // Should receive full amount if no fee recipient set
        assertEq(token.balanceOf(user), userBalanceBefore + TARGET_AMOUNT);
    }

    function test_Revert_InvalidDeadline() public {
        vm.prank(user);
        vm.expectRevert(TargetedSavingsVault.InvalidDeadline.selector);
        vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp, true, 0);
    }

    function test_Revert_NotOwner() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, true, 0);

        vm.prank(contributor);
        vm.expectRevert(TargetedSavingsVault.NotOwner.selector);
        vault.release(goalId, address(0));
    }

    function test_MultipleContributors() public {
        vm.prank(user);
        uint256 goalId = vault.createGoal(token, "Goal", TARGET_AMOUNT, block.timestamp + 365 days, true, 0);

        vm.prank(user);
        vault.contribute(goalId, 2000 * 10**18);

        vm.prank(contributor);
        vault.contribute(goalId, 3000 * 10**18);

        assertEq(vault.goals(goalId).balance, 5000 * 10**18);
        assertEq(vault.contributorTotals(goalId, user), 2000 * 10**18);
        assertEq(vault.contributorTotals(goalId, contributor), 3000 * 10**18);
    }
}


