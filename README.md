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

### 1. Clone and enter project

```bash
git clone <your-repo-url>
cd hobbyboard
```

### 2. Backend setup

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a .env file in server/:

```env
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret-key
DATABASE_URL=sqlite:///hobbyboard.db
```

Run migrations and start API:

```bash
flask --app run.py db upgrade
python run.py
```

Backend runs at http://127.0.0.1:5000

### 3. Frontend setup

```bash
cd ../client
npm install
npm run dev
```

Frontend runs at http://127.0.0.1:5173

Note: client/src/services/api.js currently points to http://127.0.0.1:5000/api.

## Submission Checklist

- Public GitHub repository with complete code
- Clean commit history showing progress
- Proper .gitignore configuration
- README with setup + feature documentation
- Optional deployed links (Render/Netlify/etc.)

## Demo Script (2-3 Minutes)

1. Problem and audience
- "Hobby projects get scattered across notes, messages, and memory. HobbyBoard gives makers one place to organize boards and tasks."

2. Quick architecture
- "This app uses React on the frontend and Flask + SQLAlchemy on the backend, with JWT authentication and ownership-based authorization."

3. Auth flow
- Create a user (or log in), then show that dashboard data is user-specific.

4. Board CRUD
- Create a new board, edit it, and delete one board to show full CRUD.

5. Task CRUD inside a board
- Open a board, add tasks, change status/priority, edit a task, and delete a task.

6. Project updates
- Post a few milestone updates from a board and delete one to show the lightweight progress feed.

7. Ownership/security callout
- "All board/task routes are protected. Users can only read and modify their own records."

8. Wrap-up
- "HobbyBoard makes large hobby projects less overwhelming by turning ideas into trackable steps."

## Future Enhancements

- Materials list per board
- Notes and resource links
- Dashboard analytics
- Social sharing and collaboration
