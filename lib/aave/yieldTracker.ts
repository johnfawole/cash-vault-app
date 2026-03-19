'use server'

import { createClient } from "@/lib/supabase/server";
import { aaveClient } from "./config";
import { getVaultAddressForAsset } from "./vaultRegistry";

export interface VaultYieldData {
  yieldEarned: number;
  protocolFeeCollected: number;
  userYieldKeep: number;
  timestamp: Date;
}

/**
 * Calculate yield and fees for a vault position
 * @param principal - Amount initially deposited (in base units)
 * @param currentBalance - Current balance in vault (in base units)
 * @param decimals - Token decimals for proper unit conversion
 * @returns Yield data with fee breakdown
 */
export function calculateYieldAndFees(
  principal: bigint,
  currentBalance: bigint,
  decimals: number = 18
): VaultYieldData {
  const yieldBigInt = currentBalance - principal;
  const yieldEarned = Number(yieldBigInt) / Math.pow(10, decimals);

  // 10% fee goes to protocol
  const protocolFeeCollected = yieldEarned * 0.1;

  // 90% stays with user (compounded in vault)
  const userYieldKeep = yieldEarned * 0.9;

  return {
    yieldEarned,
    protocolFeeCollected,
    userYieldKeep,
    timestamp: new Date(),
  };
}

/**
 * Sync yield data for a vault position from blockchain
 * @param vaultPositionId - Position ID in database
 * @returns Updated yield data or null if error
 */
export async function syncVaultYieldFromBlockchain(vaultPositionId: string): Promise<VaultYieldData | null> {
  try {
    const supabase = await createClient();

    // Get vault position details
    const { data: position, error: positionError } = await supabase
      .from("vault_positions")
      .select("*")
      .eq("id", vaultPositionId)
      .single();

    if (positionError || !position) {
      console.error("[v0] Failed to fetch vault position:", positionError);
      return null;
    }

    // Get vault address for the asset
    const vaultAddress = getVaultAddressForAsset(position.underlying_asset);
    if (!vaultAddress) {
      console.error("[v0] No vault found for asset:", position.underlying_asset);
      return null;
    }

    // Query Aave to get current vault balance using AaveKit
    // Note: This is a placeholder - actual implementation depends on AaveKit vault query actions
    // Once Aave releases vault query actions, update this to fetch:
    // - Current balance of user's shares
    // - Share price to convert to base asset
    console.log("[v0] Syncing vault yield for:", position.underlying_asset);

    // Calculate yield based on current balance vs principal
    const yieldData = calculateYieldAndFees(
      BigInt(position.principal_deposited),
      BigInt(position.current_balance || position.principal_deposited),
      position.decimals || 18
    );

    // Update database with new yield information
    const { error: updateError } = await supabase
      .from("vault_positions")
      .update({
        yield_earned: position.yield_earned + yieldData.yieldEarned,
        yield_claimed_by_protocol: position.yield_claimed_by_protocol + yieldData.protocolFeeCollected,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", vaultPositionId);

    if (updateError) {
      console.error("[v0] Failed to update vault position yield:", updateError);
      return null;
    }

    // Record in yield history
    const { error: historyError } = await supabase
      .from("vault_yield_history")
      .insert({
        vault_position_id: vaultPositionId,
        yield_before: position.yield_earned,
        yield_after: position.yield_earned + yieldData.yieldEarned,
        protocol_fee_collected: yieldData.protocolFeeCollected,
        timestamp: new Date().toISOString(),
      });

    if (historyError) {
      console.error("[v0] Failed to record yield history:", historyError);
    }

    return yieldData;
  } catch (error) {
    console.error("[v0] Error syncing vault yield:", error);
    return null;
  }
}

/**
 * Get all yield data for a user's vault positions
 * @param walletAddress - User's wallet address
 * @returns Array of yield data for each position
 */
export async function getUserVaultYieldStats(walletAddress: string) {
  try {
    const supabase = await createClient();

    const { data: positions, error } = await supabase
      .from("vault_positions")
      .select("*")
      .eq("wallet_address", walletAddress)
      .is("withdrawn_at", null); // Only active positions

    if (error || !positions) {
      console.error("[v0] Failed to fetch vault positions:", error);
      return null;
    }

    const totalYieldEarned = positions.reduce((sum, p) => sum + (p.yield_earned || 0), 0);
    const totalFeeCollected = positions.reduce((sum, p) => sum + (p.yield_claimed_by_protocol || 0), 0);
    const netGain = totalYieldEarned - totalFeeCollected;

    return {
      totalYieldEarned,
      totalFeeCollected,
      netGain,
      activePositions: positions.length,
      positions,
    };
  } catch (error) {
    console.error("[v0] Error fetching vault yield stats:", error);
    return null;
  }
}
