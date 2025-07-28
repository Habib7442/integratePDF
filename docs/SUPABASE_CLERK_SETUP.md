# Supabase-Clerk Integration Setup Guide

This guide will help you set up the official Supabase-Clerk integration for automatic user synchronization and improved performance.

## Prerequisites

- ✅ Clerk account with your application configured
- ✅ Supabase project created
- ✅ Environment variables configured in `.env.local`

## Step 1: Configure Clerk JWT Template

1. **Go to Clerk Dashboard** → Your Application → JWT Templates
2. **Create a new template** with the name: `supabase`
3. **Set the template content** to:

```json
{
  "aud": "authenticated",
  "exp": {{exp}},
  "iat": {{iat}},
  "iss": "https://{{domain}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "phone": "{{user.primary_phone_number.phone_number}}",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {
    "first_name": "{{user.first_name}}",
    "last_name": "{{user.last_name}}",
    "full_name": "{{user.full_name}}",
    "avatar_url": "{{user.image_url}}"
  }
}
```

4. **Save the template**

## Step 2: Configure Supabase Authentication

1. **Go to Supabase Dashboard** → Authentication → Providers
2. **Enable Third Party Auth** and find **Clerk**
3. **Configure Clerk provider**:
   - **Enabled**: ✅ Yes
   - **Domain**: Your Clerk domain (e.g., `advanced-primate-11.clerk.accounts.dev`)
   - **JWT Verification Key**: Get this from Clerk Dashboard → API Keys → JWT Verification Key

## Step 3: Set Up Row Level Security (RLS)

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run the RLS policies script**:
   - Copy the content from `supabase/rls-policies.sql`
   - Paste and execute in the SQL Editor

## Step 4: Verify Environment Variables

Ensure your `.env.local` contains:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# JWT Template Name for Clerk-Supabase Integration
CLERK_JWT_TEMPLATE_NAME=supabase
```

## Step 5: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test user registration**:
   - Go to `/sign-up`
   - Create a new account
   - Check Supabase Dashboard → Authentication → Users
   - Verify the user appears in both Clerk and Supabase

3. **Test user data sync**:
   - Sign in with the new account
   - Go to `/dashboard`
   - Check Supabase Dashboard → Table Editor → users
   - Verify user profile data is populated

## How It Works

### Automatic User Sync
- When a user signs up/signs in via Clerk, the `UserSync` component automatically creates/updates their profile in Supabase
- User data flows: **Clerk** → **JWT Token** → **Supabase RLS** → **Database**

### Authentication Flow
1. User authenticates with Clerk
2. Clerk generates a JWT token using the `supabase` template
3. The JWT token contains user information and is sent to Supabase
4. Supabase validates the JWT and applies RLS policies
5. User can only access their own data

### Performance Benefits
- ✅ **No webhook delays** - immediate user sync
- ✅ **Automatic token refresh** - seamless authentication
- ✅ **RLS security** - built-in data isolation
- ✅ **Reduced API calls** - direct Supabase integration

## Troubleshooting

### User Not Created in Supabase
1. Check Clerk JWT template is named `supabase`
2. Verify Supabase Clerk provider is configured correctly
3. Check browser console for sync errors
4. Ensure RLS policies are applied

### Authentication Errors
1. Verify environment variables are correct
2. Check Clerk domain matches in Supabase
3. Ensure JWT template includes required fields
4. Test with a fresh browser session

### RLS Policy Issues
1. Re-run the RLS policies SQL script
2. Check that tables have RLS enabled
3. Verify the `get_current_user_id()` function exists
4. Test with Supabase SQL editor

## Migration from Webhooks

If you were previously using webhooks:

1. ✅ **Webhook code removed** - `app/api/webhooks/clerk/route.ts` deleted
2. ✅ **User resolution simplified** - no more complex retry logic
3. ✅ **API routes updated** - now use RLS instead of service role
4. ✅ **Performance improved** - direct integration is faster

## Security Notes

- 🔒 **RLS enforced** - users can only access their own data
- 🔒 **JWT validation** - Supabase validates all tokens
- 🔒 **No service role exposure** - client uses anon key with RLS
- 🔒 **Automatic token refresh** - handled by Clerk SDK

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase logs in the Dashboard
3. Test authentication with a fresh user account
4. Ensure all environment variables are set correctly
