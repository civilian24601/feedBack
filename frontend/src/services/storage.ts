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
    let fileUrl = data.url

    // If a file is provided, upload it to Supabase storage
    if (data.file) {
      const fileExt = data.file.name.split('.').pop()
      const fileName = generateUniqueFilename(data.file.name, userId)
      const filePath = `${userId}/${fileName}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('tracks')
        .upload(filePath, data.file)

      if (uploadError) throw uploadError

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(filePath)

      fileUrl = publicUrl
    }

    // Create track record in the database
    const { error: dbError } = await supabase
      .from('tracks')
      .insert({
        user_id: userId,
        title: data.title,
        genre: data.genre,
        feedback_focus: data.feedbackFocus,
        file_url: fileUrl,
        status: 'pending'
      })

    if (dbError) throw dbError

    return { success: true }
  } catch (error) {
    console.error('Error uploading track:', error)
    throw error
  }
} 