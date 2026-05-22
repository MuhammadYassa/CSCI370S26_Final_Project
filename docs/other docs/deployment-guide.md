# Deployment Guide

## Overview

This guide describes how to deploy the CSCI370 Renter Dispute Assistant MVP in a local development or classroom demonstration environment. The repository is designed around a split frontend/backend architecture:

- React + Vite frontend
- Express + MySQL backend
- local filesystem storage for evidence uploads and generated PDFs
- external AI API for arbitration

## Deployment Target

The current repository is best deployed as:

- one frontend process
- one backend process
- one MySQL instance
- one local filesystem for generated files

This is an MVP deployment model, not a hardened production architecture.

## Software Requirements

- Node.js 18+ recommended
- npm
- MySQL 8.x recommended
- Windows PowerShell for the documented commands

## Directory Dependencies

The deployment relies on these existing directories:

- `backend/generated/forms/`
- `backend/uploads/evidence/`
- `backend/templates/legal-forms/ny/`

The upload and generated-form directories are created automatically when needed. The legal-form templates must already exist in the repository.

## Environment Variables

Create `backend/.env` using `backend/.env.example` as the baseline.

Required values:

```env
PORT=8080
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=renter_dispute_app
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d
AI_PROVIDER=GEMINI
AI_API_KEY=replace_with_real_ai_key
AI_API_URL=https://generativelanguage.googleapis.com/v1beta
AI_MODEL=gemini-2.5-flash-lite
AI_TIMEOUT_MS=30000
AI_INCLUDE_IMAGE_EVIDENCE=true
AI_MAX_IMAGES_PER_SIDE=1
AI_USE_STRUCTURED_OUTPUT=true
```

## Initial Deployment Steps

### 1. Install backend dependencies

```powershell
cd backend
npm.cmd install
```

### 2. Install frontend dependencies

```powershell
cd ..\frontend
npm.cmd install
```

### 3. Create the database schema

```powershell
cd ..\backend
mysql -u root -p --execute="source sql/schema.sql"
```

If upgrading from an older ticket-stage database instead of a fresh database, use the included migration scripts:

- `backend/sql/ticket2-migration.sql`
- `backend/sql/ticket3-migration.sql`

### 4. Start the backend

```powershell
cd backend
npm.cmd run dev
```

### 5. Confirm backend connectivity

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
```

### 6. Start the frontend

```powershell
cd ..\frontend
npm.cmd run dev
```

## Operational Checks After Deployment

After both services start, verify:

- backend health check returns `status: ok`
- frontend loads in the browser
- renter registration works
- renter login returns a token
- case creation succeeds
- MySQL tables are populated

## File Storage Behavior

The backend uses local disk storage for generated artifacts:

- evidence images are stored under `backend/uploads/evidence/`
- generated PDFs are stored under `backend/generated/forms/`

Deployment implication:

- if the deployment machine is wiped or the directories are not preserved, uploaded evidence and generated PDFs are lost even if database references remain

## AI Provider Deployment Notes

AI arbitration requires:

- valid `AI_API_KEY`
- valid `AI_API_URL`
- valid `AI_MODEL`

Behavior to expect:

- if these values are missing, arbitration requests fail with an AI configuration error
- if image evidence is enabled, the backend may attach a limited number of renter and landlord images to the arbitration request
- if the provider rejects the structured response request, `AI_USE_STRUCTURED_OUTPUT` may need adjustment

## Security Configuration Notes

For a safer deployment, set:

- a strong `JWT_SECRET`
- a correct `FRONTEND_URL` instead of using a wildcard CORS policy
- a protected AI API key
- a non-root MySQL account when possible

The current MVP does not include:

- HTTPS setup
- secret rotation
- centralized logging
- malware scanning on uploads
- production-grade file/object storage

## Recommended Classroom Deployment

For final presentation or grading, the simplest reliable arrangement is:

1. MySQL running locally on the same machine
2. backend running on `http://localhost:8080`
3. frontend running on `http://localhost:5173`
4. AI provider credentials preloaded in `backend/.env`

## Failure Recovery

### Backend fails to start

Check:

- MySQL is running
- `.env` exists
- database credentials are correct
- port `8080` is free

### Frontend fails to load data

Check:

- backend is running
- frontend is pointed to `http://localhost:8080/api`
- login token exists

### Generated PDFs are missing

Check:

- the official template PDFs still exist
- `backend/generated/forms/` is writable
- the selected filing path is supported

### Arbitration fails unexpectedly

Check:

- AI credentials
- outbound network availability
- provider model name
- structured output compatibility

## Deployment Limitations

This deployment approach is intentionally lightweight for an academic MVP. It should be treated as:

- suitable for local development
- suitable for demos
- suitable for grading
- not yet suitable for a real public legal-service production environment
