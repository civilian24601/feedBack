import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'
import { Match, Track, FeedbackContent } from '../types'

export const FeedbackPage = () => {
  const { matchId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [match, setMatch] = useState<Match | null>(null)
  const [track, setTrack] = useState<Track | null>(null)
  const [feedback, setFeedback] = useState<FeedbackContent>({
    overall: '',
    mixing: '',
    composition: '',
    creativity: '',
    additional_notes: '',
    rating: undefined
  })

  useEffect(() => {
    const fetchMatchAndTrack = async () => {
      try {
        // Fetch match details
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single()

        if (matchError) throw matchError

        setMatch(matchData)

        // Determine which track to show (the one that's not the user's)
        const trackToReview = matchData.track_a_id === user?.id 
          ? matchData.track_b_id 
          : matchData.track_a_id

        // Fetch track details
        const { data: trackData, error: trackError } = await supabase
          .from('tracks')
          .select('*')
          .eq('id', trackToReview)
          .single()

        if (trackError) throw trackError

        setTrack(trackData)
      } catch (err) {
        setError('Failed to load match details')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatchAndTrack()
  }, [matchId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          match_id: matchId,
          giver_id: user?.id,
          receiver_id: track?.user_id,
          content: feedback
        })

      if (feedbackError) throw feedbackError

      navigate('/dashboard')
    } catch (err) {
      setError('Failed to submit feedback')
      console.error('Error:', err)
    }
  }

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseInt(e.target.value)
    setFeedback(prev => ({
      ...prev,
      rating: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Give Feedback
        </h1>

        {match?.status === 'completed' && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6">
            This match has already been completed.
          </div>
        )}

        {track && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2">{track.title}</h2>
            <p className="text-gray-600">Genre: {track.genre}</p>
            <p className="text-gray-600 mt-1">Match Status: {match?.status}</p>
          </div>
        )}

        {/* Audio player will go here */}
        <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
          Audio player coming soon
        </div>

        {match?.status !== 'completed' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Feedback
              </label>
              <textarea
                value={feedback.overall}
                onChange={(e) => setFeedback({...feedback, overall: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mixing Feedback
              </label>
              <textarea
                value={feedback.mixing}
                onChange={(e) => setFeedback({...feedback, mixing: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Composition Feedback
              </label>
              <textarea
                value={feedback.composition}
                onChange={(e) => setFeedback({...feedback, composition: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={feedback.rating ?? ''}
                onChange={handleRatingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#6366F1] text-white py-2 px-4 rounded-md hover:bg-[#6366F1]/90"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  )
} 