# Google Sheets Integration Setup

This guide explains how to set up Google Sheets integration for IntegratePDF.

## Prerequisites

1. A Google Cloud Console project
2. Google Sheets API enabled
3. OAuth 2.0 credentials configured

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted
4. Choose "Web application" as the application type
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/integrations/google-sheets/callback`
   - For production: `https://yourdomain.com/api/integrations/google-sheets/callback`
6. Save and note down the Client ID and Client Secret

## Step 3: Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google-sheets/callback

# For production, use your actual domain:
# GOOGLE_REDIRECT_URI=https://yourdomain.com/api/integrations/google-sheets/callback
```

## Step 4: OAuth Consent Screen Configuration

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - App name: "IntegratePDF"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
5. Add test users (for development)

## Step 5: Testing the Integration

1. Start your development server: `npm run dev`
2. Go to the dashboard and try to connect Google Sheets
3. You should be redirected to Google's OAuth flow
4. After authorization, you'll be redirected back to your app

## Scopes Explained

- `https://www.googleapis.com/auth/spreadsheets`: Full access to Google Sheets
- `https://www.googleapis.com/auth/drive.file`: Access to files created by the app

## Security Notes

1. Keep your Client Secret secure and never expose it in client-side code
2. Use HTTPS in production
3. Regularly rotate your credentials
4. Monitor API usage in Google Cloud Console

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in your OAuth credentials matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **"access_denied" error**
   - User declined authorization
   - Check OAuth consent screen configuration

3. **"invalid_client" error**
   - Check your Client ID and Client Secret
   - Ensure they're correctly set in environment variables

4. **API quota exceeded**
   - Check your API usage in Google Cloud Console
   - Consider implementing rate limiting

### Debug Mode

To enable debug logging for Google Sheets integration, set:

```env
DEBUG_GOOGLE_SHEETS=true
```

This will log API requests and responses to help with troubleshooting.

## Production Deployment

1. Update the redirect URI to use your production domain
2. Update the OAuth consent screen with production information
3. Consider applying for OAuth verification if you plan to have many users
4. Set up monitoring for API usage and errors

## API Limits

Google Sheets API has the following limits:
- 100 requests per 100 seconds per user
- 500 requests per 100 seconds

Plan your usage accordingly and implement appropriate error handling and retry logic.
