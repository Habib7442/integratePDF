#!/usr/bin/env node

/**
 * Simple script to clean up duplicate user records in Supabase
 * Run with: node scripts/cleanup-duplicates-simple.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Environment validation
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
]

console.log('🔍 Checking environment variables...')
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  if (!value) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
    process.exit(1)
  } else {
    console.log(`✅ ${envVar}: ${value.substring(0, 30)}...`)
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findDuplicateUsers() {
  console.log('🔍 Finding duplicate users...')
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  console.log(`Found ${users.length} total users`)

  // Group users by clerk_user_id
  const userGroups = new Map()
  
  for (const user of users) {
    if (!user.clerk_user_id) continue
    
    if (!userGroups.has(user.clerk_user_id)) {
      userGroups.set(user.clerk_user_id, [])
    }
    userGroups.get(user.clerk_user_id).push(user)
  }

  // Filter to only duplicates
  const duplicates = new Map()
  for (const [clerkId, userList] of userGroups) {
    if (userList.length > 1) {
      duplicates.set(clerkId, userList)
      console.log(`📋 Clerk ID ${clerkId} has ${userList.length} duplicates:`)
      userList.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email || 'EMPTY'}, Name: ${user.first_name || 'EMPTY'} ${user.last_name || 'EMPTY'}`)
      })
    }
  }

  console.log(`\nFound ${duplicates.size} clerk_user_ids with duplicates`)
  return duplicates
}

function selectBestUser(users) {
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
    
    return { user, score }
  })

  // Sort by score (highest first)
  scoredUsers.sort((a, b) => b.score - a.score)
  
  const keep = scoredUsers[0].user
  const remove = scoredUsers.slice(1).map(s => s.user)
  
  console.log(`   📌 Best user (score: ${scoredUsers[0].score}): ${keep.id}`)
  console.log(`      Email: ${keep.email || 'EMPTY'}`)
  console.log(`      Name: ${keep.first_name || 'EMPTY'} ${keep.last_name || 'EMPTY'}`)
  
  return { keep, remove }
}

async function transferUserData(fromUserId, toUserId) {
  console.log(`  📦 Transferring data from ${fromUserId} to ${toUserId}`)
  
  // Check what data exists
  const { data: docs } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', fromUserId)
  
  const { data: integrations } = await supabase
    .from('integrations')
    .select('id')
    .eq('user_id', fromUserId)
  
  console.log(`    Found ${docs?.length || 0} documents and ${integrations?.length || 0} integrations to transfer`)
  
  // Transfer documents
  if (docs && docs.length > 0) {
    const { error: docsError } = await supabase
      .from('documents')
      .update({ user_id: toUserId })
      .eq('user_id', fromUserId)
    
    if (docsError) {
      console.warn(`    ⚠️  Failed to transfer documents: ${docsError.message}`)
    } else {
      console.log(`    ✅ Transferred ${docs.length} documents`)
    }
  }
  
  // Transfer integrations
  if (integrations && integrations.length > 0) {
    const { error: integrationsError } = await supabase
      .from('integrations')
      .update({ user_id: toUserId })
      .eq('user_id', fromUserId)
    
    if (integrationsError) {
      console.warn(`    ⚠️  Failed to transfer integrations: ${integrationsError.message}`)
    } else {
      console.log(`    ✅ Transferred ${integrations.length} integrations`)
    }
  }
}

async function cleanupDuplicates() {
  console.log('🧹 Starting duplicate user cleanup...\n')
  
  const duplicates = await findDuplicateUsers()
  
  if (duplicates.size === 0) {
    console.log('✅ No duplicate users found!')
    return
  }

  console.log('\n⚠️  This will permanently delete duplicate user records!')
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
  
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  let totalCleaned = 0
  
  for (const [clerkId, users] of duplicates) {
    console.log(`\n👥 Processing duplicates for Clerk ID: ${clerkId}`)
    
    const { keep, remove } = selectBestUser(users)
    
    // Transfer data from duplicates to the kept user
    for (const duplicate of remove) {
      await transferUserData(duplicate.id, keep.id)
    }
    
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
