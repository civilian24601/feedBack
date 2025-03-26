import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Loader2, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

interface MatchedTrack {
  id: string
  title: string
  genre: string
  feedback_focus: string[]
  match_id: string
  artist_name: string
  matched_at: string
}

export const GiveFeedbackPage = () => {
  const { user } = useAuth()
  const [tracks, setTracks] = useState<MatchedTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMatchedTracks = async () => {
      try {
        // Fetch tracks that are matched with the user's tracks and need feedback
        const { data, error } = await supabase
          .from('matches')
          .select(`
            id,
            track_b_id,
            tracks:track_b_id (
              id,
              title,
              genre,
              feedback_focus,
              profiles:user_id (
                username,
                full_name
              )
            )
          `)
          .eq('track_a_user_id', user?.id)
          .eq('status', 'pending')

        if (error) throw error
        setTracks(data?.map(match => ({
          ...match.tracks,
          match_id: match.id,
          artist_name: match.tracks.profiles.username || match.tracks.profiles.full_name
        })) || [])
      } catch (err) {
        setError('Failed to load tracks waiting for feedback')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatchedTracks()
  }, [user])

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Give Feedback</h1>
        <p className="text-gray-600">
          Help other artists improve by providing thoughtful feedback on their tracks.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => (
          <div key={track.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{track.title}</h3>
              <p className="text-gray-600 text-sm mb-4">By {track.artist_name}</p>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">
                  Genre: {track.genre}
                </div>
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

              <Link
                to={`/feedback/${track.match_id}`}
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#6366F1] text-white rounded-md hover:bg-[#6366F1]/90 transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Give Feedback
              </Link>
            </div>
          </div>
        ))}

        {tracks.length === 0 && !error && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No tracks waiting for feedback.
              <br />
              <Link to="/upload" className="text-[#6366F1] hover:underline">
                Upload a track
              </Link>
              {' '}to join the feedback exchange.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 