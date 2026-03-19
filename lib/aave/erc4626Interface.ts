// ERC-4626 Vault Interface
// Standard interface for interacting with Aave Earn vaults

export interface ERC4626Vault {
  // View functions
  asset(): Promise<string> // Underlying token address
  totalAssets(): Promise<bigint> // Total assets in vault
  totalSupply(): Promise<bigint> // Total vault shares issued
  balanceOf(account: string): Promise<bigint> // Vault shares owned by account
  convertToAssets(shares: bigint): Promise<bigint> // Convert shares to assets
  convertToShares(assets: bigint): Promise<bigint> // Convert assets to shares
  maxDeposit(receiver: string): Promise<bigint> // Max deposit amount
  maxMint(receiver: string): Promise<bigint> // Max mint amount
  maxRedeem(owner: string): Promise<bigint> // Max redeemable shares
  maxWithdraw(owner: string): Promise<bigint> // Max withdrawal amount
  previewDeposit(assets: bigint): Promise<bigint> // Preview shares received from deposit
  previewMint(shares: bigint): Promise<bigint> // Preview assets needed for mint
  previewRedeem(shares: bigint): Promise<bigint> // Preview assets from redeem
  previewWithdraw(assets: bigint): Promise<bigint> // Preview shares burned from withdraw

  // Write functions
  deposit(assets: bigint, receiver: string): Promise<string> // Deposit assets, return txHash
  mint(shares: bigint, receiver: string): Promise<string> // Mint shares, return txHash
  redeem(shares: bigint, receiver: string): Promise<string> // Redeem shares, return txHash
  withdraw(assets: bigint, receiver: string): Promise<string> // Withdraw assets, return txHash
}

// Aave Earn Vault Configuration
export interface VaultConfig {
  address: string // Vault contract address
  asset: string // Underlying asset address (e.g., USDC)
  assetDecimals: number
  symbol: string // e.g., "aEthUSDC"
  name: string // Human readable name
  chain: 'ethereum' | 'arbitrum' | 'polygon'
  apy: number // Current APY percentage
}

// Vault position details
export interface VaultPosition {
  vaultAddress: string
  walletAddress: string
  sharesBalance: bigint
  assetsValue: bigint
  yieldEarned: bigint
  feesCollected: bigint
  depositedAt: Date
  lastYieldSnapshot: Date
}

// Yield snapshot for tracking
export interface YieldSnapshot {
  vaultAddress: string
  walletAddress: string
  sharesBalance: bigint
  assetsValue: bigint
  yieldEarned: bigint
  fees: bigint // 10% of yield
  timestamp: Date
}
