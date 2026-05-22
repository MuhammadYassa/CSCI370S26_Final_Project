# How-To Manual

## Purpose

This guide explains how to run the project and demonstrate the complete MVP workflow for a class presentation, grading session, or team handoff.

## Recommended Use

Use this document when you need to:

- start the system locally
- verify that the backend is healthy
- create demo accounts
- walk through renter intake, form generation, landlord response, and AI arbitration

## Prerequisites

Before starting, make sure the machine has:

- Node.js and `npm`
- MySQL
- a valid filled out backend `.env` file
- the official PDF templates already included in `backend/templates/legal-forms/ny/`

## Standard Startup Procedure

### 1. Install dependencies

```powershell
cd backend
npm.cmd install

cd ..\frontend
npm.cmd install
```

### 2. Configure environment variables

Create `backend/.env` from `backend/.env.example` and set:

- `PORT`
- `FRONTEND_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `AI_PROVIDER`
- `AI_API_KEY`
- `AI_API_URL`
- `AI_MODEL`
- `AI_TIMEOUT_MS`
- `AI_INCLUDE_IMAGE_EVIDENCE`
- `AI_MAX_IMAGES_PER_SIDE`
- `AI_USE_STRUCTURED_OUTPUT`

### 3. Initialize the database

```powershell
cd backend
mysql -u root -p --execute="source sql/schema.sql"
```

### 4. Start the backend

```powershell
cd backend
npm.cmd run dev
```

### 5. Verify backend health

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
```

Expected result:

```json
{ "status": "ok" }
```

### 6. Start the frontend

```powershell
cd frontend
npm.cmd run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Two Demo Paths

### Path A: UI-assisted demo

Use the frontend for:

- renter registration
- landlord registration
- renter login
- landlord login
- dashboard viewing
- initial case creation

This path is the easiest visual demo, but it does not fully exercise all later-stage workflows because several later frontend pages still contain placeholder/mock data.

### Path B: API-assisted full MVP demo

Use the backend API for the complete flow:

1. register renter
2. login renter
3. create case
4. upload renter evidence
5. save additional form answers
6. generate official PDF
7. register landlord
8. login landlord
9. submit landlord response
10. upload landlord evidence
11. request AI arbitration
12. retrieve saved arbitration result

This is the recommended grading/demo path because it exercises the complete implemented backend workflow.

## Quick Demo Workflow

### 1. Register a renter

Use the frontend register page or call:

```http
POST /api/auth/register
```

Sample role:

- `RENTER`

### 2. Login as the renter

Use the frontend login page or call:

```http
POST /api/auth/login
```

Save the returned JWT token for the protected requests below.

### 3. Create a case

Use the frontend "Create New Case" page or call:

```http
POST /api/cases
```

Minimum fields that should be present for a meaningful demo:

- renter full name and email
- landlord full name and email
- property address
- state
- dispute type
- dispute description

### 4. Upload renter evidence

Call:

```http
POST /api/cases/:caseId/evidence
```

Important backend rules:

- only `JPEG`, `PNG`, and `WEBP` are accepted
- max file size is `5 MB` per file
- upload field name is `evidenceImages`

### 5. Get form requirements

Call:

```http
GET /api/cases/:caseId/form-requirements
```

This tells you:

- which filing path was selected
- which form was matched
- which fields are still missing
- whether generation is currently allowed

### 6. Save missing form answers

Call:

```http
PATCH /api/cases/:caseId/form-answers
```

Use this step to satisfy all missing fields returned by the previous request.

### 7. Generate the official form PDF

Call:

```http
POST /api/cases/:caseId/generate-form
```

Required request body:

```json
{ "confirmGenerate": true }
```

If successful, the case status becomes `FORM_READY`.

### 8. Download the generated PDF

Call:

```http
GET /api/generated-forms/:generatedFormId/file
```

### 9. Register and login the landlord

The landlord account email must match the landlord email stored on the case. After login, the landlord can access that case through the protected routes.

### 10. Submit landlord response

Call:

```http
POST /api/cases/:caseId/landlord-response
```

Required concepts:

- landlord full name
- landlord email
- response statement

### 11. Upload landlord evidence

Call the same evidence endpoint:

```http
POST /api/cases/:caseId/evidence
```

The backend determines whether the uploader is the renter or landlord from the JWT.

### 12. Request AI arbitration

Call:

```http
POST /api/cases/:caseId/arbitration
```

Required request body:

```json
{ "confirmArbitration": true }
```

If successful, the case status becomes `ARBITRATION_COMPLETE`.

### 13. Retrieve the arbitration result

Call:

```http
GET /api/cases/:caseId/arbitration
```

The saved result includes:

- neutral summary
- renter claims
- landlord claims
- image evidence findings
- disputed facts
- missing evidence
- suggested resolution
- recommended next steps
- confidence level
- disclaimer

## Supported Demo Scenarios

The safest demo scenarios are:

- New York security deposit complaint for general non-return
- NYC small claims security deposit dispute for damage/unpaid-rent withholding under `$10,000`
- NYC repairs/habitability issue for the housing court packet

## Common Troubleshooting

### Frontend loads but protected pages fail

Check:

- backend is running
- token exists in browser local storage
- `JWT_SECRET` is set
- `FRONTEND_URL` matches the frontend origin

### Form generation says information is missing

Call `GET /api/cases/:caseId/form-requirements` again and fill each listed missing field with `PATCH /api/cases/:caseId/form-answers`.

### Arbitration returns `ARBITRATION_NOT_READY`

A landlord response has not been saved yet. Submit `POST /api/cases/:caseId/landlord-response` first.

### Arbitration returns an AI configuration error

Confirm the backend `.env` includes valid values for:

- `AI_API_KEY`
- `AI_API_URL`
- `AI_MODEL`

### Evidence upload fails

Check:

- the file is `JPEG`, `PNG`, or `WEBP`
- the file is not larger than `5 MB`
- the request field name is `evidenceImages`

## Best Practice For Class Demo

For the smoothest final demo:

1. start backend and frontend before class
2. verify `GET /api/health`
3. keep one renter account and one landlord account ready
4. keep at least one supported image evidence file available
5. prepare one case for form generation
6. prepare a second case for showing missing-field handling if needed

## Related Files

- `backend/README.md`
- `backend/sql/schema.sql`
- `backend/src/routes/caseRoutes.js`
- `backend/test_results/`
