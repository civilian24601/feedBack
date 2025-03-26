import { useState, useEffect } from 'react'
import { Loader2, Clock, Music, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface QueueStatusProps {
  track: {
    id: string
    title: string
    genre: string
    feedback_focus: string[]
    status: string
    uploaded_at: string
  }
}

export const QueueStatus = ({ track }: QueueStatusProps) => {
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQueuePosition = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('id')
          .eq('status', 'pending')
          .lte('uploaded_at', track.uploaded_at)

        if (error) throw error

        // Queue position is the number of tracks that were uploaded before this one
        setQueuePosition(data.length)
      } catch (err) {
        console.error('Error fetching queue position:', err)
        setError('Failed to load queue position')
      } finally {
        setLoading(false)
      }
    }

    if (track.status === 'pending') {
      fetchQueuePosition()
    }
  }, [track])

  if (track.status !== 'pending') {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Queue Status</h3>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#6366F1]" />
        ) : null}
      </div>

      {error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>Queue Position: #{queuePosition}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Music className="w-5 h-5 mr-2" />
            <span>Genre: {track.genre}</span>
          </div>

          <div className="flex items-start text-gray-600">
            <Tag className="w-5 h-5 mr-2 mt-1" />
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

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Your track is in queue for matching. You'll be notified when a match is found.
              Estimated wait time: {queuePosition ? `${queuePosition * 5} minutes` : 'calculating...'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 