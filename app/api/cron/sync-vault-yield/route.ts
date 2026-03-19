import { createClient } from "@/lib/supabase/server";
import { syncVaultYieldFromBlockchain } from "@/lib/aave/yieldTracker";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[v0] Starting vault yield sync cron job");

    const supabase = await createClient();

    // Get all active vault positions
    const { data: positions, error } = await supabase
      .from("vault_positions")
      .select("*")
      .is("withdrawn_at", null);

    if (error) {
      console.error("[v0] Failed to fetch vault positions:", error);
      return Response.json({ error: "Failed to fetch positions" }, { status: 500 });
    }

    if (!positions || positions.length === 0) {
      console.log("[v0] No active vault positions to sync");
      return Response.json({ message: "No positions to sync", count: 0 });
    }

    // Sync yield for each position
    let successCount = 0;
    let failureCount = 0;

    for (const position of positions) {
      const result = await syncVaultYieldFromBlockchain(position.id);
      if (result) {
        successCount++;
        console.log(`[v0] Synced yield for position ${position.id}:`, result);
      } else {
        failureCount++;
        console.error(`[v0] Failed to sync yield for position ${position.id}`);
      }
    }

    console.log(`[v0] Vault yield sync complete. Success: ${successCount}, Failed: ${failureCount}`);

    return Response.json({
      message: "Vault yield sync completed",
      total: positions.length,
      success: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error("[v0] Unexpected error in cron job:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
