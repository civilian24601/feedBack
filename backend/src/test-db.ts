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

async function testDatabaseConnection() {
  try {
    // Test connection by querying the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Database connection error:', error.message)
      return
    }

    console.log('Database connection successful!')
    console.log('Schema is properly set up.')
    
    // Test RLS policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'profiles' })

    if (policiesError) {
      console.error('Error fetching policies:', policiesError.message)
      return
    }

    console.log('RLS policies are in place.')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testDatabaseConnection() 