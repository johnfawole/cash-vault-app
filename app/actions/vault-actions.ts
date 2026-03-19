'use server'

import { createClient } from "@/lib/supabase/server";
import { getVaultAddressForAsset, isSupportedAsset } from "@/lib/aave/vaultRegistry";
import { MIN_DEPOSIT_AMOUNT, PROTOCOL_FEE_PERCENT } from "@/lib/aave/config";

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
 * Get all vault positions for a wallet
 */
export async function getUserVaultPositions(walletAddress: string): Promise<VaultPosition[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("vault_positions")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("deposited_at", { ascending: false });

    if (error) {
      console.warn("[v0] Error fetching vault positions:", error.message);
      return [];
    }

    return (data || []).map((position) => ({
      ...position,
      deposited_at: new Date(position.deposited_at),
      last_synced_at: new Date(position.last_synced_at),
    }));
  } catch (error) {
    console.error("[v0] Failed to fetch vault positions:", error);
    return [];
  }
}

/**
 * Create a new vault position when DCA reaches threshold
 * Note: Actual deposit transaction happens on frontend via wallet
 */
export async function createVaultPosition(
  dcaPlanId: string,
  walletAddress: string,
  asset: string,
  amount: number
): Promise<VaultPosition | null> {
  try {
    // Validate inputs
    if (!isSupportedAsset(asset)) {
      console.error("[v0] Asset not supported:", asset);
      return null;
    }

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
        yield_earned: 0,
        yield_claimed_by_protocol: 0,
        deposited_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[v0] Error creating vault position:", error.message);
      return null;
    }

    return {
      ...data,
      deposited_at: new Date(data.deposited_at),
      last_synced_at: new Date(data.last_synced_at),
    };
  } catch (error) {
    console.error("[v0] Failed to create vault position:", error);
    return null;
  }
}

/**
 * Update yield for a vault position
 * Called by cron job to sync on-chain yield data
 */
export async function updateVaultYield(
  positionId: string,
  totalYield: number
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const protocolFee = totalYield * (PROTOCOL_FEE_PERCENT / 100);
    const userYield = totalYield - protocolFee;

    const { error } = await supabase
      .from("vault_positions")
      .update({
        yield_earned: userYield,
        yield_claimed_by_protocol: protocolFee,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", positionId);

    if (error) {
      console.error("[v0] Error updating vault yield:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[v0] Failed to update vault yield:", error);
    return false;
  }
}

/**
 * Record yield history snapshot
 */
export async function recordYieldHistory(
  positionId: string,
  yieldEarned: number,
  protocolFee: number
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("vault_yield_history").insert({
      vault_position_id: positionId,
      yield_amount: yieldEarned,
      protocol_fee: protocolFee,
      recorded_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[v0] Error recording yield history:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[v0] Failed to record yield history:", error);
    return false;
  }
}
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
