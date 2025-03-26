import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Loader2, Music, Star, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

interface TrackWithFeedback {
  id: string
  title: string
  genre: string
  status: string
  uploaded_at: string
  feedback_received: {
    rating: number
    content: any
    submitted_at: string
  }[]
}

export const LibraryPage = () => {
  const { user } = useAuth()
  const [tracks, setTracks] = useState<TrackWithFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTracksWithFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select(`
            *,
            feedback_received:feedback(
              rating,
              content,
              submitted_at
            )
          `)
          .order('uploaded_at', { ascending: false })

        if (error) throw error
        setTracks(data || [])
      } catch (err) {
        setError('Failed to load your library')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTracksWithFeedback()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Library</h1>
        <p className="text-gray-600">
          View your track history and received feedback
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {tracks.map((track) => (
          <div key={track.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{track.title}</h3>
                  <p className="text-gray-600 text-sm">
                    Uploaded on {new Date(track.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  track.status === 'reviewed' 
                    ? 'bg-green-100 text-green-800'
                    : track.status === 'matched'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {track.status}
                </span>
              </div>

              {track.feedback_received.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Received Feedback</h4>
                  {track.feedback_received.map((feedback, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{feedback.rating}/5</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {feedback.content.overall}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No feedback received yet
                </p>
              )}

              <Link
                to={`/tracks/${track.id}`}
                className="mt-4 inline-flex items-center text-[#6366F1] hover:underline"
              >
                <Music className="w-4 h-4 mr-1" />
                View Details
              </Link>
            </div>
          </div>
        ))}

        {tracks.length === 0 && !error && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Your library is empty.
              <br />
              <Link to="/upload" className="text-[#6366F1] hover:underline">
                Upload your first track
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 