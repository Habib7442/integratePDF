/**
 * Enhanced file validation utilities for security
 */

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf'
] as const

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// PDF file signature (magic bytes)
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46] // %PDF

export interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

/**
 * Validates file type by checking MIME type and file signature
 */
export async function validateFileType(file: File): Promise<FileValidationResult> {
  const warnings: string[] = []

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: `Invalid file type. Only PDF files are allowed. Received: ${file.type}`
    }
  }

  // Check file extension
  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith('.pdf')) {
    return {
      isValid: false,
      error: 'Invalid file extension. Only .pdf files are allowed.'
    }
  }

  // Check file signature (magic bytes)
  try {
    const buffer = await file.slice(0, 4).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    const isValidPDF = PDF_SIGNATURE.every((byte, index) => bytes[index] === byte)
    
    if (!isValidPDF) {
      return {
        isValid: false,
        error: 'File content does not match PDF format. The file may be corrupted or not a valid PDF.'
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to read file content for validation.'
    }
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validates file size
 */
export function validateFileSize(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB. Received: ${Math.round(file.size / (1024 * 1024))}MB`
    }
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty.'
    }
  }

  return { isValid: true }
}

/**
 * Validates file name for security
 */
export function validateFileName(fileName: string): FileValidationResult {
  const warnings: string[] = []

  // Check for dangerous characters
  const dangerousChars = /[<>:"|?*\x00-\x1f]/
  if (dangerousChars.test(fileName)) {
    return {
      isValid: false,
      error: 'File name contains invalid characters.'
    }
  }

  // Check for path traversal attempts
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      isValid: false,
      error: 'File name contains invalid path characters.'
    }
  }

  // Check length
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: 'File name is too long. Maximum 255 characters allowed.'
    }
  }

  // Check for suspicious extensions
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.js', '.vbs']
  const lowerFileName = fileName.toLowerCase()
  
  for (const ext of suspiciousExtensions) {
    if (lowerFileName.includes(ext)) {
      warnings.push(`File name contains suspicious extension: ${ext}`)
    }
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Comprehensive file validation
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  // Validate file name
  const nameValidation = validateFileName(file.name)
  if (!nameValidation.isValid) {
    return nameValidation
  }

  // Validate file size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.isValid) {
    return sizeValidation
  }

  // Validate file type and content
  const typeValidation = await validateFileType(file)
  if (!typeValidation.isValid) {
    return typeValidation
  }

  // Combine warnings
  const allWarnings = [
    ...(nameValidation.warnings || []),
    ...(sizeValidation.warnings || []),
    ...(typeValidation.warnings || [])
  ]

  return {
    isValid: true,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  }
}

/**
 * Sanitizes file name for safe storage
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"|?*\x00-\x1f]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[/\\]/g, '_')
    .substring(0, 255)
    .trim()
}
