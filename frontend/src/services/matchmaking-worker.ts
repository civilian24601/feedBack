import { SupabaseClient } from '@supabase/supabase-js'
import { createMatchmaking } from './matchmaking'
import { Track } from '../types'

interface MatchmakingStats {
  totalProcessed: number
  matchesCreated: number
  errors: number
  startTime: Date
  lastRunTime: Date | null
}

export class MatchmakingWorker {
  private isRunning: boolean = false
  private supabase: SupabaseClient
  private matchmaking: ReturnType<typeof createMatchmaking>
  private stats: MatchmakingStats = {
    totalProcessed: 0,
    matchesCreated: 0,
    errors: 0,
    startTime: new Date(),
    lastRunTime: null
  }

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.matchmaking = createMatchmaking(supabase)
  }

  // Process a batch of pending tracks
  private async processBatch(batchSize: number = 10): Promise<number> {
    const { data: pendingTracks, error } = await this.supabase
      .from('tracks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(batchSize)

    if (error) {
      console.error('Error fetching pending tracks:', error)
      return 0
    }

    let matchesCreated = 0

    for (const track of pendingTracks) {
      try {
        const match = await this.matchmaking.findMatch(track)
        if (match) {
          matchesCreated++
          this.stats.matchesCreated++
        }
        this.stats.totalProcessed++
      } catch (error) {
        console.error('Error processing track:', error)
        this.stats.errors++
      }
    }

    return matchesCreated
  }

  // Main processing loop
  public async start(intervalMs: number = 30000): Promise<void> {
    if (this.isRunning) {
      console.log('Matchmaking worker is already running')
      return
    }

    this.isRunning = true
    console.log('Starting matchmaking worker...')

    while (this.isRunning) {
      try {
        const matchesCreated = await this.processBatch()
        this.stats.lastRunTime = new Date()

        if (matchesCreated > 0) {
          console.log(`Created ${matchesCreated} matches`)
        }

        // Wait for the next interval
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      } catch (error) {
        console.error('Error in matchmaking worker:', error)
        this.stats.errors++
      }
    }
  }

  public stop(): void {
    this.isRunning = false
    console.log('Stopping matchmaking worker...')
  }

  public getStats(): MatchmakingStats {
    return { ...this.stats }
  }

  // Reset stats but keep the worker running if it is
  public resetStats(): void {
    this.stats = {
      totalProcessed: 0,
      matchesCreated: 0,
      errors: 0,
      startTime: new Date(),
      lastRunTime: null
    }
  }
}

// Export factory function
export const createMatchmakingWorker = (supabase: SupabaseClient) => new MatchmakingWorker(supabase) 