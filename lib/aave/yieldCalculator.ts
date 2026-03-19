// Yield Calculator
// Computes yield earned, fees collected, and remaining yield for vault positions

export interface YieldCalculation {
  previousValue: bigint
  currentValue: bigint
  yieldEarned: bigint // Total yield generated
  feesCollected: bigint // 10% of yield
  yieldAfterFees: bigint // 90% of yield (stays in vault)
  feePercentage: number // Always 10%
}

/**
 * Calculate yield and fees for a vault position
 * @param previousValue - Previous snapshot value
 * @param currentValue - Current vault position value
 * @returns Yield calculation breakdown
 */
export function calculateYield(
  previousValue: bigint,
  currentValue: bigint
): YieldCalculation {
  const FEE_PERCENTAGE = 10n // 10% fee
  const FEE_DIVISOR = 100n

  // Total yield is the difference
  const yieldEarned = currentValue > previousValue ? currentValue - previousValue : 0n

  // Calculate 10% fee
  const feesCollected = (yieldEarned * FEE_PERCENTAGE) / FEE_DIVISOR

  // Remaining yield stays in vault (compounds)
  const yieldAfterFees = yieldEarned - feesCollected

  return {
    previousValue,
    currentValue,
    yieldEarned,
    feesCollected,
    yieldAfterFees,
    feePercentage: 10,
  }
}

/**
 * Calculate projected yield over time
 * @param principal - Initial investment
 * @param apy - Annual percentage yield
 * @param months - Time period in months
 * @returns Projected balance after fees
 */
export function projectYield(
  principal: bigint,
  apy: number,
  months: number
): { projected: bigint; yield: bigint; fees: bigint } {
  // Convert to number for calculation
  const principalNum = Number(principal) / 1e18

  // Monthly rate
  const monthlyRate = apy / 100 / 12

  // Projected value after compounding
  const projectedNum = principalNum * Math.pow(1 + monthlyRate, months)

  // Yield earned
  const yieldNum = projectedNum - principalNum

  // 10% fee on yield
  const feesNum = yieldNum * 0.1

  return {
    projected: BigInt(Math.floor(projectedNum * 1e18)),
    yield: BigInt(Math.floor(yieldNum * 1e18)),
    fees: BigInt(Math.floor(feesNum * 1e18)),
  }
}

/**
 * Format yield values for display
 */
export function formatYield(
  value: bigint,
  decimals: number = 18
): string {
  const num = Number(value) / Math.pow(10, decimals)
  return num.toFixed(2)
}

/**
 * Calculate cumulative fees collected across all snapshots
 */
export function calculateCumulativeFees(
  snapshots: Array<{ feesCollected: bigint }>
): bigint {
  return snapshots.reduce((total, snap) => total + snap.feesCollected, 0n)
}

/**
 * Calculate total yield earned (before fees)
 */
export function calculateTotalYield(
  initialValue: bigint,
  currentValue: bigint
): bigint {
  return currentValue > initialValue ? currentValue - initialValue : 0n
}
