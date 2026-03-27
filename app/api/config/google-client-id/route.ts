export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_Google_Client_ID

  if (!clientId) {
    return Response.json({ error: "Google Client ID not configured" }, { status: 500 })
  }

  return Response.json({ clientId })
}
