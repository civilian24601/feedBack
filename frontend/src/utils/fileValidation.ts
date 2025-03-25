// Maximum file size in bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed audio file types
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/m4a',
  'audio/aac'
]

// Allowed avatar file types
export const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]

// Maximum avatar size in bytes (5MB)
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validateFile = (
  file: File,
  maxSize: number = MAX_FILE_SIZE,
  allowedTypes: string[] = ALLOWED_AUDIO_TYPES
): ValidationResult => {
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload an audio file.'
    }
  }

  return { isValid: true }
}

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const generateUniqueFilename = (originalFilename: string, userId: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = getFileExtension(originalFilename)
  return `${userId}-${timestamp}-${randomString}.${extension}`
} 