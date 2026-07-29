# HobbyBoard

HobbyBoard is a full-stack project organizer for hobbyists who want one place to track ideas, tasks, and progress. It is being shaped as the next portfolio project after ProjectBoard, with a broader focus on planning, community, and collaboration.

Target users include makers, builders, and creatives working on projects like car restoration, crochet, woodworking, gardening, photography, cooking, gaming, and side projects.

## Project Goals

- Build a full React + Flask CRUD application
- Implement authentication with protected, user-owned data
- Model related resources for hobby projects
- Deliver a polished and presentation-ready user experience

## Core Functionality

- User signup, login, and logout
- JWT authentication
- Ownership-based authorization for boards and tasks
- Full CRUD for boards
- Full CRUD for tasks
- Board progress updates for sharing milestones
- Pagination support on list endpoints
- Responsive frontend with polished visual states

## Tech Stack

### Frontend

- React
- React Router
- Vite
- CSS

### Backend

- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-CORS
- SQLite (default) or PostgreSQL via DATABASE_URL

## Data Model

- User has many Boards
- Board belongs to User and has many Tasks
- Task belongs to Board

## API Overview

All backend routes are served under /api.

### Auth

- POST /api/signup
- POST /api/login
- GET /api/me
- POST /api/logout

### Boards

- GET /api/boards?page=1&per_page=10
- POST /api/boards
- GET /api/boards/:id
- PATCH /api/boards/:id
- DELETE /api/boards/:id

### Tasks

- GET /api/boards/:board_id/tasks?page=1&per_page=10
- POST /api/boards/:board_id/tasks
- GET /api/tasks/:id
- PATCH /api/tasks/:id
- DELETE /api/tasks/:id

### Board Updates

- GET /api/boards/:board_id/updates
- POST /api/boards/:board_id/updates
- DELETE /api/updates/:id

## Frontend Routes

- /
- /signup
- /login
- /dashboard
- /boards/:boardId

## Local Setup

### 1. Clone and enter the project

```bash
git clone <your-repo-url>
cd HobbyBoard
```

### 2. Backend setup

Create and activate a virtual environment, then install the Python packages:

```bash
cd server
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
```

Create a `.env` file inside `server/` with:

```env
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret-key
DATABASE_URL=sqlite:///hobbyboard.db
```

With the virtual environment still activated, run the database migration:

```bash
python3 -m flask --app run.py db upgrade
```

Start the backend server:

```bash
python3 run.py
```

Backend runs at `http://127.0.0.1:5000`

### 3. Frontend setup

Open a second terminal from the project root and run:

```bash
cd HobbyBoard/client
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`

### After first-time setup

If you already cloned the repo, created the virtual environment, and installed dependencies, you do not need to repeat the full setup.

Use these shorter commands instead.

Terminal 1: backend

```bash
cd HobbyBoard/server
source venv/bin/activate
python3 -m flask --app run.py db upgrade
python3 run.py
```

Terminal 2: frontend

```bash
cd HobbyBoard/client
npm run dev
```

### Copy-paste run flow

If you want the exact startup flow from a fresh clone on macOS or Linux, use these two terminals.

Terminal 1: backend

```bash
git clone <your-repo-url>
cd HobbyBoard/server
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
cat > .env <<'EOF'
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret-key
DATABASE_URL=sqlite:///hobbyboard.db
EOF
python3 -m flask --app run.py db upgrade
python3 run.py
```

Terminal 2: frontend

```bash
cd HobbyBoard/client
npm install
npm run dev
```

Note: client/src/services/api.js currently points to http://127.0.0.1:5000/api.

### Troubleshooting

- If `python` points to Python 2 or is missing packages, use `python3` exactly as shown above.
- If `flask --app run.py db upgrade` does not work, use `python3 -m flask --app run.py db upgrade`.
- Keep the backend running in `server/` and the frontend running in `client/` in separate terminals.

## Future Enhancements

- Materials list per board
- Notes and resource links
- Dashboard analytics
- Social sharing and collaboration
