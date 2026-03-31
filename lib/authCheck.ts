/**
 * Lightweight authentication check for wallet connection
 */

export async function getAuthIdentifier(): Promise<string | null> {
  try {
    // Check for wallet connection using dynamic import to avoid build issues
    try {
      const { getConnectedAddress } = await import('@/lib/walletConnector')
      const address = await getConnectedAddress()
      if (address) {
        return address
      }
    } catch (e) {
      // Wallet connector not available, continue
    }

    return null
  } catch (error) {
    console.error('[v0] Error in getAuthIdentifier:', error)
    return null
  }
}
