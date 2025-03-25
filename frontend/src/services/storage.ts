import { supabase } from '../lib/supabase'
import { generateUniqueFilename } from '../utils/fileValidation'

export interface UploadData {
  file: File | null
  url: string
  title: string
  genre: string
  feedbackFocus: string[]
}

export const uploadTrack = async (data: UploadData, userId: string) => {
  try {
    let publicUrl = data.url

    // If a file is provided, upload it to Supabase storage
    if (data.file) {
      const fileName = generateUniqueFilename(data.file.name, userId)
      const filePath = `${userId}/${fileName}`

      // Upload file to storage
      const { error: uploadError, data: uploadData } = await supabase.storage
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

    return { success: true }
  } catch (error) {
    console.error('Error uploading track:', error)
    throw error
  }
} 