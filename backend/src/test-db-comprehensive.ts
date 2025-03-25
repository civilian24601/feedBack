import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseSetup() {
  try {
    console.log('Starting comprehensive database test...')

    // 1. Test profiles table
    console.log('\n1. Testing profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.error('Error querying profiles:', profilesError.message)
      return
    }
    console.log('✓ Profiles table is accessible')

    // 2. Test tracks table
    console.log('\n2. Testing tracks table...')
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('*')
      .limit(1)

    if (tracksError) {
      console.error('Error querying tracks:', tracksError.message)
      return
    }
    console.log('✓ Tracks table is accessible')

    // 3. Test matches table
    console.log('\n3. Testing matches table...')
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(1)

    if (matchesError) {
      console.error('Error querying matches:', matchesError.message)
      return
    }
    console.log('✓ Matches table is accessible')

    // 4. Test feedback table
    console.log('\n4. Testing feedback table...')
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .limit(1)

    if (feedbackError) {
      console.error('Error querying feedback:', feedbackError.message)
      return
    }
    console.log('✓ Feedback table is accessible')

    // 5. Test flags table
    console.log('\n5. Testing flags table...')
    const { data: flags, error: flagsError } = await supabase
      .from('flags')
      .select('*')
      .limit(1)

    if (flagsError) {
      console.error('Error querying flags:', flagsError.message)
      return
    }
    console.log('✓ Flags table is accessible')

    // 6. Test track_status enum
    console.log('\n6. Testing track_status enum...')
    const { data: enumTest, error: enumError } = await supabase
      .rpc('get_track_status_enum_values')

    if (enumError) {
      console.error('Error testing enum:', enumError.message)
      return
    }
    console.log('✓ Track status enum is working')

    console.log('\nAll database tests passed successfully! 🎉')
    console.log('Your database is properly set up and ready to use.')
  } catch (error) {
    console.error('Unexpected error during testing:', error)
  }
}

testDatabaseSetup() 