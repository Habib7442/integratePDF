/**
 * Simple test script to verify Google Sheets integration setup
 * Run with: node test-google-sheets.js
 */

// Check environment variables
console.log('🔍 Checking Google Sheets Integration Setup...\n')

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'GOOGLE_REDIRECT_URI'
]

let allGood = true

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  if (value) {
    console.log(`✅ ${envVar}: ${envVar === 'GOOGLE_CLIENT_SECRET' ? '***hidden***' : value}`)
  } else {
    console.log(`❌ ${envVar}: Missing!`)
    allGood = false
  }
})

console.log('\n📋 Integration Files Check:')

const fs = require('fs')
const path = require('path')

const requiredFiles = [
  'lib/integrations/google-sheets.ts',
  'app/api/integrations/google-sheets/auth/route.ts',
  'app/api/integrations/google-sheets/callback/route.ts',
  'app/api/integrations/google-sheets/spreadsheets/route.ts',
  'components/integrations/GoogleSheetsManager.tsx',
  'components/icons/GoogleSheetsIcon.tsx'
]

requiredFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath}`)
  } else {
    console.log(`❌ ${filePath}: Missing!`)
    allGood = false
  }
})

console.log('\n🔗 Test URLs:')
console.log('OAuth Test: http://localhost:3000/api/integrations/google-sheets/auth?user_id=test-123')
console.log('Callback URL: http://localhost:3000/api/integrations/google-sheets/callback')

if (allGood) {
  console.log('\n🎉 Setup looks good! Start your dev server and test the OAuth flow.')
} else {
  console.log('\n⚠️  Some issues found. Please fix them before testing.')
}

console.log('\n📝 Next steps:')
console.log('1. Run: npm run dev')
console.log('2. Visit: http://localhost:3000/api/integrations/google-sheets/auth?user_id=test-123')
console.log('3. Complete Google OAuth flow')
console.log('4. Check for success/error messages')
