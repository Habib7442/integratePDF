#!/usr/bin/env tsx

/**
 * Script to clean up duplicate user records in Supabase
 *
 * This script:
 * 1. Identifies duplicate users by clerk_user_id
 * 2. Keeps the user record with the most complete data (non-empty email, name)
 * 3. Transfers any documents/integrations from duplicate records to the kept record
 * 4. Deletes the duplicate records
 *
 * Run with: npx tsx scripts/cleanup-duplicate-users.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nextjs/server'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Environment validation
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLERK_SECRET_KEY'
]

console.log('🔍 Checking environment variables...')
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  if (!value) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('CLERK')))
    process.exit(1)
  } else {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`)
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UserRecord {
  id: string
  clerk_user_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  subscription_tier: string
  documents_processed: number
  monthly_limit: number
  created_at: string
  updated_at: string
}

async function findDuplicateUsers(): Promise<Map<string, UserRecord[]>> {
  console.log('🔍 Finding duplicate users...')
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  // Group users by clerk_user_id
  const userGroups = new Map<string, UserRecord[]>()
  
  for (const user of users) {
    if (!user.clerk_user_id) continue
    
    if (!userGroups.has(user.clerk_user_id)) {
      userGroups.set(user.clerk_user_id, [])
    }
    userGroups.get(user.clerk_user_id)!.push(user)
  }

  // Filter to only duplicates
  const duplicates = new Map<string, UserRecord[]>()
  for (const [clerkId, userList] of userGroups) {
    if (userList.length > 1) {
      duplicates.set(clerkId, userList)
    }
  }

  console.log(`Found ${duplicates.size} clerk_user_ids with duplicates`)
  return duplicates
}

function selectBestUser(users: UserRecord[]): { keep: UserRecord, remove: UserRecord[] } {
  // Score users based on data completeness
  const scoredUsers = users.map(user => {
    let score = 0
    
    // Prefer users with email
    if (user.email && user.email.trim() !== '') score += 10
    
    // Prefer users with names
    if (user.first_name && user.first_name.trim() !== '') score += 5
    if (user.last_name && user.last_name.trim() !== '') score += 5
    
    // Prefer users with avatar
    if (user.avatar_url && user.avatar_url.trim() !== '') score += 2
    
    // Prefer users with more documents processed
    score += user.documents_processed * 0.1
    
    // Prefer newer records (in case of recent updates)
    const daysSinceUpdate = (Date.now() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 30 - daysSinceUpdate) * 0.1
    
    return { user, score }
  })

  // Sort by score (highest first)
  scoredUsers.sort((a, b) => b.score - a.score)
  
  const keep = scoredUsers[0].user
  const remove = scoredUsers.slice(1).map(s => s.user)
  
  return { keep, remove }
}

async function transferUserData(fromUserId: string, toUserId: string): Promise<void> {
  console.log(`  📦 Transferring data from ${fromUserId} to ${toUserId}`)
  
  // Transfer documents
  const { error: docsError } = await supabase
    .from('documents')
    .update({ user_id: toUserId })
    .eq('user_id', fromUserId)
  
  if (docsError) {
    console.warn(`    ⚠️  Failed to transfer documents: ${docsError.message}`)
  }
  
  // Transfer integrations
  const { error: integrationsError } = await supabase
    .from('integrations')
    .update({ user_id: toUserId })
    .eq('user_id', fromUserId)
  
  if (integrationsError) {
    console.warn(`    ⚠️  Failed to transfer integrations: ${integrationsError.message}`)
  }
}

async function updateUserWithClerkData(user: UserRecord): Promise<void> {
  try {
    console.log(`  🔄 Updating user ${user.id} with latest Clerk data`)
    
    const clerkUser = await clerkClient.users.getUser(user.clerk_user_id)
    
    const { error } = await supabase
      .from('users')
      .update({
        email: clerkUser.emailAddresses[0]?.emailAddress || user.email,
        first_name: clerkUser.firstName || user.first_name,
        last_name: clerkUser.lastName || user.last_name,
        avatar_url: clerkUser.imageUrl || user.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (error) {
      console.warn(`    ⚠️  Failed to update user with Clerk data: ${error.message}`)
    } else {
      console.log(`    ✅ Updated user with Clerk data`)
    }
  } catch (error) {
    console.warn(`    ⚠️  Failed to fetch Clerk data: ${error}`)
  }
}

async function cleanupDuplicates(): Promise<void> {
  console.log('🧹 Starting duplicate user cleanup...\n')
  
  const duplicates = await findDuplicateUsers()
  
  if (duplicates.size === 0) {
    console.log('✅ No duplicate users found!')
    return
  }

  let totalCleaned = 0
  
  for (const [clerkId, users] of duplicates) {
    console.log(`\n👥 Processing duplicates for Clerk ID: ${clerkId}`)
    console.log(`   Found ${users.length} duplicate records`)
    
    const { keep, remove } = selectBestUser(users)
    
    console.log(`   📌 Keeping user: ${keep.id} (email: ${keep.email || 'empty'})`)
    console.log(`   🗑️  Removing ${remove.length} duplicate(s)`)
    
    // Transfer data from duplicates to the kept user
    for (const duplicate of remove) {
      await transferUserData(duplicate.id, keep.id)
    }
    
    // Update the kept user with latest Clerk data
    await updateUserWithClerkData(keep)
    
    // Delete duplicate users
    for (const duplicate of remove) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', duplicate.id)
      
      if (error) {
        console.error(`   ❌ Failed to delete duplicate ${duplicate.id}: ${error.message}`)
      } else {
        console.log(`   ✅ Deleted duplicate user ${duplicate.id}`)
        totalCleaned++
      }
    }
  }
  
  console.log(`\n🎉 Cleanup complete! Removed ${totalCleaned} duplicate user records.`)
}

// Run the cleanup
cleanupDuplicates()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
