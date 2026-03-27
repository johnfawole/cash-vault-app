'use client'

declare global {
  interface Window {
    google: any
  }
}

export interface GoogleSignInResponse {
  email: string
  name: string
  picture: string
  sub: string // Google's unique ID
}

/**
 * Load Google Sign-In script
 */
export function loadGoogleSignInScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
    document.head.appendChild(script)
  })
}

/**
 * Initialize Google Sign-In button
 */
export function initializeGoogleSignIn(
  elementId: string,
  clientId: string,
  onSuccess: (response: GoogleSignInResponse) => void,
  onError: () => void
): void {
  if (!window.google) {
    throw new Error('Google Sign-In script not loaded')
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: any) => {
      if (response.credential) {
        // Decode JWT to get user info
        const decoded = JSON.parse(atob(response.credential.split('.')[1]))
        onSuccess({
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          sub: decoded.sub,
        })
      }
    },
    error_callback: onError,
  })

  window.google.accounts.id.renderButton(document.getElementById(elementId), {
    theme: 'outline',
    size: 'large',
    width: '100%',
  })
}

/**
 * Decode Google JWT token
 */
export function decodeGoogleToken(token: string): GoogleSignInResponse {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]))
    return {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      sub: decoded.sub,
    }
  } catch (error) {
    throw new Error('Invalid Google token')
  }
}
