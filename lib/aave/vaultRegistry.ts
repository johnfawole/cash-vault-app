import { evmAddress, chainId as aaveChainId } from "@aave/client";
import { aaveClient, AAVE_VAULT_ADDRESSES } from "./config";

/**
 * Get vault address for a specific asset
 * @param asset - Token symbol (e.g., 'USDC', 'ETH')
 * @returns Vault contract address or null if not found
 */
export function getVaultAddressForAsset(asset: string): string | null {
  const vaultAddress = AAVE_VAULT_ADDRESSES[asset.toUpperCase()];
  return vaultAddress || null;
}

/**
 * Check if an asset has a corresponding Aave vault
 * @param asset - Token symbol
 * @returns true if vault exists for asset
 */
export function isSupportedAsset(asset: string): boolean {
  return getVaultAddressForAsset(asset) !== null;
}

/**
 * Get all supported vault assets
 * @returns Array of supported asset symbols
 */
export function getSupportedAssets(): string[] {
  return Object.keys(AAVE_VAULT_ADDRESSES).filter((key) => AAVE_VAULT_ADDRESSES[key]);
}
