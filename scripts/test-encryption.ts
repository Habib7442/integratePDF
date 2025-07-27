/**
 * Test script to verify encryption/decryption is working correctly
 */

import { encryptApiKey, decryptApiKey, isEncrypted } from '../lib/encryption'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

function testEncryption() {
  console.log('Testing API key encryption/decryption...\n')
  
  // Test data
  const testApiKey = 'ntn_1234567890abcdef'
  
  try {
    console.log('1. Original API key:', testApiKey)
    
    // Test encryption
    console.log('\n2. Encrypting API key...')
    const encrypted = encryptApiKey(testApiKey)
    console.log('Encrypted data:', encrypted.substring(0, 100) + '...')
    
    // Test isEncrypted function
    console.log('\n3. Testing isEncrypted function...')
    console.log('Is encrypted:', isEncrypted(encrypted))
    console.log('Is plain text encrypted:', isEncrypted(testApiKey))
    
    // Test decryption
    console.log('\n4. Decrypting API key...')
    const decrypted = decryptApiKey(encrypted)
    console.log('Decrypted API key:', decrypted)
    
    // Verify they match
    console.log('\n5. Verification...')
    const matches = testApiKey === decrypted
    console.log('Original matches decrypted:', matches)
    
    if (matches) {
      console.log('\n✅ Encryption test PASSED!')
    } else {
      console.log('\n❌ Encryption test FAILED!')
      process.exit(1)
    }
    
    // Test multiple encryptions produce different results
    console.log('\n6. Testing encryption uniqueness...')
    const encrypted2 = encryptApiKey(testApiKey)
    const encrypted3 = encryptApiKey(testApiKey)
    
    console.log('Encryption 1 === Encryption 2:', encrypted === encrypted2)
    console.log('Encryption 2 === Encryption 3:', encrypted2 === encrypted3)
    
    if (encrypted !== encrypted2 && encrypted2 !== encrypted3) {
      console.log('✅ Encryption uniqueness test PASSED!')
    } else {
      console.log('❌ Encryption uniqueness test FAILED!')
      process.exit(1)
    }
    
    // Test all three decrypt to the same value
    const decrypted2 = decryptApiKey(encrypted2)
    const decrypted3 = decryptApiKey(encrypted3)
    
    if (decrypted === decrypted2 && decrypted2 === decrypted3) {
      console.log('✅ Multiple decryption test PASSED!')
    } else {
      console.log('❌ Multiple decryption test FAILED!')
      process.exit(1)
    }
    
    console.log('\n🎉 All encryption tests passed!')
    
  } catch (error) {
    console.error('❌ Encryption test failed:', error)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  if (!process.env.ENCRYPTION_KEY) {
    console.error('❌ ENCRYPTION_KEY environment variable is not set')
    process.exit(1)
  }
  
  testEncryption()
}

export { testEncryption }
