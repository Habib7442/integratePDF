import crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16
const SALT_LENGTH = 32
const KEY_LENGTH = 32

/**
 * Derives a key from the master key and salt using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha512')
}

/**
 * Encrypts sensitive data (like API keys) using AES-256-CBC
 * @param text - The plain text to encrypt
 * @returns Object containing encrypted data and metadata
 */
export function encryptSensitiveData(text: string): {
  encrypted: string
  iv: string
  salt: string
} {
  const masterKey = process.env.ENCRYPTION_KEY
  if (!masterKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)

  // Derive key from master key and salt
  const key = deriveKey(masterKey, salt)

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return {
    encrypted,
    iv: iv.toString('hex'),
    salt: salt.toString('hex')
  }
}

/**
 * Decrypts sensitive data that was encrypted with encryptSensitiveData
 * @param encryptedData - Object containing encrypted data and metadata
 * @returns The decrypted plain text
 */
export function decryptSensitiveData(encryptedData: {
  encrypted: string
  iv: string
  salt: string
}): string {
  const masterKey = process.env.ENCRYPTION_KEY
  if (!masterKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  try {
    // Convert hex strings back to buffers
    const salt = Buffer.from(encryptedData.salt, 'hex')
    const iv = Buffer.from(encryptedData.iv, 'hex')

    // Derive the same key
    const key = deriveKey(masterKey, salt)

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    // Decrypt
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    throw new Error('Failed to decrypt sensitive data: Invalid encryption data or key')
  }
}

/**
 * Encrypts an API key for storage in the database
 * @param apiKey - The plain text API key
 * @returns Encrypted API key data as a JSON string
 */
export function encryptApiKey(apiKey: string): string {
  const encryptedData = encryptSensitiveData(apiKey)
  return JSON.stringify(encryptedData)
}

/**
 * Decrypts an API key from database storage
 * @param encryptedApiKey - The encrypted API key data as a JSON string
 * @returns The plain text API key
 */
export function decryptApiKey(encryptedApiKey: string): string {
  try {
    const encryptedData = JSON.parse(encryptedApiKey)
    return decryptSensitiveData(encryptedData)
  } catch (error) {
    throw new Error('Failed to decrypt API key: Invalid encrypted data format')
  }
}

/**
 * Checks if a string appears to be encrypted (vs plain text)
 * @param value - The value to check
 * @returns True if the value appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  try {
    const parsed = JSON.parse(value)
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      'encrypted' in parsed &&
      'iv' in parsed &&
      'salt' in parsed
    )
  } catch {
    return false
  }
}

/**
 * Migrates a plain text API key to encrypted format
 * @param plainTextApiKey - The plain text API key
 * @returns Encrypted API key data as a JSON string
 */
export function migrateApiKeyToEncrypted(plainTextApiKey: string): string {
  // Check if it's already encrypted
  if (isEncrypted(plainTextApiKey)) {
    return plainTextApiKey
  }
  
  // Encrypt the plain text key
  return encryptApiKey(plainTextApiKey)
}
