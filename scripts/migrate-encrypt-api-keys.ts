/**
 * Migration script to encrypt existing API keys in the integrations table
 * Run this script once to migrate from plain text to encrypted API keys
 */

import { createClient } from '@supabase/supabase-js'
import { migrateApiKeyToEncrypted, isEncrypted } from '../lib/encryption'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

if (!process.env.ENCRYPTION_KEY) {
  console.error('Missing ENCRYPTION_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function migrateApiKeys() {
  console.log('Starting API key encryption migration...')
  
  try {
    // Get all integrations with API keys
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('id, config, integration_type')
      .not('config', 'is', null)
    
    if (error) {
      throw error
    }
    
    if (!integrations || integrations.length === 0) {
      console.log('No integrations found to migrate')
      return
    }
    
    console.log(`Found ${integrations.length} integrations to check`)
    
    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    for (const integration of integrations) {
      try {
        const config = integration.config as any
        
        // Check if this integration has an API key
        if (!config || !config.api_key) {
          console.log(`Skipping integration ${integration.id} - no API key`)
          skippedCount++
          continue
        }
        
        // Check if already encrypted
        if (isEncrypted(config.api_key)) {
          console.log(`Skipping integration ${integration.id} - already encrypted`)
          skippedCount++
          continue
        }
        
        console.log(`Migrating integration ${integration.id} (${integration.integration_type})`)
        
        // Encrypt the API key
        const encryptedApiKey = migrateApiKeyToEncrypted(config.api_key)
        
        // Update the config with encrypted API key
        const updatedConfig = {
          ...config,
          api_key: encryptedApiKey
        }
        
        // Update the database
        const { error: updateError } = await supabase
          .from('integrations')
          .update({ config: updatedConfig })
          .eq('id', integration.id)
        
        if (updateError) {
          throw updateError
        }
        
        console.log(`✅ Successfully migrated integration ${integration.id}`)
        migratedCount++
        
      } catch (error) {
        console.error(`❌ Error migrating integration ${integration.id}:`, error)
        errorCount++
      }
    }
    
    console.log('\n=== Migration Summary ===')
    console.log(`Total integrations checked: ${integrations.length}`)
    console.log(`Successfully migrated: ${migratedCount}`)
    console.log(`Skipped (no API key or already encrypted): ${skippedCount}`)
    console.log(`Errors: ${errorCount}`)
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some integrations failed to migrate. Please check the errors above.')
      process.exit(1)
    } else {
      console.log('\n🎉 Migration completed successfully!')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
if (require.main === module) {
  migrateApiKeys()
    .then(() => {
      console.log('Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateApiKeys }
