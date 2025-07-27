# Integration Settings Page

## Overview

The Integration Settings page allows users to manage individual integration configurations, test connections, and update settings for their connected integrations.

## Access

- **URL Pattern**: `/dashboard/integrations/{integration-id}`
- **Navigation**: Click the "Settings" button on any integration card in the main integrations page

## Features

### 1. Basic Settings
- **Integration Name**: Customize the display name for your integration
- **Status Toggle**: Enable/disable the integration without disconnecting

### 2. Configuration Management
- **API Keys**: Securely update encrypted API keys (existing keys are never displayed)
- **Database IDs**: Modify target database identifiers
- **Custom Fields**: Edit integration-specific configuration fields

### 3. Connection Testing
- **Test Connection**: Verify integration connectivity
- **Real-time Status**: Visual indicators for connection health
- **Last Sync Information**: View when the integration was last used

### 4. Integration Actions
- **Save Changes**: Update configuration and settings
- **Test Connection**: Validate current settings
- **Disconnect**: Remove the integration entirely

## UI Components

### Status Badges
- **Connected** (Green): Integration is active and recently synced
- **Inactive** (Gray): Integration is disabled
- **Connection Issues** (Red): Integration hasn't synced recently
- **Not Tested** (Outline): No recent connection test

### Security Features
- **Encrypted Storage**: API keys are encrypted in the database
- **No Plaintext Display**: Existing API keys are never shown for security
- **Secure Updates**: New API keys can be provided without revealing existing ones

## API Integration

### Endpoints Used
- `GET /api/integrations` - Fetch user integrations
- `PATCH /api/integrations/{id}` - Update integration settings
- `POST /api/integrations/{id}/test` - Test integration connection
- `DELETE /api/integrations/{id}` - Disconnect integration

### Data Flow
1. Page loads and fetches current integration data
2. User modifies settings in the form
3. Changes are validated client-side
4. API call updates the integration in the database
5. Success/error notifications provide feedback

## Error Handling

### Client-Side Validation
- Required field validation
- Format validation for API keys and IDs
- Real-time feedback on form changes

### Server-Side Error Handling
- Graceful handling of network errors
- Retry logic for transient failures
- User-friendly error messages

### Common Error Scenarios
- **Integration Not Found**: Redirect to main integrations page
- **Invalid Configuration**: Show specific validation errors
- **Connection Test Failure**: Display troubleshooting suggestions
- **Save Failure**: Preserve user changes and allow retry

## Supported Integration Types

### Notion
- **API Key**: Notion integration secret key
- **Database ID**: Target Notion database identifier
- **Features**: Database schema validation, connection testing

### Airtable (Coming Soon)
- **API Key**: Airtable personal access token
- **Base ID**: Target Airtable base identifier
- **Table Name**: Specific table for data insertion

### QuickBooks (Coming Soon)
- **Company ID**: QuickBooks company identifier
- **OAuth Token**: Authenticated access token
- **Sandbox Mode**: Development/testing toggle

## Security Considerations

### Data Protection
- API keys are encrypted using AES-256-CBC
- Sensitive data is never logged or exposed in client-side code
- Database queries use parameterized statements

### Access Control
- User can only access their own integrations
- Clerk authentication required for all operations
- Row-level security enforced at database level

### Audit Trail
- Integration changes are logged with timestamps
- Last sync information tracks usage
- Error logs help with troubleshooting

## Development Notes

### File Structure
```
app/dashboard/integrations/[id]/page.tsx    # Main settings page
stores/integrations-store.ts                # State management
app/api/integrations/[id]/route.ts          # API endpoints
components/integrations/                    # Reusable components
```

### Key Dependencies
- **Clerk**: Authentication and user management
- **Supabase**: Database operations and RLS
- **Zustand**: Client-side state management
- **Framer Motion**: Animations and transitions

### Testing
- Unit tests for store methods
- Integration tests for API endpoints
- E2E tests for user workflows
- Security tests for data protection

## Future Enhancements

### Planned Features
- **Bulk Operations**: Update multiple integrations at once
- **Integration Templates**: Pre-configured settings for common use cases
- **Advanced Scheduling**: Custom sync intervals and triggers
- **Webhook Configuration**: Real-time data synchronization
- **Integration Marketplace**: Browse and install new integrations

### Performance Optimizations
- **Lazy Loading**: Load integration details on demand
- **Caching**: Cache frequently accessed configuration data
- **Batch Updates**: Combine multiple configuration changes
- **Background Sync**: Non-blocking connection tests

## Troubleshooting

### Common Issues
1. **Settings Button Not Working**: Check if integration ID is valid
2. **Save Fails**: Verify network connection and authentication
3. **Test Connection Fails**: Validate API keys and permissions
4. **Page Not Loading**: Check browser console for JavaScript errors

### Debug Steps
1. Check browser developer tools for network errors
2. Verify integration exists in database
3. Test API endpoints directly
4. Review server logs for detailed error messages

## Support

For additional help with integration settings:
- Check the main integrations documentation
- Review API endpoint documentation
- Contact support with specific error messages
- Use the built-in connection test feature for diagnostics
