/**
 * Lightweight authentication check that doesn't require ethers
 * Used by dashboard to check both wallet and Google auth without import issues
 */

export async function getAuthIdentifier(): Promise<string | null> {
  try {
    // Check for Google auth session first (no deps needed)
    const googleSession = localStorage.getItem('cashvault_auth')
    if (googleSession) {
      try {
        const session = JSON.parse(googleSession)
        if (session.email) {
          return session.email
        }
      } catch (e) {
        // Invalid session, continue
      }
    }

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
