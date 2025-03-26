import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'
import { QueueStatus } from '../components/QueueStatus'
import { Link } from 'react-router-dom'
import { Track, TrackStatus } from '../types'

export const DashboardPage = () => {
  const { user } = useAuth()
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .order('uploaded_at', { ascending: false })

        if (error) throw error
        setTracks(data || [])
      } catch (err) {
        setError('Failed to load tracks')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
      </div>
    )
  }

  const pendingTracks = tracks.filter(track => track.status === 'pending')
  const matchedTracks = tracks.filter(track => track.status === 'matched')
  const reviewedTracks = tracks.filter(track => track.status === 'reviewed')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Tracks</h1>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6366F1] hover:bg-[#6366F1]/90"
        >
          Upload New Track
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {tracks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No tracks uploaded yet.
            <Link to="/upload" className="text-[#6366F1] ml-1 hover:underline">
              Upload your first track
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Tracks */}
          {pendingTracks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                In Queue ({pendingTracks.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {pendingTracks.map(track => (
                  <QueueStatus key={track.id} track={track} />
                ))}
              </div>
            </section>
          )}

          {/* Matched Tracks */}
          {matchedTracks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Matches ({matchedTracks.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {matchedTracks.map(track => (
                  <div key={track.id} className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold">{track.title}</h3>
                    <p className="text-sm text-gray-500">Matched - Feedback pending</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviewed Tracks */}
          {reviewedTracks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Completed ({reviewedTracks.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {reviewedTracks.map(track => (
                  <div key={track.id} className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold">{track.title}</h3>
                    <p className="text-sm text-gray-500">Review completed</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
} 