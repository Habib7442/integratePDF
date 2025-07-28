# Clerk Webhook System for User Synchronization

This document describes the new Clerk webhook system that serves as the **single source of truth** for user creation and synchronization in the IntegratePDF application.

## Overview

The webhook system replaces all previous manual user sync mechanisms and ensures that user data is automatically synchronized between Clerk and Supabase whenever users sign up, update their profiles, or delete their accounts.

## Architecture

```
Clerk User Events → Webhook Endpoint → Supabase Database
     ↓                    ↓                    ↓
- user.created      /api/webhooks/clerk    users table
- user.updated           ↓                    ↓
- user.deleted      Verify signature    Create/Update/Delete
```

## Webhook Endpoint

**Location**: `/app/api/webhooks/clerk/route.ts`

### Supported Events

1. **`user.created`**: Automatically creates a new user record in Supabase when a user signs up
2. **`user.updated`**: Updates existing user data when profile information changes
3. **`user.deleted`**: Removes user data when an account is deleted

### Security

- Uses Clerk's `verifyWebhook()` function to validate webhook signatures
- Requires `CLERK_WEBHOOK_SIGNING_SECRET` environment variable
- Endpoint is public (no authentication required) but signature-verified

## Configuration

### Environment Variables

Add to your `.env.local`:

```env
# Clerk Webhook Configuration
CLERK_WEBHOOK_SIGNING_SECRET=whsec_your_webhook_signing_secret_here
```

### Clerk Dashboard Setup

1. Go to [Clerk Dashboard → Webhooks](https://dashboard.clerk.com/last-active?path=webhooks)
2. Click "Add Endpoint"
3. Set endpoint URL: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the signing secret to your environment variables

### Development Setup with ngrok

For local development:

1. Install and setup [ngrok](https://ngrok.com/)
2. Run your development server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok URL in Clerk webhook configuration: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`

## User Data Flow

### New User Registration

1. User signs up via Clerk
2. Clerk triggers `user.created` webhook
3. Webhook endpoint receives event and creates user in Supabase:
   ```sql
   INSERT INTO users (
     clerk_user_id,
     email,
     first_name,
     last_name,
     avatar_url,
     subscription_tier,
     documents_processed,
     monthly_limit
   ) VALUES (...)
   ```
4. User store fetches the created user data

### Profile Updates

1. User updates profile in Clerk
2. Clerk triggers `user.updated` webhook
3. Webhook endpoint updates user data in Supabase
4. Changes are reflected in the application

### Account Deletion

1. User deletes account in Clerk
2. Clerk triggers `user.deleted` webhook
3. Webhook endpoint removes user data from Supabase

## Benefits

✅ **Single Source of Truth**: Webhooks are the only mechanism for user creation/updates
✅ **No Race Conditions**: Eliminates duplicate user creation issues
✅ **Automatic Sync**: No manual intervention required
✅ **Real-time Updates**: Changes are reflected immediately
✅ **Reliable**: Built-in retry mechanism from Clerk
✅ **Secure**: Signature verification prevents unauthorized requests

## Removed Components

The following components were removed as part of this migration:

- `components/auth/user-sync.tsx` - Manual user sync component
- `hooks/use-supabase-clerk.ts` - useUserSync hook functionality
- `/api/user/sync` - Manual user sync endpoint
- Manual sync calls from store initialization
- Manual sync calls from document extraction

## Error Handling

### Webhook Failures

If a webhook fails:
1. Clerk automatically retries with exponential backoff
2. Check webhook logs in Clerk Dashboard
3. Verify signing secret is correct
4. Check server logs for detailed error information

### User Not Found Errors

If the application can't find a user:
1. User store waits up to 20 seconds for webhook processing
2. Shows appropriate error messages
3. Suggests refreshing the page or signing in again

## Testing

### Local Testing

1. Use ngrok to expose your local server
2. Configure webhook in Clerk Dashboard with ngrok URL
3. Sign up a new user to test `user.created` event
4. Update profile to test `user.updated` event

### Production Testing

1. Configure webhook with production URL
2. Monitor webhook delivery in Clerk Dashboard
3. Check application logs for successful processing

## Monitoring

### Webhook Logs

Monitor webhook delivery in:
- Clerk Dashboard → Webhooks → Your Endpoint → Attempts
- Application server logs
- Supabase logs (if needed)

### Key Metrics

- Webhook delivery success rate
- User creation success rate
- Time between webhook and user availability

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check endpoint URL is correct
   - Verify endpoint is publicly accessible
   - Check signing secret matches

2. **User creation failing**
   - Check Supabase connection
   - Verify database schema
   - Check for missing required fields

3. **Duplicate users**
   - Should not happen with webhook system
   - If it does, check for race conditions in application code

### Debug Steps

1. Check Clerk webhook logs
2. Check application server logs
3. Verify webhook signature validation
4. Test webhook endpoint manually
5. Check Supabase database directly

## Migration Notes

This system replaces the previous manual sync approach. Key changes:

- User creation is now handled exclusively by webhooks
- Application code waits for webhook-created users instead of creating them
- Removed all manual sync mechanisms to prevent conflicts
- Improved error handling and user feedback

## Security Considerations

- Webhook endpoint is public but signature-verified
- Uses service role for Supabase operations (bypasses RLS)
- Signing secret must be kept secure
- Monitor webhook logs for suspicious activity
