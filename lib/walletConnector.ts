import { ethers } from 'ethers'

export interface WalletConnectionResult {
  address: string
  provider: ethers.BrowserProvider
  signer: ethers.Signer
}

/**
 * Modern wallet connection that works across desktop and mobile browsers
 * without requiring redirects or in-app browsers.
 * 
 * Desktop: Uses injected MetaMask provider
 * Mobile: Uses injected provider (works when user opens via wallet app or WalletConnect)
 */
export async function connectWallet(): Promise<WalletConnectionResult> {
  // Step 1: Check if MetaMask/Web3 wallet is available
  if (!window.ethereum) {
    throw new Error(
      'No Web3 wallet found. Please install MetaMask or open this site through a Web3-enabled wallet.'
    )
  }

  try {
    // Step 2: Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from wallet')
    }

    const address = accounts[0].toLowerCase()
    console.log('[v0] Wallet connected:', address)

    // Step 3: Create ethers provider from injected ethereum
    const provider = new ethers.BrowserProvider(window.ethereum)

    // Step 4: Get signer
    const signer = await provider.getSigner()

    return {
      address,
      provider,
      signer,
    }
  } catch (error: any) {
    // User rejected the request
    if (error.code === 4001) {
      throw new Error('Connection rejected. Please approve the connection in your wallet.')
    }

    // Other errors
    throw new Error(`Wallet connection failed: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Get the currently connected wallet address without prompting
 */
export async function getConnectedAddress(): Promise<string | null> {
  if (!window.ethereum) {
    return null
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    })

    if (accounts && accounts.length > 0) {
      return accounts[0].toLowerCase()
    }

    return null
  } catch (err) {
    console.error('[v0] Error getting connected address:', err)
    return null
  }
}

/**
 * Switch to Base network, adding it if necessary
 */
export async function switchToBaseNetwork(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet found')
  }

  const BASE_CHAIN_ID = 8453

  try {
    // Try to switch to Base
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + BASE_CHAIN_ID.toString(16) }],
    })

    console.log('[v0] Switched to Base network')
  } catch (error: any) {
    // Chain not added, so add it
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x' + BASE_CHAIN_ID.toString(16),
              chainName: 'Base',
              rpcUrls: ['https://mainnet.base.org', 'https://base.publicrpc.com'],
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://basescan.org'],
            },
          ],
        })

        console.log('[v0] Added Base network to wallet')
      } catch (addError) {
        throw new Error('Failed to add Base network to wallet')
      }
    } else {
      throw new Error('Failed to switch to Base network')
    }
  }
}

/**
 * Watch for wallet connection changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!window.ethereum) return () => {}

  const handler = (accounts: string[]) => {
    callback(accounts)
  }

  window.ethereum.on('accountsChanged', handler)

  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('accountsChanged', handler)
  }
}

/**
 * Watch for network changes
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!window.ethereum) return () => {}

  const handler = (chainId: string) => {
    callback(chainId)
  }

  window.ethereum.on('chainChanged', handler)

  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('chainChanged', handler)
  }
}
