// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {DCAInvestment} from "../contracts/DCAInvestment.sol";
import {MockERC20, MockUSDC} from "./MockERC20.sol";

contract DCAInvestmentTest is Test {
    DCAInvestment public dca;
    MockERC20 public token;
    MockUSDC public usdc;

    address public owner = address(1);
    address public user = address(2);
    address public beneficiary = address(3);
    address public protocolFeeRecipient = address(4);

    uint256 constant INITIAL_BALANCE = 10000 * 10**18;

    event PlanCreated(uint256 indexed planId, address indexed owner, address indexed beneficiary, address token);
    event PlanFunded(uint256 indexed planId, uint256 amount, uint256 newBalance);
    event PlanExecuted(uint256 indexed planId, address indexed executor, uint256 amount, uint64 nextExecution);
    event PlanCancelled(uint256 indexed planId, uint256 refund);
    event ProtocolFeeRecipientUpdated(address indexed newRecipient);
    event ProtocolFeeCollected(address indexed token, uint256 amount);

    function setUp() public {
        vm.startPrank(owner);
        dca = new DCAInvestment();
        token = new MockERC20("Test Token", "TEST");
        usdc = new MockUSDC();
        vm.stopPrank();

        // Setup users with tokens
        token.mint(user, INITIAL_BALANCE);
        usdc.mint(user, INITIAL_BALANCE);
        
        vm.prank(user);
        token.approve(address(dca), type(uint256).max);
        
        vm.prank(user);
        usdc.approve(address(dca), type(uint256).max);
    }

    function test_CreatePlan() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(
            token,
            beneficiary,
            100 * 10**18,
            7 days,
            500 * 10**18,
            0
        );

        assertEq(planId, 1);
        assertEq(dca.plans(planId).owner, user);
        assertEq(dca.plans(planId).beneficiary, beneficiary);
        assertEq(address(dca.plans(planId).token), address(token));
        assertEq(dca.plans(planId).amountPerInterval, 100 * 10**18);
        assertEq(dca.plans(planId).interval, 7 days);
        assertEq(dca.plans(planId).remainingBalance, 500 * 10**18);
        assertTrue(dca.plans(planId).active);
    }

    function test_CreatePlanWithUSDC() public {
        vm.prank(owner);
        dca.setUSDC(address(usdc));

        vm.prank(user);
        uint256 planId = dca.createPlanWithUSDC(
            beneficiary,
            100 * 10**6,
            7 days,
            500 * 10**6,
            0
        );

        assertEq(planId, 1);
        assertEq(address(dca.plans(planId).token), address(usdc));
    }

    function test_FundPlan() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, beneficiary, 100 * 10**18, 7 days, 0, 0);

        vm.prank(user);
        dca.fundPlan(planId, 200 * 10**18);

        assertEq(dca.plans(planId).remainingBalance, 200 * 10**18);
    }

    function test_ExecutePlan() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, beneficiary, 100 * 10**18, 7 days, 500 * 10**18, 0);

        uint256 nextExecution = dca.plans(planId).nextExecution;
        vm.warp(nextExecution);

        uint256 beneficiaryBalanceBefore = token.balanceOf(beneficiary);
        dca.executePlan(planId);

        assertEq(token.balanceOf(beneficiary), beneficiaryBalanceBefore + 100 * 10**18);
        assertEq(dca.plans(planId).remainingBalance, 400 * 10**18);
        assertEq(dca.plans(planId).nextExecution, nextExecution + 7 days);
    }

    function test_ExecutePlanMultipleTimes() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, beneficiary, 100 * 10**18, 7 days, 500 * 10**18, 0);

        uint256 nextExecution = dca.plans(planId).nextExecution;
        vm.warp(nextExecution);

        // First execution
        dca.executePlan(planId);
        assertEq(dca.plans(planId).remainingBalance, 400 * 10**18);

        // Try to execute again in same block - should fail
        vm.expectRevert(DCAInvestment.NotDueYet.selector);
        dca.executePlan(planId);

        // Warp to next execution time
        vm.warp(nextExecution + 7 days);
        dca.executePlan(planId);
        assertEq(dca.plans(planId).remainingBalance, 300 * 10**18);
    }

    function test_CancelPlan_NoFee() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, beneficiary, 100 * 10**18, 7 days, 500 * 10**18, 0);

        uint256 userBalanceBefore = token.balanceOf(user);
        vm.prank(user);
        dca.cancelPlan(planId);

        assertEq(token.balanceOf(user), userBalanceBefore + 500 * 10**18);
        assertFalse(dca.plans(planId).active);
        assertEq(dca.plans(planId).remainingBalance, 0);
    }

    function test_UpdatePlan() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, beneficiary, 100 * 10**18, 7 days, 0, 0);

        address newBeneficiary = address(5);
        vm.prank(user);
        dca.updatePlan(planId, newBeneficiary, 150 * 10**18, 14 days);

        assertEq(dca.plans(planId).beneficiary, newBeneficiary);
        assertEq(dca.plans(planId).amountPerInterval, 150 * 10**18);
        assertEq(dca.plans(planId).interval, 14 days);
    }

    function test_Revert_InvalidInterval() public {
        vm.prank(user);
        vm.expectRevert(DCAInvestment.InvalidInterval.selector);
        dca.createPlan(token, beneficiary, 100 * 10**18, 0, 0, 0);

        vm.prank(user);
        vm.expectRevert(DCAInvestment.InvalidInterval.selector);
        dca.createPlan(token, beneficiary, 100 * 10**18, 91 days, 0, 0);
    }

    function test_Revert_Unauthorized() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, beneficiary, 100 * 10**18, 7 days, 0, 0);

        vm.prank(address(999));
        vm.expectRevert(DCAInvestment.Unauthorized.selector);
        dca.fundPlan(planId, 100 * 10**18);
    }

    function test_SetProtocolFeeRecipient() public {
        vm.prank(owner);
        dca.setProtocolFeeRecipient(protocolFeeRecipient);

        assertEq(dca.protocolFeeRecipient(), protocolFeeRecipient);
    }

    function test_Revert_SetProtocolFeeRecipient_NotOwner() public {
        vm.prank(user);
        vm.expectRevert();
        dca.setProtocolFeeRecipient(protocolFeeRecipient);
    }

    function test_SetUSDC() public {
        vm.prank(owner);
        dca.setUSDC(address(usdc));

        assertEq(address(dca.usdc()), address(usdc));
    }
}

