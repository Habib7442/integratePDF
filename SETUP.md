# IntegratePDF - Clerk + Supabase Setup Guide

This guide will walk you through setting up Clerk authentication with Supabase database integration for the IntegratePDF application.

## Prerequisites

- Node.js 18+ installed
- A Clerk account (https://clerk.com)
- A Supabase account (https://supabase.com)

## Step 1: Supabase Setup

### 1.1 Create a New Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `integratepdf`
5. Enter a secure database password
6. Choose a region close to your users
7. Click "Create new project"

### 1.2 Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/schema.sql` from this project
3. Paste it into the SQL Editor and run it
4. This will create all necessary tables, RLS policies, and storage buckets

### 1.3 Get Supabase Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## Step 2: Clerk Setup

### 2.1 Configure Clerk Project

1. Go to your Clerk dashboard (https://dashboard.clerk.com)
2. Select your project or create a new one
3. Go to "JWT Templates" in the sidebar
4. Click "New template"
5. Choose "Supabase" as the template type
6. Name it `supabase`
7. The template should automatically configure the correct claims

### 2.2 Set Up Webhooks

1. In Clerk dashboard, go to "Webhooks"
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/clerk`
4. Select these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the webhook secret

### 2.3 Get Clerk Credentials

1. Go to "API Keys" in your Clerk dashboard
2. Copy the following values:
   - Publishable key
   - Secret key

## Step 3: Environment Variables

Update your `.env.local` file with the actual values:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Template Name for Clerk-Supabase Integration
CLERK_JWT_TEMPLATE_NAME=supabase

# Optional: For file uploads
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents
```

## Step 4: Configure Supabase Auth

### 4.1 Set Up JWT Secret

1. In Supabase dashboard, go to Settings > API
2. Scroll down to "JWT Settings"
3. Copy the JWT Secret
4. In Clerk dashboard, go to your JWT template
5. In the "Signing key" field, paste the Supabase JWT Secret

### 4.2 Configure Claims

Ensure your Clerk JWT template has these claims:

```json
{
  "aud": "authenticated",
  "exp": {{exp}},
  "iat": {{iat}},
  "iss": "https://your-project.supabase.co/auth/v1",
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
    "full_name": "{{user.full_name}}"
  },
  "role": "authenticated"
}
```

## Step 5: Test the Integration

### 5.1 Start the Development Server

```bash
npm run dev
```

### 5.2 Test Authentication

1. Go to http://localhost:3000
2. Click "Get Started Free" to sign up
3. Complete the sign-up process
4. You should be redirected to `/dashboard`

### 5.3 Test Database Integration

1. In the dashboard, try uploading a PDF file
2. Check your Supabase dashboard to see if:
   - User record was created in the `users` table
   - Document record was created in the `documents` table
   - File was uploaded to the `documents` storage bucket

### 5.4 Test API Endpoints

You can test the API endpoints using curl or a tool like Postman:

```bash
# Test user endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_CLERK_JWT" \
     http://localhost:3000/api/protected/user

# Test documents endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_CLERK_JWT" \
     http://localhost:3000/api/protected/documents
```

## Step 6: Security Checklist

- [ ] RLS policies are enabled on all tables
- [ ] Service role key is kept secret and not exposed to client
- [ ] Webhook secret is configured and secure
- [ ] JWT template is properly configured with Supabase secret
- [ ] Storage policies restrict access to user's own files
- [ ] Environment variables are not committed to version control

## Troubleshooting

### Common Issues

1. **"No Supabase access token found"**
   - Check that your JWT template name matches `CLERK_JWT_TEMPLATE_NAME`
   - Ensure the JWT template is properly configured

2. **"Database error" when accessing user data**
   - Verify RLS policies are set up correctly
   - Check that the JWT claims include the correct user ID

3. **File upload fails**
   - Ensure storage bucket exists and policies are configured
   - Check that the user has proper permissions

4. **Webhook not working**
   - Verify webhook URL is accessible from the internet
   - Check webhook secret matches environment variable
   - Ensure webhook events are properly selected

### Debug Tips

1. Check browser console for client-side errors
2. Check server logs for API errors
3. Use Supabase dashboard to inspect database records
4. Use Clerk dashboard to check user events and JWT tokens

## Production Deployment

When deploying to production:

1. Update environment variables with production values
2. Configure webhook URL to point to your production domain
3. Ensure your domain is added to Clerk's allowed origins
4. Set up proper error monitoring and logging
5. Configure backup and monitoring for your Supabase database

## Support

If you encounter issues:

1. Check the Clerk documentation: https://clerk.com/docs
2. Check the Supabase documentation: https://supabase.com/docs
3. Review the troubleshooting section above
4. Check the project's GitHub issues
