# CashVault Dashboard - Setup Guide

## Environment Variables Required

To complete the Google OAuth integration and run the dashboard, you need to configure the following environment variables in your Vercel project settings:

### Google OAuth Credentials

1. **NEXT_PUBLIC_GOOGLE_CLIENT_ID** (Public)
   - From Google Cloud Console OAuth 2.0 credentials
   - Used on the client side for the login button

2. **GOOGLE_CLIENT_SECRET** (Secret)
   - From Google Cloud Console OAuth 2.0 credentials
   - Used server-side to exchange authorization code for tokens
   - NEVER expose this publicly

3. **NEXT_PUBLIC_GOOGLE_REDIRECT_URI** (Public)
   - Your callback URL: `https://your-domain.com/auth/callback`
   - Must match exactly what's configured in Google Cloud Console
   - Example: `https://cashvault.vercel.app/auth/callback`

4. **NEXT_PUBLIC_APP_URL** (Public)
   - Your application's base URL
   - Example: `https://cashvault.vercel.app`

### Existing Requirements

The following should already be configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## How to Set Up Google OAuth

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named "CashVault"

### Step 2: Enable OAuth 2.0
1. Go to APIs & Services → OAuth consent screen
2. Select "External" user type
3. Fill in the app name: "CashVault"
4. Add your email as a test user

### Step 3: Create OAuth Credentials
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Select "Web application"
4. Add authorized redirect URIs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
5. Copy the Client ID and Client Secret

### Step 4: Add to Vercel
1. Go to your Vercel project settings → Environment Variables
2. Add each variable from Google Cloud:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: (paste Client ID)
   - `GOOGLE_CLIENT_SECRET`: (paste Client Secret)
   - `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`: `https://your-domain.com/auth/callback`
   - `NEXT_PUBLIC_APP_URL`: `https://your-domain.com`

3. Redeploy your application

## Testing Locally

For local development, add these to your `.env.local`:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Flow After Setup

1. User clicks "Continue with Google" on `/login`
2. Redirects to Google OAuth consent screen
3. User approves and is redirected to `/auth/callback?code=...`
4. Backend exchanges code for tokens
5. User profile created in `public.users` table
6. Session cookie set (HTTP-only, secure)
7. Redirect to `/dashboard`
8. Dashboard fetches user's active DCA plans and displays them with holdings pie chart

## Troubleshooting

### "No code provided" error
- Check that `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` matches exactly in Google Cloud Console

### "Schema auth does not exist"
- Already fixed - the users table uses `gen_random_uuid()` instead

### Redirect loop on login
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- Check session cookie is being set properly

### DCA plans not showing
- Verify `dca_plans` table has `user_id` column (if not, you may need to add it via migration)
- Check that plans have `is_active = true`
