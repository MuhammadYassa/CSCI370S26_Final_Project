# Final Submission README

## CSCI370 Renter Dispute Assistant

This repository contains the final submission for the **CSCI370 Renter Dispute Assistant** MVP. The project helps renters create dispute cases, route supported New York housing disputes to official forms, store renter and landlord submissions, and generate a neutral AI arbitration summary after both sides have responded.

## Submission Contents

- `README.md` - final submission overview
- `docs/how-to-manual.md` - quick operational guide for running and demonstrating the system
- `docs/deployment-guide.md` - environment setup and deployment instructions
- `docs/user-manual.md` - renter and landlord user guide
- `docs/limitations.md` - known functional, technical, and operational limitations
- `docs/test-plan.md` - planned verification scope, environments, and test cases
- `docs/traceability-matrix.md` - mapping from stakeholder, functional, and architecture requirements to implementation and tests
- `docs/team-contribution-honor-statement-template.md` - fill-in template for the team submission statement

## Project Summary

The MVP is split into two applications:

- `frontend/` - React + Vite client
- `backend/` - Node.js + Express API with MySQL persistence

Core backend capabilities implemented in the repository:

- user registration and login for `RENTER` and `LANDLORD`
- dispute case creation and retrieval
- protected evidence upload and download
- rule-based filing-path selection for supported New York dispute scenarios
- guided form-answer storage and official PDF generation
- landlord response storage
- AI arbitration request, validation, storage, and retrieval

Supported official filing paths in the current MVP:

- New York State Attorney General rent security complaint
- NYC small claims security deposit form `CIV-SC-50`
- NYC Housing Court repairs petition `UCS-LT12B`

## Important Notes

The backend supports the complete MVP flow described in the requirements. The frontend currently includes working authentication, dashboard, and case creation integration, but several later-stage pages still use placeholder or mock data in the UI. For that reason:

- the most reliable end-to-end demonstration path is the backend API flow described in [docs/how-to-manual.md](docs/how-to-manual.md)
- the frontend is still useful for account creation, login, dashboard navigation, and initial case submission

Also note:

- evidence uploads are restricted by the backend to `JPEG`, `PNG`, and `WEBP` images up to `5 MB`
- AI arbitration is informational only and is **not** legal advice or a binding legal decision
- the MVP prepares filing documents but does **not** electronically submit them to courts or agencies

## Repository Structure

```text
.
|-- backend/
|   |-- src/
|   |-- sql/
|   |-- templates/legal-forms/ny/
|   |-- uploads/evidence/
|   `-- generated/forms/
|-- frontend/
|   `-- src/
|-- diagrams/
`-- docs/
```

## Quick Start

### 1. Install dependencies

```powershell
cd backend
npm.cmd install

cd ..\frontend
npm.cmd install
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and set real values for:

- MySQL connection settings
- `JWT_SECRET`
- AI provider settings for arbitration

### 3. Create the database

```powershell
cd backend
mysql -u root -p --execute="source sql/schema.sql"
```

### 4. Start the applications

Backend:

```powershell
cd backend
npm.cmd run dev
```

Frontend:

```powershell
cd frontend
npm.cmd run dev
```

### 5. Verify the backend is up

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
```

Expected response:

```json
{ "status": "ok" }
```

## Recommended Reading Order

If you are grading, demoing, or onboarding to the project, this order works well:

1. [docs/how-to-manual.md](docs/how-to-manual.md)
2. [docs/deployment-guide.md](docs/deployment-guide.md)
3. [docs/user-manual.md](docs/user-manual.md)
4. [docs/limitations.md](docs/limitations.md)
5. [docs/test-plan.md](docs/test-plan.md)
6. [docs/traceability-matrix.md](docs/traceability-matrix.md)

## Reference Artifacts Included In The Repo

- `docs/stakeholder-requirements.docx`
- `docs/functional-requirements.docx`
- `docs/architecture-requirements.docx`
- `diagrams/architecture-diagram-v4.png`
- `backend/test_results/` ticket evidence PDFs

## Final Reminder

This project is best understood as an MVP that demonstrates the complete intended workflow at the backend/API level.
