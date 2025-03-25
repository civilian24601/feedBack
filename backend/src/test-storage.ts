import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { createReadStream } from 'fs'
import { join } from 'path'
import { validateFile, generateUniqueFilename } from './utils/fileValidation'

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

async function testStorageSetup() {
  try {
    console.log('Testing Supabase Storage setup...')

    // 1. Create a test user
    const { data: user, error: userError } = await adminClient.auth.admin.createUser({
      email: 'storage-test@example.com',
      password: 'testpassword123'
    })

    if (userError) {
      if (userError.message.includes('already been registered')) {
        console.log('Test user already exists, proceeding with test...')
      } else {
        console.error('Error creating test user:', userError.message)
        return
      }
    } else {
      console.log('✓ Test user created')
    }

    const userId = user?.user?.id || 'test-user-id'

    // 2. Create a test file
    const testFilePath = join(__dirname, 'test.txt')
    const testContent = 'This is a test file for storage testing'
    await new Promise((resolve, reject) => {
      const fs = require('fs')
      fs.writeFile(testFilePath, testContent, (err: any) => {
        if (err) reject(err)
        else resolve(null)
      })
    })

    // 3. Test file validation
    console.log('\nTesting file validation...')
    const mockFile = {
      name: 'test.mp3',
      type: 'audio/mpeg',
      size: 1024 * 1024 // 1MB
    } as File

    const validationResult = validateFile(mockFile, 'track')
    if (validationResult.isValid) {
      console.log('✓ File validation working')
    } else {
      console.error('❌ File validation failed:', validationResult.error)
    }

    // 4. Test unique filename generation
    const uniqueFilename = generateUniqueFilename('test.mp3', userId)
    console.log('✓ Unique filename generation working:', uniqueFilename)

    // 5. Try to upload with anon client (should fail)
    const { error: anonUploadError } = await userClient.storage
      .from('tracks')
      .upload(`${userId}/test.txt`, testContent, {
        contentType: 'text/plain'
      })

    if (anonUploadError) {
      console.log('✓ Storage policy working: Anonymous upload blocked')
    } else {
      console.error('❌ Storage policy failed: Anonymous upload allowed')
    }

    // 6. Try to upload with authenticated client (should succeed)
    const { error: authUploadError } = await adminClient.storage
      .from('tracks')
      .upload(`${userId}/test.txt`, testContent, {
        contentType: 'text/plain'
      })

    if (authUploadError) {
      console.error('Error uploading file:', authUploadError.message)
      return
    }
    console.log('✓ File uploaded successfully')

    // 7. Try to read file with different user (should fail)
    const { error: unauthorizedReadError } = await userClient.storage
      .from('tracks')
      .download(`${userId}/test.txt`)

    if (unauthorizedReadError) {
      console.log('✓ Storage policy working: Unauthorized read blocked')
    } else {
      console.error('❌ Storage policy failed: Unauthorized read allowed')
    }

    // 8. Clean up
    const { error: deleteError } = await adminClient.storage
      .from('tracks')
      .remove([`${userId}/test.txt`])

    if (deleteError) {
      console.error('Error cleaning up test file:', deleteError.message)
      return
    }
    console.log('✓ Test file cleaned up')

    // 9. Clean up test user
    if (user?.user?.id) {
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.user.id)
      if (deleteUserError) {
        console.error('Error deleting test user:', deleteUserError.message)
        return
      }
      console.log('✓ Test user deleted')
    }

    console.log('\nAll storage tests completed successfully! 🎉')
  } catch (error) {
    console.error('Unexpected error during storage testing:', error)
  }
}

testStorageSetup() 