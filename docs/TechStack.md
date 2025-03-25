# Tech Stack: Feedback Swap Platform

## Frontend
- **React** for SPA framework
- **TailwindCSS** for UI components
- **WaveSurfer.js** for waveform playback
- **React Router** for navigation

## Backend
- **FastAPI** (or Supabase Edge Functions for simplicity)
- **Python** for backend logic and pairing system
- **Supabase** for DB, auth, and storage

## Database
- **Supabase PostgreSQL**
  - Tables: users, tracks, matches, feedback, flags

## Storage
- Supabase Storage or AWS S3
  - All files private by default
  - Accessible only to matched users

## Auth
- Supabase Auth (email/password or magic link)

## AI (Optional)
- GPT-4 API for:
  - Tone moderation
  - Suggested feedback prompts
  - Anti-plagiarism detection heuristics

## Email (Optional)
- Resend or Postmark for match and feedback notifications
