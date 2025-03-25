# Feedback Swap Platform

A secure, AI-assisted feedback exchange tool for music creators. Artists upload tracks and exchange constructive feedback in a protected environment.

## Features

- 🎵 Secure track upload and storage
- 🤝 Anonymous two-way feedback exchange
- 📝 Structured feedback forms
- 🔒 IP protection and security measures
- ⚡ Real-time audio playback
- 🚩 Abuse flagging and moderation

## Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: FastAPI/Supabase Edge Functions
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage/AWS S3
- **Audio**: WaveSurfer.js
- **Auth**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+ (if using FastAPI)
- Supabase account
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/feedback-swap.git
cd feedback-swap
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies (if using FastAPI):
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

5. Start the development server:
```bash
# Frontend
cd frontend
npm run dev

# Backend (if using FastAPI)
cd backend
uvicorn main:app --reload
```

## Project Structure

```
feedback-swap/
├── frontend/           # React + TailwindCSS
├── backend/           # FastAPI/Supabase Edge Functions
├── docs/             # Project documentation
└── README.md
```

## Development Guidelines

- Follow the coding style guide in `docs/FrontendGuidelines.md`
- Use 2-space indentation
- Write clear, documented code
- Test thoroughly before submitting PRs

## Security

- Never commit sensitive data or API keys
- Follow IP protection guidelines in `docs/BackendStructure.md`
- Report security issues responsibly

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- WaveSurfer.js for audio playback
- Supabase for backend infrastructure
- All contributors and early adopters 