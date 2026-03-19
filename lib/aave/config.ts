import { getConnectedAddress } from "@/lib/walletConnector";

/**
 * Get Aave Earn vault address for a given asset
 * Uses environment variables configured during deployment
 */
export function getAaveVaultAddress(asset: string): string | null {
  const vaults: Record<string, string> = {
    USDC: process.env.NEXT_PUBLIC_AAVE_USDC_VAULT || "",
    USDT: process.env.NEXT_PUBLIC_AAVE_USDT_VAULT || "",
    DAI: process.env.NEXT_PUBLIC_AAVE_DAI_VAULT || "",
    WETH: process.env.NEXT_PUBLIC_AAVE_WETH_VAULT || "",
  };
  
  return vaults[asset] || null;
}

export const MIN_DEPOSIT_AMOUNT = 100; // $100 minimum before auto-deposit
export const PROTOCOL_FEE_PERCENT = 10; // 10% fee on yields
export const YIELD_SYNC_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
export const SUPPORTED_ASSETS = ["USDC", "USDT", "DAI", "WETH"] as const;

export type SupportedAsset = typeof SUPPORTED_ASSETS[number];
