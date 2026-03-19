'use server'

import { createClient } from "@/lib/supabase/server";
import { getVaultAddressForAsset, isSupportedAsset } from "./vaultRegistry";
import { MIN_DEPOSIT_AMOUNT } from "./config";

export interface VaultPosition {
  id: string;
  dca_plan_id: string;
  wallet_address: string;
  vault_address: string;
  underlying_asset: string;
  principal_deposited: number;
  yield_earned: number;
  yield_claimed_by_protocol: number;
  deposited_at: Date;
  last_synced_at: Date;
}

/**
 * Create a new vault position when DCA reaches threshold
 * @param dcaPlanId - DCA plan ID
 * @param walletAddress - User's wallet address
 * @param asset - Token symbol
 * @param amount - Amount to deposit
 * @returns Created vault position or null if error
 */
export async function createVaultPosition(
  dcaPlanId: string,
  walletAddress: string,
  asset: string,
  amount: number
): Promise<VaultPosition | null> {
  try {
    // Check if asset is supported
    if (!isSupportedAsset(asset)) {
      console.error("[v0] Asset not supported:", asset);
      return null;
    }

    // Check if amount meets minimum
    if (amount < MIN_DEPOSIT_AMOUNT) {
      console.error("[v0] Amount below minimum deposit:", amount);
      return null;
    }

    const vaultAddress = getVaultAddressForAsset(asset);
    if (!vaultAddress) {
      console.error("[v0] Could not find vault address for:", asset);
      return null;
    }

    const supabase = await createClient();

    // Create vault position record
    const { data, error } = await supabase
      .from("vault_positions")
      .insert({
        dca_plan_id: dcaPlanId,
        wallet_address: walletAddress,
        vault_address: vaultAddress,
        underlying_asset: asset,
        principal_deposited: amount,
        shares_balance: 0, // Will be updated after actual deposit
        yield_earned: 0,
        yield_claimed_by_protocol: 0,
        deposited_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      console.error("[v0] Failed to create vault position:", error);
      return null;
    }

    console.log("[v0] Created vault position:", data.id, "for asset:", asset);
    return data as VaultPosition;
  } catch (error) {
    console.error("[v0] Error creating vault position:", error);
    return null;
  }
}

/**
 * Get all active vault positions for a user
 * @param walletAddress - User's wallet address
 * @returns Array of vault positions
 */
export async function getUserVaultPositions(walletAddress: string): Promise<VaultPosition[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("vault_positions")
      .select("*")
      .eq("wallet_address", walletAddress)
      .is("withdrawn_at", null) // Only active positions
      .order("deposited_at", { ascending: false });

    if (error) {
      console.error("[v0] Failed to fetch vault positions:", error);
      return [];
    }

    return (data || []) as VaultPosition[];
  } catch (error) {
    console.error("[v0] Error fetching vault positions:", error);
    return [];
  }
}

/**
 * Mark a vault position as withdrawn
 * @param vaultPositionId - Position ID
 * @returns true if successful
 */
export async function markVaultPositionWithdrawn(vaultPositionId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("vault_positions")
      .update({
        withdrawn_at: new Date().toISOString(),
      })
      .eq("id", vaultPositionId);

    if (error) {
      console.error("[v0] Failed to mark vault position as withdrawn:", error);
      return false;
    }

    console.log("[v0] Marked vault position as withdrawn:", vaultPositionId);
    return true;
  } catch (error) {
    console.error("[v0] Error marking vault position as withdrawn:", error);
    return false;
  }
}

/**
 * Update vault position share balance after deposit
 * @param vaultPositionId - Position ID
 * @param sharesBalance - New shares balance
 * @returns true if successful
 */
export async function updateVaultSharesBalance(vaultPositionId: string, sharesBalance: bigint): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("vault_positions")
      .update({
        shares_balance: sharesBalance.toString(),
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", vaultPositionId);

    if (error) {
      console.error("[v0] Failed to update vault shares balance:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[v0] Error updating vault shares balance:", error);
    return false;
  }
}
