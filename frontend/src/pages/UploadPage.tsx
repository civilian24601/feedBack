import { useState } from 'react'
import { UploadForm } from '../components/UploadForm'
import { uploadTrack } from '../services/storage'
import { useAuth } from '../hooks/useAuth'

export const UploadPage = () => {
  const { user } = useAuth()
  const [success, setSuccess] = useState(false)

  const handleUpload = async (data: {
    file: File | null
    url: string
    title: string
    genre: string
    feedbackFocus: string[]
  }) => {
    if (!user) {
      throw new Error('You must be logged in to upload tracks')
    }

    await uploadTrack(data, user.id)
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#111827] mb-4">
            Upload Your Track
          </h1>
          <p className="text-lg text-gray-600">
            Share your music and get valuable feedback from the community
          </p>
        </div>

        {success ? (
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#111827] mb-2">
                Track Uploaded Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your track is now being processed and will be available for feedback soon.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6366F1] hover:bg-[#6366F1]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366F1]"
              >
                Upload Another Track
              </button>
            </div>
          </div>
        ) : (
          <UploadForm onSubmit={handleUpload} />
        )}
      </div>
    </div>
  )
} 