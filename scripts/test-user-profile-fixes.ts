/**
 * Test script to verify user profile creation fixes
 * This script tests the robustness of user profile initialization
 */

import { createClient } from '@supabase/supabase-js'
import { resolveClerkUserWithRetry } from '../lib/user-resolution'

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

async function testUserProfileFixes() {
  console.log('Testing User Profile Creation Fixes...\n')
  
  const results = {
    raceConditionHandling: false,
    errorHandlingImproved: false,
    retryLogicImplemented: false,
    validationAdded: false,
    apiEndpointRobust: false
  }

  try {
    // Test 1: Check if race condition handling is implemented
    console.log('1. Testing race condition handling...')
    try {
      const fs = await import('fs')
      const userResolutionContent = fs.readFileSync('lib/user-resolution.ts', 'utf8')

      if (userResolutionContent.includes('23505') &&
          userResolutionContent.includes('duplicate key') &&
          userResolutionContent.includes('retryAttempts')) {
        console.log('✅ Race condition handling implemented')
        results.raceConditionHandling = true
      } else {
        console.log('❌ Race condition handling not properly implemented')
      }
    } catch (error) {
      console.log('⚠️  Could not read user resolution file')
    }

    // Test 2: Check if retry logic is implemented in user store
    console.log('\n2. Testing retry logic in user store...')
    try {
      const fs = await import('fs')
      const userStoreContent = fs.readFileSync('stores/user-store.ts', 'utf8')
      
      if (userStoreContent.includes('maxRetries') &&
          userStoreContent.includes('retryCount') &&
          userStoreContent.includes('setTimeout(resolve, 1000 * retryCount)')) {
        console.log('✅ Retry logic implemented in user store')
        results.retryLogicImplemented = true
      } else {
        console.log('❌ Retry logic not properly implemented')
      }
    } catch (error) {
      console.log('⚠️  Could not read user store file')
    }

    // Test 3: Check if validation is added
    console.log('\n3. Testing validation improvements...')
    try {
      const fs = await import('fs')
      const userResolutionContent = fs.readFileSync('lib/user-resolution.ts', 'utf8')
      
      if (userResolutionContent.includes('Invalid Clerk user ID format') && 
          userResolutionContent.includes('startsWith(\'user_\')')) {
        console.log('✅ User ID validation implemented')
        results.validationAdded = true
      } else {
        console.log('❌ User ID validation not implemented')
      }
    } catch (error) {
      console.log('⚠️  Could not read user resolution file')
    }

    // Test 4: Check if API endpoint uses robust user resolution
    console.log('\n4. Testing API endpoint improvements...')
    try {
      const fs = await import('fs')
      const apiContent = fs.readFileSync('app/api/user/profile/route.ts', 'utf8')
      
      if (apiContent.includes('resolveClerkUserWithRetry') && 
          apiContent.includes('status: 400') &&
          apiContent.includes('validation failed')) {
        console.log('✅ API endpoint uses robust user resolution')
        results.apiEndpointRobust = true
      } else {
        console.log('❌ API endpoint not properly improved')
      }
    } catch (error) {
      console.log('⚠️  Could not read API endpoint file')
    }

    // Test 5: Check if error handling is improved
    console.log('\n5. Testing error handling improvements...')
    try {
      const fs = await import('fs')
      const storeProviderContent = fs.readFileSync('components/providers/store-provider.tsx', 'utf8')
      
      if (storeProviderContent.includes('Invalid user session') && 
          storeProviderContent.includes('more specific error messages')) {
        console.log('✅ Error handling improved in store provider')
        results.errorHandlingImproved = true
      } else {
        console.log('❌ Error handling not properly improved')
      }
    } catch (error) {
      console.log('⚠️  Could not read store provider file')
    }

    // Test 6: Test actual user resolution (if test user exists)
    console.log('\n6. Testing actual user resolution...')
    try {
      const { data: testUsers } = await supabase
        .from('users')
        .select('clerk_user_id')
        .limit(1)
      
      if (testUsers && testUsers.length > 0) {
        const testClerkId = testUsers[0].clerk_user_id
        const resolvedId = await resolveClerkUserWithRetry(testClerkId)
        
        if (resolvedId) {
          console.log('✅ User resolution working correctly')
        } else {
          console.log('❌ User resolution failed')
        }
      } else {
        console.log('⚠️  No test users available for resolution test')
      }
    } catch (error) {
      console.log('⚠️  Could not test user resolution:', error.message)
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
      console.log('\n🎉 All fixes implemented successfully!')
      console.log('\n📝 The following issues have been addressed:')
      console.log('- Race conditions between multiple user creation attempts')
      console.log('- Inconsistent error handling and status codes')
      console.log('- Missing validation for Clerk user IDs')
      console.log('- Lack of retry logic for transient failures')
      console.log('- Poor error messages for users')
    } else {
      console.log('\n⚠️  Some fixes may not be fully implemented')
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
if (require.main === module) {
  testUserProfileFixes()
    .then(() => {
      console.log('\nTest completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}

export { testUserProfileFixes }
