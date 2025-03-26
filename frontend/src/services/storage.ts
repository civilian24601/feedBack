import { supabase } from '../lib/supabase'
import { generateUniqueFilename } from '../utils/fileValidation'
import { UploadData, ApiResponse } from '../types'

export const uploadTrack = async (data: UploadData, userId: string): Promise<ApiResponse<void>> => {
  try {
    let publicUrl = data.url

    // If a file is provided, upload it to Supabase storage
    if (data.file) {
      const fileName = generateUniqueFilename(data.file.name, userId)
      const filePath = `${userId}/${fileName}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(filePath, data.file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl: url } } = supabase.storage
        .from('tracks')
        .getPublicUrl(filePath)

      publicUrl = url
    }

    // Create track record in database
    const { error: dbError } = await supabase
      .from('tracks')
      .insert({
        user_id: userId,
        title: data.title,
        genre: data.genre,
        feedback_focus: data.feedbackFocus,
        public_url: publicUrl,
        status: 'pending'
      })

    if (dbError) throw dbError

    return { data: null, error: null }
  } catch (error: unknown) {
    console.error('Error uploading track:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
} 