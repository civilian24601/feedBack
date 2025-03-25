import { useState } from 'react'
import { Upload, Music, Link, Tag, Loader2 } from 'lucide-react'

interface UploadFormProps {
  onSubmit: (data: {
    file: File | null
    url: string
    title: string
    genre: string
    feedbackFocus: string[]
  }) => Promise<void>
}

export const UploadForm = ({ onSubmit }: UploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [feedbackFocus, setFeedbackFocus] = useState<string[]>([])
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type and size
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Please upload an audio file')
        return
      }
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB')
        return
      }
      setFile(selectedFile)
      setUrl('') // Clear URL if file is selected
      setError('')
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    setFile(null) // Clear file if URL is entered
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file && !url) {
      setError('Please upload a file or provide a URL')
      return
    }
    if (!title) {
      setError('Please enter a title')
      return
    }
    if (!genre) {
      setError('Please select a genre')
      return
    }
    if (feedbackFocus.length === 0) {
      setError('Please select at least one feedback focus')
      return
    }

    setIsUploading(true)
    setError('')
    try {
      await onSubmit({ file, url, title, genre, feedbackFocus })
    } catch (err) {
      setError('Failed to upload track. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const genres = [
    'Rock', 'Pop', 'Hip Hop', 'Electronic', 'Jazz', 'Classical',
    'R&B', 'Country', 'Folk', 'Metal', 'Blues', 'Other'
  ]

  const focusOptions = [
    'Mixing', 'Composition', 'Arrangement', 'Lyrics', 'Vocals',
    'Instrumentation', 'Production', 'Sound Design'
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-[#111827] mb-6">Upload Your Track</h2>
      
      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Upload Audio File
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-[#6366F1] rounded-lg cursor-pointer hover:bg-[#6366F1]/5 transition-colors">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-[#6366F1] mr-2" />
            <span className="text-sm text-[#111827]">
              {file ? file.name : 'Choose a file'}
            </span>
          </label>
          <div className="text-sm text-gray-500">or</div>
          <input
            type="url"
            placeholder="Paste URL"
            value={url}
            onChange={handleUrlChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
          />
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Track Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter track title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
        />
      </div>

      {/* Genre */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Genre
        </label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
        >
          <option value="">Select a genre</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Feedback Focus */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Feedback Focus
        </label>
        <div className="grid grid-cols-2 gap-2">
          {focusOptions.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={feedbackFocus.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFeedbackFocus([...feedbackFocus, option])
                  } else {
                    setFeedbackFocus(feedbackFocus.filter(f => f !== option))
                  }
                }}
                className="rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1]"
              />
              <span className="text-sm text-[#111827]">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isUploading}
        className="w-full flex items-center justify-center px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#6366F1]/90 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Music className="w-5 h-5 mr-2" />
            Upload Track
          </>
        )}
      </button>
    </form>
  )
} 