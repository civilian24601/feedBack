export const GENRES = [
  'Rock',
  'Pop',
  'Hip Hop',
  'Electronic',
  'Jazz',
  'Classical',
  'R&B',
  'Country',
  'Folk',
  'Metal',
  'Blues',
  'Other'
] as const

export const FEEDBACK_FOCUS_OPTIONS = [
  'Mixing',
  'Composition',
  'Arrangement',
  'Lyrics',
  'Vocals',
  'Instrumentation',
  'Production',
  'Sound Design'
] as const

export const FILE_LIMITS = {
  MAX_AUDIO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_AVATAR_SIZE: 5 * 1024 * 1024,  // 5MB
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
  ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
} as const 