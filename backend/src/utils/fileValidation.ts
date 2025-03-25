// Maximum file size in bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed file types for audio files
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',      // MP3
  'audio/wav',       // WAV
  'audio/ogg',       // OGG
  'audio/mp4',       // M4A
  'audio/aac'        // AAC
]

// Allowed file types for avatars
export const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',      // JPEG
  'image/png',       // PNG
  'image/gif',       // GIF
  'image/webp'       // WebP
]

// Maximum avatar size in bytes (5MB)
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024

/**
 * Validates a file for upload
 * @param file The file to validate
 * @param type 'track' or 'avatar'
 * @returns {isValid: boolean, error?: string}
 */
export const validateFile = (file: File, type: 'track' | 'avatar') => {
  // Check file size
  const maxSize = type === 'track' ? MAX_FILE_SIZE : MAX_AVATAR_SIZE
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
    }
  }

  // Check file type
  const allowedTypes = type === 'track' ? ALLOWED_AUDIO_TYPES : ALLOWED_AVATAR_TYPES
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  return { isValid: true }
}

/**
 * Gets the file extension from a filename
 * @param filename The filename to get the extension from
 * @returns The file extension (including the dot)
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 1).toLowerCase()
}

/**
 * Generates a unique filename for upload
 * @param originalFilename The original filename
 * @param userId The user's ID
 * @returns A unique filename
 */
export const generateUniqueFilename = (originalFilename: string, userId: string): string => {
  const extension = getFileExtension(originalFilename)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${userId}/${timestamp}-${random}${extension}`
} 