// Aave Vault Client
// Handles interactions with ERC-4626 vaults and Aave contract calls

import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem'
import { mainnet } from 'viem/chains'
import type { ERC4626Vault, VaultConfig, VaultPosition, YieldSnapshot } from './erc4626Interface'

const PUBLIC_CLIENT = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
})

// Pre-configured Aave Earn vaults on Ethereum
export const AAVE_VAULTS: Record<string, VaultConfig> = {
  'aEthUSDC': {
    address: '0x98c23e9d8f34fefb1b7fad381f1855433f6b7e87', // Example: Aave USDC vault (verify actual address)
    asset: '0xa0b86991d4f1e4b2dcab8e0d4f3ca505e3e2b7a8', // USDC on Ethereum
    assetDecimals: 6,
    symbol: 'aEthUSDC',
    name: 'Aave Ethereum USDC Earn Vault',
    chain: 'ethereum',
    apy: 4.5, // Example APY
  },
  'aEthDAI': {
    address: '0x8Df70b7d9dC3A44dd75Dd0f8E6A20E0E1b61e589', // Example: Aave DAI vault
    asset: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI on Ethereum
    assetDecimals: 18,
    symbol: 'aEthDAI',
    name: 'Aave Ethereum DAI Earn Vault',
    chain: 'ethereum',
    apy: 5.2,
  },
  'aEthUSDT': {
    address: '0x8Ec54FF4F16d94FB99D8b68F27c62D3F2c0cE20d', // Example: Aave USDT vault
    asset: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT on Ethereum
    assetDecimals: 6,
    symbol: 'aEthUSDT',
    name: 'Aave Ethereum USDT Earn Vault',
    chain: 'ethereum',
    apy: 5.0,
  },
}

// ERC-4626 Vault ABI (minimal, only needed functions)
const VAULT_ABI = [
  {
    name: 'asset',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'totalAssets',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'balanceOf',
    inputs: [{ type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'convertToAssets',
    inputs: [{ type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'previewDeposit',
    inputs: [{ type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export class AaveVaultClient {
  /**
   * Get vault position details for a wallet
   */
  static async getPosition(
    vaultAddress: string,
    walletAddress: string
  ): Promise<VaultPosition | null> {
    try {
      // Get shares balance
      const sharesBalance = await PUBLIC_CLIENT.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      }) as bigint

      // Get total assets value
      const totalAssets = await PUBLIC_CLIENT.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'totalAssets',
      }) as bigint

      const totalSupply = await PUBLIC_CLIENT.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'totalSupply',
      }) as bigint

      // Calculate user's asset value: (shares / totalSupply) * totalAssets
      const assetsValue = totalSupply > 0n ? (sharesBalance * totalAssets) / totalSupply : 0n

      return {
        vaultAddress,
        walletAddress,
        sharesBalance,
        assetsValue,
        yieldEarned: 0n, // Will be calculated from yield_history table
        feesCollected: 0n,
        depositedAt: new Date(),
        lastYieldSnapshot: new Date(),
      }
    } catch (error) {
      console.error('[v0] Error getting vault position:', error)
      return null
    }
  }

  /**
   * Preview deposit - see how many shares you'd get
   */
  static async previewDeposit(
    vaultAddress: string,
    assetAmount: bigint
  ): Promise<bigint | null> {
    try {
      const shares = await PUBLIC_CLIENT.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'previewDeposit',
        args: [assetAmount],
      }) as bigint

      return shares
    } catch (error) {
      console.error('[v0] Error previewing deposit:', error)
      return null
    }
  }

  /**
   * Get vault APY
   */
  static getVaultApy(vaultSymbol: string): number {
    const vault = AAVE_VAULTS[vaultSymbol]
    return vault?.apy || 0
  }

  /**
   * Map asset symbol to vault symbol
   */
  static getVaultForAsset(assetSymbol: string): VaultConfig | null {
    // Find vault that matches asset
    const vault = Object.values(AAVE_VAULTS).find(
      (v) => v.symbol.includes(assetSymbol)
    )
    return vault || null
  }
}
