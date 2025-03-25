import { Router } from 'express'
import { supabase } from '../server'

const router = Router()

// Get all tracks for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', req.user?.id)

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get a single track
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Track not found' })
    }
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create a new track
router.post('/', async (req, res) => {
  try {
    const { title, genre, feedback_focus } = req.body
    const { data, error } = await supabase
      .from('tracks')
      .insert([
        {
          title,
          genre,
          feedback_focus,
          user_id: req.user?.id
        }
      ])
      .select()

    if (error) throw error
    res.status(201).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update a track
router.put('/:id', async (req, res) => {
  try {
    const { title, genre, feedback_focus } = req.body
    const { data, error } = await supabase
      .from('tracks')
      .update({
        title,
        genre,
        feedback_focus,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user?.id) // Ensure user owns the track
      .select()

    if (error) throw error
    if (!data?.length) {
      return res.status(404).json({ error: 'Track not found or unauthorized' })
    }
    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete a track
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user?.id) // Ensure user owns the track

    if (error) throw error
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router 