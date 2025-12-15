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
    address public protocolFeeRecipient = address(3);

    uint256 constant INITIAL_BALANCE = 10000 * 10**18;

    event PlanCreated(uint256 indexed planId, address indexed owner, address token);
    event PlanFunded(uint256 indexed planId, uint256 amount, uint256 newBalance);
    event PlanWithdrawn(uint256 indexed planId, address indexed owner, uint256 amount, uint256 fee);
    event PlanClosed(uint256 indexed planId, uint256 refund);
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
        uint256 planId = dca.createPlan(token, 500 * 10**18);

        assertEq(planId, 1);
        assertEq(dca.plans(planId).owner, user);
        assertEq(address(dca.plans(planId).token), address(token));
        assertEq(dca.plans(planId).balance, 500 * 10**18);
        assertTrue(dca.plans(planId).active);
    }

    function test_CreatePlanWithUSDC() public {
        vm.prank(owner);
        dca.setUSDC(address(usdc));

        vm.prank(user);
        uint256 planId = dca.createPlanWithUSDC(500 * 10**6);

        assertEq(planId, 1);
        assertEq(address(dca.plans(planId).token), address(usdc));
    }

    function test_FundPlan() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, 0);

        vm.prank(user);
        dca.fundPlan(planId, 200 * 10**18);

        assertEq(dca.plans(planId).balance, 200 * 10**18);
    }

    function test_Withdraw_WithFee() public {
        vm.prank(owner);
        dca.setProtocolFeeRecipient(protocolFeeRecipient);

        vm.prank(user);
        uint256 planId = dca.createPlan(token, 500 * 10**18);

        uint256 amount = 200 * 10**18;
        uint256 fee = (amount * 200) / 10000; // 2%
        uint256 userAmount = amount - fee;

        uint256 userBalanceBefore = token.balanceOf(user);
        uint256 feeRecipientBalanceBefore = token.balanceOf(protocolFeeRecipient);

        vm.prank(user);
        dca.withdraw(planId, amount);

        assertEq(token.balanceOf(user), userBalanceBefore + userAmount);
        assertEq(token.balanceOf(protocolFeeRecipient), feeRecipientBalanceBefore + fee);
        assertEq(dca.plans(planId).balance, 500 * 10**18 - amount);
    }

    function test_Withdraw_NoFeeRecipient() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, 500 * 10**18);

        uint256 amount = 200 * 10**18;
        uint256 userBalanceBefore = token.balanceOf(user);

        vm.prank(user);
        dca.withdraw(planId, amount);

        // Full amount if no fee recipient set
        assertEq(token.balanceOf(user), userBalanceBefore + amount);
    }

    function test_ClosePlan_NoFeeRecipient() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, 500 * 10**18);

        uint256 userBalanceBefore = token.balanceOf(user);
        vm.prank(user);
        dca.closePlan(planId, address(0));

        assertEq(token.balanceOf(user), userBalanceBefore + 500 * 10**18);
        assertFalse(dca.plans(planId).active);
        assertEq(dca.plans(planId).balance, 0);
    }

    function test_ClosePlan_WithFee() public {
        vm.prank(owner);
        dca.setProtocolFeeRecipient(protocolFeeRecipient);

        vm.prank(user);
        uint256 planId = dca.createPlan(token, 500 * 10**18);

        uint256 fee = (500 * 10**18 * 200) / 10000; // 2%
        uint256 userAmount = 500 * 10**18 - fee;

        uint256 userBalanceBefore = token.balanceOf(user);
        uint256 feeRecipientBalanceBefore = token.balanceOf(protocolFeeRecipient);

        vm.prank(user);
        dca.closePlan(planId, address(0));

        assertEq(token.balanceOf(user), userBalanceBefore + userAmount);
        assertEq(token.balanceOf(protocolFeeRecipient), feeRecipientBalanceBefore + fee);
        assertFalse(dca.plans(planId).active);
        assertEq(dca.plans(planId).balance, 0);
    }

    function test_Revert_Unauthorized() public {
        vm.prank(user);
        uint256 planId = dca.createPlan(token, 0);

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


