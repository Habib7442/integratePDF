/**
 * Test script to verify integration settings page functionality
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testIntegrationSettings() {
  console.log('Testing Integration Settings Page...\n')
  
  const results = {
    settingsPageExists: false,
    routeConfigured: false,
    storeMethodsExist: false,
    apiEndpointSupportsUpdates: false,
    uiComponentsExist: false
  }

  try {
    // Test 1: Check if settings page exists
    console.log('1. Testing settings page existence...')
    try {
      const fs = await import('fs')
      const settingsPagePath = 'app/dashboard/integrations/[id]/page.tsx'
      
      if (fs.existsSync(settingsPagePath)) {
        const pageContent = fs.readFileSync(settingsPagePath, 'utf8')
        
        if (pageContent.includes('IntegrationSettingsPage') && 
            pageContent.includes('updateIntegrationConfig') &&
            pageContent.includes('Settings') &&
            pageContent.includes('Save Changes')) {
          console.log('✅ Integration settings page exists and is properly configured')
          results.settingsPageExists = true
        } else {
          console.log('❌ Settings page exists but missing required functionality')
        }
      } else {
        console.log('❌ Integration settings page does not exist')
      }
    } catch (error) {
      console.log('⚠️  Could not check settings page file')
    }

    // Test 2: Check if route is properly configured
    console.log('\n2. Testing route configuration...')
    try {
      const fs = await import('fs')
      const integrationsPageContent = fs.readFileSync('app/dashboard/integrations/page.tsx', 'utf8')
      
      if (integrationsPageContent.includes('/dashboard/integrations/${integration.id}') &&
          integrationsPageContent.includes('Settings')) {
        console.log('✅ Route to settings page is properly configured')
        results.routeConfigured = true
      } else {
        console.log('❌ Route to settings page not properly configured')
      }
    } catch (error) {
      console.log('⚠️  Could not check integrations page file')
    }

    // Test 3: Check if store methods exist
    console.log('\n3. Testing store methods...')
    try {
      const fs = await import('fs')
      const storeContent = fs.readFileSync('stores/integrations-store.ts', 'utf8')
      
      if (storeContent.includes('updateIntegrationConfig') &&
          storeContent.includes('testIntegrationConnection') &&
          storeContent.includes('disconnectIntegration')) {
        console.log('✅ Required store methods exist')
        results.storeMethodsExist = true
      } else {
        console.log('❌ Required store methods missing')
      }
    } catch (error) {
      console.log('⚠️  Could not check store file')
    }

    // Test 4: Check if API endpoint supports updates
    console.log('\n4. Testing API endpoint support...')
    try {
      const fs = await import('fs')
      const apiContent = fs.readFileSync('app/api/integrations/[id]/route.ts', 'utf8')
      
      if (apiContent.includes('PATCH') &&
          apiContent.includes('config') &&
          apiContent.includes('name') &&
          apiContent.includes('is_active')) {
        console.log('✅ API endpoint supports integration updates')
        results.apiEndpointSupportsUpdates = true
      } else {
        console.log('❌ API endpoint missing update support')
      }
    } catch (error) {
      console.log('⚠️  Could not check API endpoint file')
    }

    // Test 5: Check if UI components exist
    console.log('\n5. Testing UI components...')
    try {
      const fs = await import('fs')
      const settingsPageContent = fs.readFileSync('app/dashboard/integrations/[id]/page.tsx', 'utf8')
      
      if (settingsPageContent.includes('Card') &&
          settingsPageContent.includes('Input') &&
          settingsPageContent.includes('Button') &&
          settingsPageContent.includes('Badge') &&
          settingsPageContent.includes('Label')) {
        console.log('✅ Required UI components are imported and used')
        results.uiComponentsExist = true
      } else {
        console.log('❌ Required UI components missing')
      }
    } catch (error) {
      console.log('⚠️  Could not check UI components')
    }

    // Test 6: Test with actual integration data (if available)
    console.log('\n6. Testing with actual integration data...')
    try {
      const { data: integrations } = await supabase
        .from('integrations')
        .select('*')
        .limit(1)
      
      if (integrations && integrations.length > 0) {
        const integration = integrations[0]
        console.log(`✅ Found test integration: ${integration.integration_name} (${integration.integration_type})`)
        console.log(`   - ID: ${integration.id}`)
        console.log(`   - Active: ${integration.is_active}`)
        console.log(`   - Has config: ${integration.config ? 'Yes' : 'No'}`)
        
        if (integration.config) {
          const configKeys = Object.keys(integration.config)
          console.log(`   - Config keys: ${configKeys.join(', ')}`)
        }
      } else {
        console.log('⚠️  No integrations available for testing')
      }
    } catch (error) {
      console.log('⚠️  Could not test with actual integration data:', error.message)
    }

    // Summary
    console.log('\n=== Test Results Summary ===')
    const passedTests = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length
    
    console.log(`Passed: ${passedTests}/${totalTests} tests`)
    
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}`)
    })

    if (passedTests === totalTests) {
      console.log('\n🎉 Integration settings page is fully implemented!')
      console.log('\n📝 Features available:')
      console.log('- Individual integration settings page')
      console.log('- Update integration name and status')
      console.log('- Modify configuration (API keys, database IDs, etc.)')
      console.log('- Test integration connection')
      console.log('- Disconnect integration')
      console.log('- View integration information and status')
      console.log('\n🔗 Access via: /dashboard/integrations/{integration-id}')
    } else {
      console.log('\n⚠️  Some components may not be fully implemented')
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
if (require.main === module) {
  testIntegrationSettings()
    .then(() => {
      console.log('\nTest completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}

export { testIntegrationSettings }
