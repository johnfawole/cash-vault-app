import { AaveClient } from "@aave/client";

export const aaveClient = AaveClient.create();

export const AAVE_VAULT_ADDRESSES: Record<string, string> = {
  USDC: process.env.NEXT_PUBLIC_USDC_VAULT_ADDRESS || "",
  USDT: process.env.NEXT_PUBLIC_USDT_VAULT_ADDRESS || "",
  ETH: process.env.NEXT_PUBLIC_ETH_VAULT_ADDRESS || "",
  stETH: process.env.NEXT_PUBLIC_STETH_VAULT_ADDRESS || "",
};

export const MIN_DEPOSIT_AMOUNT = 100; // $100 minimum before auto-deposit
export const PROTOCOL_FEE_PERCENT = 10; // 10% fee on yields
