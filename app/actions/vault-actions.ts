// Server Actions for Vault Operations
// Handles auto-deposit, yield sync, withdrawals, and fee collection

'use server'

import { createClient } from '@/lib/supabase/server'
import { AaveVaultClient, AAVE_VAULTS } from '@/lib/aave/vaultClient'
import { calculateYield, calculateCumulativeFees } from '@/lib/aave/yieldCalculator'
import type { VaultPosition } from '@/lib/aave/erc4626Interface'

const DEPOSIT_THRESHOLD = 100 // $100 minimum before auto-deposit
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000'

/**
 * Auto-deposit DCA holdings to Aave vault when threshold is reached
 */
export async function autoDepositToVault(
  dcaPlanId: number,
  userEmail: string,
  assetSymbol: string,
  fundedAmount: number
): Promise<{ success: boolean; vaultAddress?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if funded amount meets threshold
    if (fundedAmount < DEPOSIT_THRESHOLD) {
      return {
        success: false,
        error: `Minimum deposit threshold is $${DEPOSIT_THRESHOLD}`,
      }
    }

    // Find appropriate vault for asset
    const vault = Object.values(AAVE_VAULTS).find((v) =>
      v.symbol.toUpperCase().includes(assetSymbol.toUpperCase())
    )

    if (!vault) {
      return {
        success: false,
        error: `No vault available for ${assetSymbol}`,
      }
    }

    console.log('[v0] Auto-depositing to vault:', vault.address, 'Amount:', fundedAmount)

    // Create vault position record
    const { data: positionData, error: positionError } = await supabase
      .from('vault_positions')
      .insert({
        user_email: userEmail,
        vault_address: vault.address,
        asset_symbol: assetSymbol,
        principal_amount: fundedAmount,
        shares_balance: '0', // Will be updated after on-chain deposit
        total_assets_value: fundedAmount.toString(),
        yield_earned: '0',
        fees_collected: '0',
        deposited_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (positionError) {
      console.error('[v0] Error creating vault position:', positionError)
      return { success: false, error: 'Failed to create vault position' }
    }

    // Update DCA plan with vault reference
    const { error: updateError } = await supabase
      .from('dca_plans')
      .update({
        vault_enabled: true,
        vault_position_id: positionData.id,
      })
      .eq('id', dcaPlanId)

    if (updateError) {
      console.error('[v0] Error updating DCA plan:', updateError)
      return { success: false, error: 'Failed to link vault to DCA plan' }
    }

    console.log('[v0] Vault position created and linked:', positionData.id)

    return {
      success: true,
      vaultAddress: vault.address,
    }
  } catch (error) {
    console.error('[v0] Auto-deposit error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Sync vault yields and record snapshots
 */
export async function syncVaultYield(
  vaultPositionId: number,
  userEmail: string
): Promise<{ success: boolean; yieldEarned?: string; fees?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Get vault position
    const { data: position, error: posError } = await supabase
      .from('vault_positions')
      .select('*')
      .eq('id', vaultPositionId)
      .single()

    if (posError || !position) {
      return { success: false, error: 'Vault position not found' }
    }

    console.log('[v0] Syncing vault yield for position:', vaultPositionId)

    // Get current position from Aave vault
    const currentPosition = await AaveVaultClient.getPosition(
      position.vault_address,
      userEmail
    )

    if (!currentPosition) {
      return { success: false, error: 'Failed to fetch vault position from Aave' }
    }

    // Calculate yield since last snapshot
    const previousValue = BigInt(position.total_assets_value || '0')
    const currentValue = currentPosition.assetsValue
    const yieldCalc = calculateYield(previousValue, currentValue)

    console.log('[v0] Yield calculation:', {
      previous: previousValue.toString(),
      current: currentValue.toString(),
      earned: yieldCalc.yieldEarned.toString(),
      fees: yieldCalc.feesCollected.toString(),
    })

    // Record yield snapshot
    const { error: snapshotError } = await supabase
      .from('vault_yield_history')
      .insert({
        vault_position_id: vaultPositionId,
        user_email: userEmail,
        vault_address: position.vault_address,
        asset_symbol: position.asset_symbol,
        shares_balance: currentPosition.sharesBalance.toString(),
        total_assets_value: currentValue.toString(),
        yield_earned: yieldCalc.yieldEarned.toString(),
        fees_collected: yieldCalc.feesCollected.toString(),
        fee_percentage: 10,
        snapshot_date: new Date().toISOString(),
      })

    if (snapshotError) {
      console.error('[v0] Error recording yield snapshot:', snapshotError)
      return { success: false, error: 'Failed to record yield snapshot' }
    }

    // Update vault position with new totals
    const totalYield = (BigInt(position.yield_earned) + yieldCalc.yieldEarned).toString()
    const totalFees = (BigInt(position.fees_collected) + yieldCalc.feesCollected).toString()

    const { error: updateError } = await supabase
      .from('vault_positions')
      .update({
        total_assets_value: currentValue.toString(),
        shares_balance: currentPosition.sharesBalance.toString(),
        yield_earned: totalYield,
        fees_collected: totalFees,
        last_yield_sync: new Date().toISOString(),
      })
      .eq('id', vaultPositionId)

    if (updateError) {
      console.error('[v0] Error updating vault position:', updateError)
      return { success: false, error: 'Failed to update vault position' }
    }

    return {
      success: true,
      yieldEarned: yieldCalc.yieldEarned.toString(),
      fees: yieldCalc.feesCollected.toString(),
    }
  } catch (error) {
    console.error('[v0] Yield sync error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get user's vault positions and yields
 */
export async function getUserVaultPositions(userEmail: string): Promise<VaultPosition[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('vault_positions')
      .select('*')
      .eq('user_email', userEmail)
      .order('deposited_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching vault positions:', error)
      return []
    }

    return (data || []).map((position) => ({
      vaultAddress: position.vault_address,
      walletAddress: userEmail,
      sharesBalance: BigInt(position.shares_balance || '0'),
      assetsValue: BigInt(position.total_assets_value || '0'),
      yieldEarned: BigInt(position.yield_earned || '0'),
      feesCollected: BigInt(position.fees_collected || '0'),
      depositedAt: new Date(position.deposited_at),
      lastYieldSnapshot: new Date(position.last_yield_sync || position.deposited_at),
    }))
  } catch (error) {
    console.error('[v0] Error getting vault positions:', error)
    return []
  }
}

/**
 * Collect fees (treasury operation)
 */
export async function collectVaultFees(vaultPositionId: number): Promise<{ success: boolean; fees?: string }> {
  try {
    const supabase = await createClient()

    const { data: position } = await supabase
      .from('vault_positions')
      .select('fees_collected')
      .eq('id', vaultPositionId)
      .single()

    if (!position || !position.fees_collected) {
      return { success: false }
    }

    console.log('[v0] Fees collected:', position.fees_collected)

    // In production, would transfer fees to treasury wallet
    // For now, just log the collection

    return {
      success: true,
      fees: position.fees_collected,
    }
  } catch (error) {
    console.error('[v0] Fee collection error:', error)
    return { success: false }
  }
}
