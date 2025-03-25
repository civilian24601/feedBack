# Project Requirements Document: Feedback Swap Platform

## Overview
The Feedback Swap Platform is a secure, AI-assisted feedback exchange tool for music creators. Artists upload a track and are paired with another artist to exchange constructive feedback. Feedback is only revealed after both parties complete their review, creating a balanced and fair loop. The system supports audio playback, structured forms, and anti-abuse features.

## User Flows
1. Visitor lands on homepage and clicks “Swap Feedback.”
2. User uploads a track (file or link) and enters optional metadata.
3. User is added to a matchmaking queue.
4. Once matched, both users get the other’s track and a structured feedback form.
5. Feedback must be submitted before viewing received feedback.
6. Users rate the usefulness of the feedback and can flag abuse or theft concerns.
7. Admin reviews flagged content as needed.

## Tech Stack
- **Frontend**: React + TailwindCSS
- **Backend**: FastAPI or Supabase Edge Functions
- **Database**: Supabase (PostgreSQL + Auth)
- **File Storage**: Supabase Storage or AWS S3
- **Audio Player**: HTML5 / WaveSurfer.js
- **Optional AI**: GPT for moderation, suggestions, or tone refinement

## Core Features
- Audio upload and secure storage
- Anonymous two-way track feedback exchange
- Structured feedback form
- Feedback unlock gating
- Match history (optional)
- Abuse flagging and rating
- Track theft protections and security protocols

## In-Scope
- Matching logic
- Track security and controlled sharing
- Feedback form gating
- Dashboard with past feedback
- IP safety and abuse mitigation

## Out-of-Scope (V1)
- Artist discovery profiles
- In-app messaging
- Full DRM or watermarking
- Paid premium tiers

## Security & IP Protection
- Track files are private and visible only to the matched partner.
- All uploaded content is timestamped and linked to verified user IDs.
- Feedback is gated to ensure only reciprocal reviewers gain access.
- Users can flag suspected song theft or abuse; admin tools are available for takedown or account action.
- TOS includes strong IP ownership language and takedown process.
