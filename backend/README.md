# FeedBack API Server

Backend server for the FeedBack music feedback exchange platform. Built with Express.js, TypeScript, and Supabase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Supabase credentials and other configuration.

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Build the TypeScript project
- `npm start`: Start the production server

## API Endpoints

### Health Check
- `GET /health`
  - Returns server status
  - No authentication required

### Tracks
All track endpoints require authentication via Bearer token

- `GET /api/tracks`
  - Get all tracks for authenticated user
  - Returns array of track objects

- `GET /api/tracks/:id`
  - Get a single track by ID
  - Returns track object or 404

- `POST /api/tracks`
  - Create a new track
  - Body: `{ title: string, genre?: string, feedback_focus?: string[] }`
  - Returns created track object

- `PUT /api/tracks/:id`
  - Update an existing track
  - Body: `{ title?: string, genre?: string, feedback_focus?: string[] }`
  - Returns updated track object

- `DELETE /api/tracks/:id`
  - Delete a track
  - Returns 204 on success

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The JWT token should be obtained from Supabase authentication. 