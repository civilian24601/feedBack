# Backend Structure: Feedback Swap Platform

## Database Schema (PostgreSQL)

### users
- id (uuid)
- email (text)
- created_at (timestamp)

### tracks
- id (uuid)
- user_id (uuid)
- title (text)
- url (text) or file_path (text)
- genre (text)
- status (enum: pending, matched, reviewed)
- uploaded_at (timestamp)

### matches
- id (uuid)
- track_a_id (uuid)
- track_b_id (uuid)
- completed (boolean)
- started_at (timestamp)

### feedback
- id (uuid)
- match_id (uuid)
- giver_id (uuid)
- receiver_id (uuid)
- content (jsonb)
- rating (int)
- flagged (boolean)
- submitted_at (timestamp)

### flags
- id (uuid)
- feedback_id (uuid)
- reason (text)
- flagger_id (uuid)
- status (enum: open, closed)

## Security & IP Logic
- Files are stored privately, accessible only to matched users
- Track theft concerns addressed via:
  - Flag/report system
  - TOS agreement
  - Timestamps for each upload
  - Optional watermarking feature (V2)
  - Admin action dashboard for take-downs

## Auth Logic
- Supabase Auth for user sign-up/login
- Anonymous users cannot upload or view tracks
