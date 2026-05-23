# Frontend Setup and Backend Connection

This frontend talks to the backend through the API helper in `src/lib/api.js`.

## Required Local Setup

The frontend expects the backend to be running locally, and the backend must be able to connect to MySQL before it will start listening for requests.

Backend defaults used by this project:

- Frontend app: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Backend API routes: `http://localhost:8080/api/...`

## Frontend Environment Variable

Create or update `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

This matters because the frontend API wrapper calls paths like:

- `/auth/login`
- `/auth/register`
- `/me`
- `/cases`

Those requests are built relative to `VITE_API_BASE_URL`, so the value must include `/api`.

Example:

- Correct: `http://localhost:8080/api`
- Incorrect: `http://localhost:8080/`

If you use `http://localhost:8080/`, the frontend will request routes like `http://localhost:8080/auth/login`, but the backend only exposes `http://localhost:8080/api/auth/login`.

## Backend Environment Variable

In `backend/.env`, make sure this matches the local Vite frontend origin:

```env
FRONTEND_URL=http://localhost:5173
```

That value is used by backend CORS configuration.

## How To Run Locally

Start the backend first:

```powershell
cd backend
npm install
npm run dev
```

Then start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Quick Connection Check

Once the backend is running, this URL should respond:

```text
http://localhost:8080/api/health
```

If that works, the frontend should be able to connect as long as `VITE_API_BASE_URL` is set correctly.

## Common Reasons Connection Fails

1. `frontend/.env` is missing `/api`.
2. The backend is not running on port `8080`.
3. MySQL is down, so the backend never finishes startup.
4. `FRONTEND_URL` in `backend/.env` does not match `http://localhost:5173`.
5. The frontend dev server was not restarted after changing `frontend/.env`.