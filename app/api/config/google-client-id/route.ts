export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_Google_Client_ID

  console.log('[v0] Google Client ID env var:', clientId ? 'present' : 'missing')
  console.log('[v0] All env vars with Google:', Object.keys(process.env).filter(k => k.includes('Google')))

  if (!clientId) {
    return Response.json({ error: "Google Client ID not configured", clientId: null }, { status: 500 })
  }

  return Response.json({ clientId })
}
