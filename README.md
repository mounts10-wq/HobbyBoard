# HobbyBoard

HobbyBoard is a full-stack app I built for hobbyists who want one place to track ideas, tasks, and progress. It continues the same direction as ProjectBoard, but adds board updates so milestones can be shared and tracked over time.

## Why I Built This

I wanted a cleaner way to manage personal projects from start to finish. HobbyBoard gives users a focused workflow: create boards, add tasks, post progress updates, and keep everything tied to their account.

## Features

- User signup, login, and logout
- JWT authentication
- Ownership-based authorization for boards, tasks, and updates
- Full CRUD for boards
- Full CRUD for tasks
- Board updates for posting milestone progress
- Board-level follows (follow one board without following all of a user's boards)
- Pagination on board and task endpoints
- Protected frontend routes for authenticated pages
- Planning assistant support for board-based next-step ideas

## Tech Stack

Frontend:
- React
- React Router
- Vite
- CSS

Backend:
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-CORS
- SQLite by default (or PostgreSQL via DATABASE_URL)

## Data Model

- User has many Boards
- Board belongs to User
- Board has many Tasks
- Board has many BoardUpdates
- Task belongs to Board

## API Summary

All backend endpoints are under /api.

Utility:
- GET /api/health
- GET /api/dashboard/stats (protected)

Auth:
- POST /api/signup
- POST /api/login
- GET /api/me
- POST /api/logout

Boards:
- GET /api/boards?page=1&per_page=10
- POST /api/boards
- GET /api/boards/:id
- PATCH /api/boards/:id
- DELETE /api/boards/:id

Tasks:
- GET /api/boards/:board_id/tasks?page=1&per_page=10
- POST /api/boards/:board_id/tasks
- GET /api/tasks/:id
- PATCH /api/tasks/:id
- DELETE /api/tasks/:id

Board Updates:
- GET /api/boards/:board_id/updates
- POST /api/boards/:board_id/updates
- DELETE /api/updates/:id

Social:
- GET /api/feed
- GET /api/discover/boards
- GET /api/me/following/boards
- POST /api/boards/:board_id/follow
- DELETE /api/boards/:board_id/follow

## Frontend Routes

- /
- /signup
- /login
- /dashboard (protected)
- /boards/:boardId (protected)

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 20+
- npm 10+

### 1. Clone the Repository

```bash
git clone https://github.com/mounts10-wq/HobbyBoard.git
cd HobbyBoard
```

### 2. Backend Setup (one-time)

```bash
cd server
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
```

Create a .env file in server/:

```env
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret-key-change-me-32chars
DATABASE_URL=sqlite:///hobbyboard.db
FLASK_RUN_HOST=127.0.0.1
FLASK_RUN_PORT=5000
FLASK_DEBUG=1
```

The app now stores its SQLite database in the server instance folder by default, so board and user data remain consistent across runs.

No migration command is required for local setup; tables are created automatically at app startup.

### 3. Frontend Setup (one-time)

Open a second terminal:

```bash
cd HobbyBoard/client
npm install
cp .env.example .env
```

The default frontend environment file points the app at the local backend:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

### 4. Start the App

Terminal 1 (backend):

```bash
cd HobbyBoard/server
source venv/bin/activate
python3 run.py
```

Terminal 2 (frontend):

```bash
cd HobbyBoard/client
npm run dev
```

If the backend is already running and you want to use a different port, set FLASK_RUN_PORT before launching the server.

App URLs:
- Backend: http://127.0.0.1:5000
- Frontend: http://127.0.0.1:5173

Note: The client API base URL currently points to http://127.0.0.1:5000/api.

## Troubleshooting

- If flask is not found, activate the virtual environment with source venv/bin/activate.
- If npm run dev fails, run npm install inside client/ first.
- If python is mapped to Python 2, use python3 commands exactly as shown.
- Keep backend and frontend running in separate terminals.
- Use Ctrl+C in each terminal to stop servers.
- To enable the AI planning assistant with a real model response, add ANTHROPIC_API_KEY to your server/.env file with your Anthropic key. Without that key, the assistant falls back to helpful local suggestions.

## Future Improvements

- Materials list on each board
- Notes and resource links
- More dashboard analytics
- Team collaboration and sharing

## Author

James Mounts

## License

This project is shared for portfolio and educational use.
