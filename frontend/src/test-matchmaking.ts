import { supabase } from './lib/supabase'
import { matchmaking } from './services/matchmaking'
import { Track } from './types'

const TEST_USERS = {
  ALICE: {
    id: 'test_alice',
    email: 'alice@test.com'
  },
  BOB: {
    id: 'test_bob',
    email: 'bob@test.com'
  },
  CHARLIE: {
    id: 'test_charlie',
    email: 'charlie@test.com'
  }
}

const TEST_TRACKS = {
  ROCK_TRACK: {
    title: 'Test Rock Track',
    genre: 'Rock',
    feedback_focus: ['mixing', 'composition'],
    status: 'pending'
  },
  ROCK_TRACK_DIFFERENT_FOCUS: {
    title: 'Another Rock Track',
    genre: 'Rock',
    feedback_focus: ['creativity', 'arrangement'],
    status: 'pending'
  },
  POP_TRACK: {
    title: 'Test Pop Track',
    genre: 'Pop',
    feedback_focus: ['mixing', 'creativity'],
    status: 'pending'
  }
}

interface TestResult {
  scenario: string
  success: boolean
  matchScore?: number
  matchReason?: string[]
  error?: string
}

async function cleanupTestData() {
  await supabase.from('matches').delete().eq('track_a_id', 'test_track')
  await supabase.from('tracks').delete().in('user_id', Object.values(TEST_USERS).map(u => u.id))
}

async function createTestTrack(userId: string, trackData: Partial<Track>): Promise<Track | null> {
  const { data, error } = await supabase
    .from('tracks')
    .insert({
      ...trackData,
      user_id: userId,
      public_url: 'https://example.com/test.mp3'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating test track:', error)
    return null
  }

  return data
}

async function runTestScenario(
  scenario: string,
  trackA: Track | null,
  expectedScore?: number,
  expectedReason?: string[]
): Promise<TestResult> {
  if (!trackA) {
    return {
      scenario,
      success: false,
      error: 'Failed to create test track'
    }
  }

  try {
    const match = await matchmaking.findMatch(trackA)

    if (!match) {
      return {
        scenario,
        success: false,
        error: 'No match found'
      }
    }

    const success = !expectedScore || match.match_score === expectedScore

    return {
      scenario,
      success,
      matchScore: match.match_score,
      matchReason: match.match_reason
    }
  } catch (error) {
    return {
      scenario,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testMatchmaking() {
  console.log('🎵 Starting matchmaking tests...\n')
  const results: TestResult[] = []

  try {
    await cleanupTestData()

    // Test 1: Perfect Match (same genre and feedback focus)
    console.log('Setting up perfect match test...')
    const aliceTrack = await createTestTrack(TEST_USERS.ALICE.id, TEST_TRACKS.ROCK_TRACK)
    const bobTrack = await createTestTrack(TEST_USERS.BOB.id, TEST_TRACKS.ROCK_TRACK)
    results.push(
      await runTestScenario(
        'Perfect Match Test',
        aliceTrack,
        5, // GENRE_MATCH + FEEDBACK_FOCUS_MATCH
        ['Same genre', 'Matching feedback focus']
      )
    )

    await cleanupTestData()

    // Test 2: Genre-only Match
    console.log('Setting up genre-only match test...')
    const charlieTrack = await createTestTrack(TEST_USERS.CHARLIE.id, TEST_TRACKS.ROCK_TRACK)
    const bobDiffFocusTrack = await createTestTrack(TEST_USERS.BOB.id, TEST_TRACKS.ROCK_TRACK_DIFFERENT_FOCUS)
    results.push(
      await runTestScenario(
        'Genre-only Match Test',
        charlieTrack,
        3, // GENRE_MATCH only
        ['Same genre']
      )
    )

    await cleanupTestData()

    // Test 3: Fallback Match (different genre, waiting time based)
    console.log('Setting up fallback match test...')
    const alicePopTrack = await createTestTrack(TEST_USERS.ALICE.id, TEST_TRACKS.POP_TRACK)
    const bobRockTrack = await createTestTrack(TEST_USERS.BOB.id, TEST_TRACKS.ROCK_TRACK)
    results.push(
      await runTestScenario(
        'Fallback Match Test',
        alicePopTrack,
        1, // WAITING_TIME only
        ['Longest waiting track']
      )
    )

    // Print results
    console.log('\n📊 Test Results:\n')
    results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.scenario}`)
      if (result.matchScore) console.log(`   Score: ${result.matchScore}`)
      if (result.matchReason) console.log(`   Reason: ${result.matchReason.join(', ')}`)
      if (result.error) console.log(`   Error: ${result.error}`)
      console.log('')
    })

    const allPassed = results.every(r => r.success)
    console.log(allPassed ? '🎉 All tests passed!' : '❌ Some tests failed')

  } catch (error) {
    console.error('❌ Test suite failed:', error)
  } finally {
    await cleanupTestData()
  }
}

// Run the tests
testMatchmaking() 