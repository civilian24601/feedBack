import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

// Create two clients: one with service role (admin) and one with anon key (user)
const adminClient = createClient(supabaseUrl, supabaseServiceKey)
const userClient = createClient(supabaseUrl, supabaseAnonKey)

async function testRLSPolicies() {
  try {
    console.log('Testing Row Level Security policies...')

    let userId: string

    // 1. Create or get test user
    const { data: user, error: userError } = await adminClient.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123'
    })

    if (userError) {
      if (userError.message.includes('already been registered')) {
        console.log('Test user already exists, fetching user data...')
        // List all users and find our test user
        const { data: users, error: listError } = await adminClient.auth.admin.listUsers()
        if (listError) {
          console.error('Error listing users:', listError.message)
          return
        }
        const testUser = users.users.find(u => u.email === 'test@example.com')
        if (!testUser) {
          console.error('Could not find test user')
          return
        }
        userId = testUser.id
        console.log('✓ Found existing test user')
      } else {
        console.error('Error creating test user:', userError.message)
        return
      }
    } else {
      userId = user.user.id
      console.log('✓ Test user created')
    }

    // 2. Create a test track using admin client
    const { data: track, error: trackError } = await adminClient
      .from('tracks')
      .insert([
        {
          user_id: userId,
          title: 'Test Track',
          genre: 'Test Genre',
          feedback_focus: ['mixing', 'composition']
        }
      ])
      .select()
      .single()

    if (trackError) {
      console.error('Error creating test track:', trackError.message)
      return
    }

    console.log('✓ Test track created')

    // 3. Try to access the track with anon client (should fail)
    const { data: unauthorizedTrack, error: unauthorizedError } = await userClient
      .from('tracks')
      .select('*')
      .eq('id', track.id)
      .single()

    if (unauthorizedError) {
      console.log('✓ RLS policy working: Unauthorized access blocked')
    } else {
      console.error('❌ RLS policy failed: Unauthorized access allowed')
    }

    // 4. Clean up test data using admin client
    const { error: deleteError } = await adminClient
      .from('tracks')
      .delete()
      .eq('id', track.id)

    if (deleteError) {
      console.error('Error cleaning up test data:', deleteError.message)
      return
    }

    console.log('✓ Test data cleaned up')

    console.log('\nAll RLS tests completed successfully! 🎉')
  } catch (error) {
    console.error('Unexpected error during RLS testing:', error)
  }
}

testRLSPolicies() 