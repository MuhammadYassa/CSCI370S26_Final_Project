# Renter Dispute Assistant

## Project Overview

Renter Dispute Assistant is a web application that helps renters organize dispute information, create cases, upload evidence images, determine the correct supported filing path, and generate filled official PDF forms for review and download. The system also allows landlords to submit responses and upload evidence. After both sides provide information, the backend can run Gemini AI arbitration to produce a neutral outcome for the dispute.

Important limitations:

- The system prepares forms for review and download but does **not** electronically file documents with courts or agencies.
- The AI arbitration output is **not** legal advice and is **not** a binding legal decision.

## Project Folder Structure

Only folders and major files that are present in this repository are listed below.

| Path | Purpose |
| --- | --- |
| `/backend` | Node.js/Express backend API, MySQL integration, PDF generation, uploads, and AI arbitration logic. |
| `/frontend` | Web frontend built with React and Vite. |
| `/docs` | Project documentation, requirements files, schema copy, and testing artifacts. |
| `/diagrams` | Architecture and sequence diagram images for the project. |
| `README.md` | Main submission overview and repository guide. |
| `.gitignore` | Git ignore rules for local/runtime files. |

## Backend Folder Explanation

The backend contains the main server-side implementation for authentication, case management, evidence handling, PDF generation, landlord response workflows, and AI arbitration.

| Path | Purpose |
| --- | --- |
| `backend/src/` | Main backend source code. |
| `backend/src/app.js` | Express app configuration, middleware setup, CORS configuration, health route, and route registration. |
| `backend/src/server.js` | Loads environment variables, verifies the database connection, creates the uploads directory, and starts the backend server. |
| `backend/src/routes/` | Express route files. The repository currently contains `authRoutes.js` and `caseRoutes.js`. |
| `backend/src/controllers/` | Request/response controller logic for auth, cases, evidence, form generation, landlord responses, and arbitration. |
| `backend/src/services/` | Business logic for authentication, cases, evidence, filing-path selection, form requirements, form answers, PDF generation, landlord responses, generated forms, arbitration prompts/results, and AI client integration. |
| `backend/src/middleware/` | JWT auth middleware, case access middleware, upload middleware, and global error handling middleware. |
| `backend/src/config/` | Configuration files for MySQL, AI settings, legal form catalog data, and PDF field mappings. |
| `backend/src/utils/` | Shared helpers such as async wrapper utilities, validation helpers, form data helpers, and custom errors. |
| `backend/sql/` | Backend SQL setup files. In this repository, it contains `schema.sql`. |
| `backend/templates/` | Blank official PDF templates used for form generation. |
| `backend/templates/legal-forms/ny/` | Included New York official form templates used by the MVP. |
| `backend/uploads/` | Local runtime storage area for uploaded files. |
| `backend/uploads/evidence/` | Uploaded evidence image storage. Real user evidence should not be committed. |
| `backend/generated/` | Local runtime output directory for generated files. |
| `backend/generated/forms/` | Generated PDF form output storage. Runtime-generated documents normally should not be committed unless intentionally included as samples. |
| `backend/test_results/` | Backend testing result PDFs for tickets 1, 2, and 3. |
| `backend/package.json` | Backend dependencies and npm scripts. |
| `backend/package-lock.json` | Locked backend dependency tree for reproducible installs. |
| `backend/README.md` | Backend-specific README file. |

### Backend Routes Present

- `backend/src/routes/authRoutes.js`: authentication endpoints such as register and login.
- `backend/src/routes/caseRoutes.js`: case creation, case lookup, evidence upload/listing, form workflow endpoints, landlord response endpoints, arbitration endpoints, and generated file download endpoints.

## Frontend Folder Explanation

The frontend is a React/Vite web client for user login, registration, dashboard views, case creation, form workflow screens, landlord response screens, and arbitration-related pages.

| Path | Purpose |
| --- | --- |
| `frontend/src/` | Main frontend application source code. |
| `frontend/src/components/` | Shared UI components such as protected routes, evidence sections, layout shell, and form field components. |
| `frontend/src/pages/` | Page-level views for authentication, dashboard, cases, landlord response, and arbitration screens. |
| `frontend/src/context/` | React context for authentication state. |
| `frontend/src/lib/` | Frontend helper modules, including API access and formatting utilities. |
| `frontend/src/lib/api.js` | Frontend API wrapper used to call backend endpoints and download protected files. |
| `frontend/package.json` | Frontend dependencies and npm scripts. |
| `frontend/package-lock.json` | Locked frontend dependency tree for reproducible installs. |
| `frontend/vite.config.js` | Vite build/dev configuration. |
| `frontend/index.html` | Vite HTML entry point. |

The frontend API helper currently uses `VITE_API_BASE_URL`.

## SQL Folder Explanation

SQL files present in this repository:

| Path | Purpose |
| --- | --- |
| `backend/sql/schema.sql` | Main backend database schema used for local setup. |
| `docs/schema/schema.sql` | Documentation copy of the schema file. |

## Docs Folder Explanation

The `docs/` folder contains project documentation and supporting course artifacts.

| Path | Purpose |
| --- | --- |
| `docs/requirements/` | Requirements documents in Word format. |
| `docs/requirements/stakeholder-requirements.docx` | Stakeholder requirements document. |
| `docs/requirements/functional-requirements.docx` | Functional requirements document. |
| `docs/requirements/architecture-requirements.docx` | Architecture requirements document. |
| `docs/testing/` | Testing plans, traceability, and backend test result PDFs. |
| `docs/testing/test-plan.md` | Test plan document. |
| `docs/testing/traceability-matrix.md` | Requirements-to-test traceability matrix. |
| `docs/testing/backend test results/` | Ticket-based backend testing result PDFs. |
| `docs/other docs/` | Additional project and submission documentation. |
| `docs/other docs/how-to-manual.md` | How-to guide for running and demonstrating the project. |
| `docs/other docs/deployment-guide.md` | Deployment/setup guide. |
| `docs/other docs/user-manual.md` | End-user manual. |
| `docs/other docs/limitations.md` | Known limitations and constraints. |
| `docs/other docs/sprint-summary.md` | Sprint summary documentation. |

## Environment Variables

This project requires local `.env` configuration for backend runtime values, but real `.env` files should not be committed to source control.

Important backend environment variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend server port. |
| `FRONTEND_URL` | Allowed frontend origin for CORS. |
| `DB_HOST` | MySQL host name. |
| `DB_PORT` | MySQL port number. |
| `DB_NAME` | MySQL database name. |
| `DB_USER` | MySQL user name. |
| `DB_PASSWORD` | MySQL password. |
| `JWT_SECRET` | Secret used to sign JWT tokens. |
| `JWT_EXPIRES_IN` | JWT expiration duration. |
| `AI_PROVIDER` | AI provider identifier. |
| `AI_API_KEY` | API key for the configured AI provider. |
| `AI_API_URL` | Base URL for the AI API. |
| `AI_MODEL` | Model name used for arbitration requests. |
| `AI_TIMEOUT_MS` | Timeout for AI requests in milliseconds. |
| `AI_INCLUDE_IMAGE_EVIDENCE` | Whether image evidence is sent to the AI request. |
| `AI_MAX_IMAGES_PER_SIDE` | Maximum images per side included in arbitration input. |
| `AI_USE_STRUCTURED_OUTPUT` | Whether structured AI output is requested. |

## Setup Summary

Backend:

```powershell
cd backend
npm install
npm run dev
```

Database:

```powershell
mysql -u root -p --execute="source sql/schema.sql"
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Submission Notes

Items that should **not** be included or committed:

- `.env`
- `node_modules/`
- real uploaded evidence files
- private runtime-generated PDFs
- API keys
- database passwords
- JWT secrets

Items that **should** be included:

- source code
- `package.json`
- `package-lock.json`
- `.env.example`
- SQL files
- blank official PDF templates
- documentation
- sample test files, if provided
- validation/test result files intentionally included for submission