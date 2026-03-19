import { getAaveVaultAddress, SUPPORTED_ASSETS, type SupportedAsset } from "./config";

/**
 * Check if an asset is supported for Aave vault deposits
 */
export function isSupportedAsset(asset: string): asset is SupportedAsset {
  return SUPPORTED_ASSETS.includes(asset as SupportedAsset);
}

/**
 * Get vault address for an asset
 * Returns null if asset not supported or vault not configured
 */
export function getVaultAddressForAsset(asset: string): string | null {
  if (!isSupportedAsset(asset)) {
    console.warn(`[v0] Asset ${asset} is not supported for Aave vaults`);
    return null;
  }

  const vaultAddress = getAaveVaultAddress(asset);
  if (!vaultAddress) {
    console.warn(`[v0] Vault address not configured for ${asset}. Set NEXT_PUBLIC_AAVE_${asset}_VAULT`);
    return null;
  }

  return vaultAddress;
}

/**
 * Get all configured vaults
 */
export function getConfiguredVaults(): Record<SupportedAsset, string | null> {
  const vaults: Record<SupportedAsset, string | null> = {
    USDC: getAaveVaultAddress("USDC"),
    USDT: getAaveVaultAddress("USDT"),
    DAI: getAaveVaultAddress("DAI"),
    WETH: getAaveVaultAddress("WETH"),
  };

  return vaults;
}
