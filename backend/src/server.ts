import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import tracksRouter from './routes/tracks'
import { requireAuth } from './middleware/auth'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

// Parse JSON bodies
app.use(express.json())

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Protected routes
app.use('/api/tracks', requireAuth, tracksRouter)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something broke!' })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 