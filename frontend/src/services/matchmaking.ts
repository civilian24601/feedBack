import { SupabaseClient } from '@supabase/supabase-js'
import { Track, Match } from '../types'

// Scoring weights for match quality
const MATCH_WEIGHTS = {
  GENRE_MATCH: 3,
  FEEDBACK_FOCUS_MATCH: 2,
  WAITING_TIME: 1,
  RECIPROCAL_MATCH: 2
} as const

interface MatchScore {
  trackId: string
  userId: string
  score: number
  matchReason: string[]
}

export class MatchmakingService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  // Try to find perfect matches first (same genre + feedback focus)
  private async findPerfectMatch(track: Track): Promise<MatchScore | null> {
    const { data: candidates, error } = await this.supabase
      .from('tracks')
      .select('*')
      .eq('genre', track.genre)
      .contains('feedback_focus', track.feedback_focus)
      .neq('user_id', track.user_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5)

    if (error || !candidates?.length) return null

    const matchScore = candidates.map(candidate => ({
      trackId: candidate.id,
      userId: candidate.user_id,
      score: MATCH_WEIGHTS.GENRE_MATCH + MATCH_WEIGHTS.FEEDBACK_FOCUS_MATCH,
      matchReason: ['Same genre', 'Matching feedback focus']
    }))

    return matchScore[0]
  }

  // Try to find genre matches if perfect match isn't available
  private async findGenreMatch(track: Track): Promise<MatchScore | null> {
    const { data: candidates, error } = await this.supabase
      .from('tracks')
      .select('*')
      .eq('genre', track.genre)
      .neq('user_id', track.user_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5)

    if (error || !candidates?.length) return null

    const matchScore = candidates.map(candidate => ({
      trackId: candidate.id,
      userId: candidate.user_id,
      score: MATCH_WEIGHTS.GENRE_MATCH,
      matchReason: ['Same genre']
    }))

    return matchScore[0]
  }

  // Find any available match based on waiting time
  private async findAnyMatch(track: Track): Promise<MatchScore | null> {
    const { data: candidates, error } = await this.supabase
      .from('tracks')
      .select('*')
      .neq('user_id', track.user_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5)

    if (error || !candidates?.length) return null

    const matchScore = candidates.map(candidate => ({
      trackId: candidate.id,
      userId: candidate.user_id,
      score: MATCH_WEIGHTS.WAITING_TIME,
      matchReason: ['Longest waiting track']
    }))

    return matchScore[0]
  }

  // Check if users have previously reviewed each other's tracks
  private async checkReciprocalMatch(userId: string, candidateId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('feedback')
      .select('*')
      .or(`giver_id.eq.${userId},receiver_id.eq.${candidateId}`)
      .limit(1)

    return !error && data?.length > 0
  }

  // Main matchmaking function that tries different strategies
  public async findMatch(track: Track): Promise<Match | null> {
    try {
      // Try perfect match first
      const perfectMatch = await this.findPerfectMatch(track)
      if (perfectMatch) {
        const isReciprocal = await this.checkReciprocalMatch(track.user_id, perfectMatch.userId)
        if (isReciprocal) {
          perfectMatch.score += MATCH_WEIGHTS.RECIPROCAL_MATCH
          perfectMatch.matchReason.push('Reciprocal match')
        }
        return this.createMatch(track.id, perfectMatch)
      }

      // Try genre match if no perfect match
      const genreMatch = await this.findGenreMatch(track)
      if (genreMatch) {
        return this.createMatch(track.id, genreMatch)
      }

      // Last resort: any available match
      const anyMatch = await this.findAnyMatch(track)
      if (anyMatch) {
        return this.createMatch(track.id, anyMatch)
      }

      return null
    } catch (error) {
      console.error('Matchmaking error:', error)
      return null
    }
  }

  // Create the match in the database
  private async createMatch(trackId: string, matchScore: MatchScore): Promise<Match | null> {
    const { data, error } = await this.supabase
      .from('matches')
      .insert({
        track_a_id: trackId,
        track_b_id: matchScore.trackId,
        status: 'pending',
        match_score: matchScore.score,
        match_reason: matchScore.matchReason
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating match:', error)
      return null
    }

    // Update track statuses
    await this.supabase
      .from('tracks')
      .update({ status: 'matched' })
      .in('id', [trackId, matchScore.trackId])

    return data
  }
}

// Export factory function
export const createMatchmaking = (supabase: SupabaseClient) => new MatchmakingService(supabase) 