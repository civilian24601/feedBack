import { useEffect, useState } from 'react'
import { createMatchmakingWorker } from '../services/matchmaking-worker'
import { supabase } from '../lib/supabase'

interface MatchmakingStats {
  totalTracks: number
  pendingTracks: number
  totalMatches: number
  pendingMatches: number
  successRate: number
  lastRun: string | null
  errors: string[]
}

export const MatchmakingMonitor = () => {
  const [stats, setStats] = useState<MatchmakingStats>({
    totalTracks: 0,
    pendingTracks: 0,
    totalMatches: 0,
    pendingMatches: 0,
    successRate: 0,
    lastRun: null,
    errors: []
  })

  useEffect(() => {
    // Create a new instance of the matchmaking worker
    const worker = createMatchmakingWorker(supabase)
    
    // Start the worker
    worker.start(5000) // Run every 5 seconds

    // Function to fetch stats
    const fetchStats = async () => {
      try {
        // Get track stats
        const { data: tracks } = await supabase
          .from('tracks')
          .select('status')

        const totalTracks = tracks?.length || 0
        const pendingTracks = tracks?.filter(t => t.status === 'pending').length || 0

        // Get match stats
        const { data: matches } = await supabase
          .from('matches')
          .select('status')

        const totalMatches = matches?.length || 0
        const pendingMatches = matches?.filter(m => m.status === 'pending').length || 0

        // Calculate success rate
        const successRate = totalMatches > 0 
          ? (matches?.filter(m => m.status === 'completed').length || 0) / totalMatches * 100 
          : 0

        setStats({
          totalTracks,
          pendingTracks,
          totalMatches,
          pendingMatches,
          successRate,
          lastRun: new Date().toISOString(),
          errors: []
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(prev => ({
          ...prev,
          errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error']
        }))
      }
    }

    // Initial fetch
    fetchStats()

    // Set up interval for updates
    const interval = setInterval(fetchStats, 5000)

    // Cleanup
    return () => {
      clearInterval(interval)
      worker.stop()
    }
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Matchmaking Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold">Tracks</h3>
          <p>Total: {stats.totalTracks}</p>
          <p>Pending: {stats.pendingTracks}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold">Matches</h3>
          <p>Total: {stats.totalMatches}</p>
          <p>Pending: {stats.pendingMatches}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold">Performance</h3>
          <p>Success Rate: {stats.successRate.toFixed(1)}%</p>
          <p>Last Run: {stats.lastRun ? new Date(stats.lastRun).toLocaleString() : 'Never'}</p>
        </div>
      </div>

      {stats.errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded">
          <h3 className="font-semibold text-red-700">Errors</h3>
          <ul className="list-disc list-inside">
            {stats.errors.map((error, index) => (
              <li key={index} className="text-red-600">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 