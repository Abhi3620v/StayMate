# StayMate

Find Your Perfect Stay. Find Your Perfect Roommate.

StayMate is a modern accommodation discovery platform built specifically for students and working professionals. It solves the complete rental journey—from property browsing to real-time communication and roommate matching.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Context API
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB Atlas, Mongoose
- **Storage:** Cloudinary

## Monorepo Project Structure
- `/frontend`: React client SPA
- `/backend`: Node/Express REST API & Socket.io server

## Getting Started
1. Run `npm install` at the root to install all workspaces dependencies.
2. Setup environment variables inside `/frontend/.env` and `/backend/.env` (see respective `.env.example` files).
3. Start both development servers concurrently:
   ```bash
   npm run dev
   ```
