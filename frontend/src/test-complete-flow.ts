import { createClient } from '@supabase/supabase-js'
import { createMatchmaking } from './services/matchmaking'
import { createMatchmakingWorker } from './services/matchmaking-worker'
import { Track, Match, Feedback } from './types'

// Create Supabase client for testing
const supabase = createClient(
  'https://ncajmiqlzwbxpzjfpdag.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYWptaXFsendieHB6amZwZGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MjAzNTIsImV4cCI6MjA1ODQ5NjM1Mn0.CNiPXG_jNeydrZrMqCvDo41pdKreNmTGn7a7YkB1BNE'
)

// Create services
const matchmaking = createMatchmaking(supabase)
const matchmakingWorker = createMatchmakingWorker(supabase)

// Test account IDs
const TEST_ACCOUNT_1 = {
  id: '0d342573-7da1-40ec-87fa-df1c736d0878',
  email: 'alex.richard.hayes@gmail.com'
}

const TEST_ACCOUNT_2 = {
  id: 'ed6a86a9-5e4f-4ff1-836b-8d9504bb0cbd',
  email: 'civilian24601@protonmail.ch'
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getTracksByUser(userId: string): Promise<Track[]> {
  console.log(`Fetching tracks for user ${userId}...`)
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching tracks:', error)
    throw error
  }

  console.log(`Found ${data?.length || 0} tracks for user ${userId}:`, data)
  return data || []
}

async function submitFeedback(match: Match, feedback: Feedback): Promise<void> {
  const { error } = await supabase
    .from('feedback')
    .insert(feedback)

  if (error) throw error

  // Update match status
  await supabase
    .from('matches')
    .update({ status: 'completed' })
    .eq('id', match.id)
}

async function signInAsUser(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: 'testing123'
  })
  
  if (error) throw error
}

async function createTestTrack(userId: string, title: string): Promise<Track> {
  console.log(`Attempting to create track for user ${userId}...`)
  const { data, error } = await supabase
    .from('tracks')
    .insert({
      user_id: userId,
      title,
      genre: 'Rock',
      feedback_focus: ['mixing', 'composition'],
      public_url: 'https://example.com/test.mp3',
      status: 'pending',
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating track:', error)
    throw error
  }

  console.log('Track created successfully:', data)
  return data
}

async function testCompleteFlow() {
  console.log('🎯 Starting complete flow test...\n')

  try {
    // Sign in as first test user
    console.log('Signing in as test user 1...')
    await signInAsUser(TEST_ACCOUNT_1.email)
    console.log('Successfully signed in as test user 1')
    
    // Create track for first user
    console.log('Creating track for test user 1...')
    const track1 = await createTestTrack(TEST_ACCOUNT_1.id, 'Test Track 1')
    console.log('Successfully created track 1:', track1.id)

    // Sign in as second test user
    console.log('Signing in as test user 2...')
    await signInAsUser(TEST_ACCOUNT_2.email)
    console.log('Successfully signed in as test user 2')
    
    // Create track for second user
    console.log('Creating track for test user 2...')
    const track2 = await createTestTrack(TEST_ACCOUNT_2.id, 'Test Track 2')
    console.log('Successfully created track 2:', track2.id)

    // Wait a moment for the database to sync
    console.log('Waiting for database sync...')
    await sleep(1000)

    // 1. Get tracks for both test accounts
    console.log('Fetching tracks for test accounts...')
    const user1Tracks = await getTracksByUser(TEST_ACCOUNT_1.id)
    const user2Tracks = await getTracksByUser(TEST_ACCOUNT_2.id)

    if (!user1Tracks.length || !user2Tracks.length) {
      throw new Error('Both test accounts must have at least one track')
    }

    // 2. Reset track statuses to pending
    console.log('Resetting track statuses...')
    await supabase
      .from('tracks')
      .update({ status: 'pending' })
      .in('id', [...user1Tracks, ...user2Tracks].map(t => t.id))

    // 3. Start matchmaking worker
    console.log('Starting matchmaking worker...')
    matchmakingWorker.start(5000) // Run every 5 seconds

    // 4. Wait for matches to be created
    console.log('Waiting for matches...')
    let matches: Match[] = []
    let attempts = 0
    const maxAttempts = 12 // 1 minute total (12 * 5 seconds)

    while (attempts < maxAttempts) {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .or(`track_a_id.in.(${user1Tracks.map(t => t.id).join(',')}),track_b_id.in.(${user1Tracks.map(t => t.id).join(',')})`)
        .eq('status', 'pending')

      if (data && data.length > 0) {
        matches = data
        break
      }

      attempts++
      await sleep(5000)
    }

    if (matches.length === 0) {
      throw new Error('No matches were created within the timeout period')
    }

    // 5. Submit test feedback
    console.log('Submitting test feedback...')
    const testMatch = matches[0]
    const testFeedback: Feedback = {
      match_id: testMatch.id,
      giver_id: TEST_ACCOUNT_1.id,
      receiver_id: TEST_ACCOUNT_2.id,
      content: {
        overall: 'Great track! Really enjoyed the composition.',
        mixing: 'Good balance between elements.',
        composition: 'Interesting chord progressions.',
        creativity: 'Very unique sound design.',
        additional_notes: 'Keep up the great work!'
      },
      rating: 5,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    await submitFeedback(testMatch, testFeedback)

    // 6. Verify final states
    console.log('Verifying final states...')
    const { data: finalMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('id', testMatch.id)
      .single()

    if (finalMatch?.status !== 'completed') {
      throw new Error('Match status was not updated to completed')
    }

    const { data: finalFeedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('match_id', testMatch.id)
      .single()

    if (!finalFeedback) {
      throw new Error('Feedback was not saved correctly')
    }

    console.log('\n✅ Complete flow test passed!')
    console.log('Match details:', {
      id: finalMatch.id,
      score: finalMatch.match_score,
      reason: finalMatch.match_reason
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    // Stop the worker
    matchmakingWorker.stop()
  }
}

// Run the test
testCompleteFlow() 