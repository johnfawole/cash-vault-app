// Contract addresses and configuration
export const SAFE_LOCK_VAULT_ADDRESS = '0x8a1125751ECc759EC506Ad5aD7E0bb3F95e967DF' as const;
// IMPORTANT: Set your actual DCA Investment contract address via NEXT_PUBLIC_DCA_INVESTMENT_ADDRESS env var
export const DCA_INVESTMENT_ADDRESS = (process.env.NEXT_PUBLIC_DCA_INVESTMENT_ADDRESS || '0x0000000000000000000000000000000000000000') as const;
export const BASE_CHAIN_ID = 8453;

// USDC on Base
export const USDC_ADDRESS_BASE = '0x833589fCD6eDb6E08f4c7C32A07a5DAC5f3E7DaC' as const;

// Contract interaction utilities
export const formatDurationInSeconds = (months: number): bigint => {
  // Convert months to seconds (approximately 30 days per month)
  return BigInt(months * 30 * 24 * 60 * 60);
};

export const formatDCAFrequency = (frequency: string): number => {
  // Convert frequency to seconds
  const frequencies: { [key: string]: number } = {
    'daily': 24 * 60 * 60,
    'weekly': 7 * 24 * 60 * 60,
    'monthly': 30 * 24 * 60 * 60,
  };
  return frequencies[frequency] || 7 * 24 * 60 * 60; // default to weekly
};

export const formatUSDC = (amount: string): bigint => {
  // USDC has 6 decimals
  const parts = amount.split('.');
  const whole = parts[0] || '0';
  const decimal = parts[1] || '0';
  
  // Pad decimal to 6 places
  const paddedDecimal = decimal.padEnd(6, '0').slice(0, 6);
  
  return BigInt(whole + paddedDecimal);
};

export const parseUSDC = (amount: bigint): string => {
  // USDC has 6 decimals
  const amountStr = amount.toString().padStart(6, '0');
  const whole = amountStr.slice(0, -6) || '0';
  const decimal = amountStr.slice(-6).padStart(6, '0');
  
  return `${whole}.${decimal}`;
};
