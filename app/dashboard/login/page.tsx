'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Wallet, Mail } from 'lucide-react'
import { connectWallet, getConnectedAddress } from '@/lib/walletConnector'
import { loadGoogleSignInScript, initializeGoogleSignIn, type GoogleSignInResponse } from '@/lib/googleAuth'
import { upsertGoogleUser, setGoogleAuthSession } from '@/app/actions/auth-actions'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingWallet, setIsCheckingWallet] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const address = await getConnectedAddress()
        if (address) {
          setWalletConnected(true)
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('[v0] Error checking wallet:', err)
      } finally {
        setIsCheckingWallet(false)
      }
    }

    checkWallet()
  }, [router])

  // Load and initialize Google Sign-In
  useEffect(() => {
    const loadGoogle = async () => {
      try {
        console.log('[v0] Fetching Google Client ID from endpoint...')
        // Fetch Client ID from server endpoint
        const response = await fetch('/api/config/google-client-id')
        console.log('[v0] Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('[v0] Failed to fetch Google Client ID:', errorData)
          return
        }

        const { clientId } = await response.json()
        console.log('[v0] Got Client ID:', clientId ? 'present' : 'empty')
        
        if (!clientId) {
          console.warn('[v0] Google Client ID is empty')
          return
        }

        console.log('[v0] Loading Google script...')
        await loadGoogleSignInScript(clientId)
        setGoogleScriptLoaded(true)
        
        // Initialize the Google Sign-In button
        initializeGoogleSignIn(
          'google-signin-button',
          clientId,
          handleGoogleSuccess,
          handleGoogleError
        )
      } catch (err) {
        console.error('[v0] Failed to load Google Sign-In:', err)
      }
    }

    loadGoogle()
  }, [])

  const handleConnectWallet = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await connectWallet()
      setWalletConnected(true)
      // Redirect to dashboard after successful connection
      router.push('/dashboard')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet'
      if (!errorMsg.includes('Redirecting')) {
        setError(errorMsg)
      }
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (response: GoogleSignInResponse) => {
    setIsLoading(true)
    setError(null)
    try {
      // Create or update user in database
      const user = await upsertGoogleUser(
        response.sub,
        response.email,
        response.name,
        response.picture
      )

      if (!user) {
        setError('Failed to create user account')
        setIsLoading(false)
        return
      }

      // Store auth session
      await setGoogleAuthSession(response.sub, response.email, response.name)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Google Sign-In failed'
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.')
    setIsLoading(false)
  }

  if (isCheckingWallet) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking wallet connection...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="bg-[#c4fa6b] p-2 rounded-lg">
              <span className="text-[#0a1628] font-bold text-lg">CV</span>
            </div>
            <span className="font-bold text-2xl text-foreground">CashVault</span>
          </Link>
          <p className="text-muted-foreground text-sm">Track your crypto savings and investments</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader>
            <CardTitle>Access Your Dashboard</CardTitle>
            <CardDescription>
              Connect your wallet to manage your DCA plans and track holdings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Wallet Connection */}
            <Button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 shadow-sm flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In */}
            {googleScriptLoaded && (
              <div id="google-signin-button" className="w-full"></div>
            )}

            {!googleScriptLoaded && (
              <Button disabled variant="outline" className="w-full h-11">
                <Mail className="w-4 h-4 mr-2" />
                Loading Google Sign-In...
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground space-y-2">
              <div>Connect securely using your wallet or Google account.</div>
              <div>No passwords. Your choice of authentication.</div>
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
