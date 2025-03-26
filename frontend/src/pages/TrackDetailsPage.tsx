import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Loader2, Music, Clock, Tag } from 'lucide-react'

interface Track {
  id: string
  title: string
  genre: string
  status: 'pending' | 'matched' | 'reviewed'
  feedback_focus: string[]
  public_url: string
  uploaded_at: string
}

export const TrackDetailsPage = () => {
  const { trackId } = useParams()
  const { user } = useAuth()
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('id', trackId)
          .single()

        if (error) throw error
        setTrack(data)
      } catch (err) {
        setError('Failed to load track details')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrack()
  }, [trackId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
      </div>
    )
  }

  if (!track) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          Track not found
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {track.title}
        </h1>

        <div className="grid gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <Music className="w-5 h-5 mr-2" />
            <span>Genre: {track.genre}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>
              Uploaded: {new Date(track.uploaded_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Tag className="w-5 h-5 mr-2" />
            <div className="flex flex-wrap gap-2">
              {track.feedback_focus.map((focus) => (
                <span 
                  key={focus}
                  className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] rounded-full text-xs"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Status: {track.status}</h3>
          {track.status === 'pending' && (
            <p className="text-sm text-gray-600">
              Your track is waiting to be matched with another track for feedback.
            </p>
          )}
          {track.status === 'matched' && (
            <p className="text-sm text-gray-600">
              Your track has been matched! You can now give and receive feedback.
            </p>
          )}
          {track.status === 'reviewed' && (
            <p className="text-sm text-gray-600">
              Feedback exchange completed.
            </p>
          )}
        </div>

        {/* Audio player will go here */}
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          Audio player coming soon
        </div>
      </div>
    </div>
  )
} 