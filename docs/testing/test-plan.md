# Test Plan

## Purpose

This test plan defines how the CSCI370 Renter Dispute Assistant MVP should be validated before final submission, demo, or handoff.

## Test Objectives

The goal is to verify that the MVP can:

- authenticate renters and landlords
- create and retrieve cases safely
- route supported disputes to the correct filing path
- identify missing form information
- generate supported official PDFs
- store and retrieve renter and landlord evidence
- collect landlord responses
- generate, validate, and save AI arbitration results
- protect case access from unauthorized users

## Test Scope

### In scope

- backend API behavior
- database persistence
- file upload validation
- official form generation flow
- landlord response flow
- AI arbitration flow
- authorization and access control checks
- core frontend login, registration, dashboard, and case-creation interactions

### Out of scope

- production hosting hardening
- large-scale load testing
- accessibility certification
- real court/agency filing submission
- multi-state legal rule validation

## Test Environment

Recommended environment:

- Windows machine with PowerShell
- Node.js
- MySQL
- backend running on `http://localhost:8080`
- frontend running on `http://localhost:5173`
- valid AI credentials in `backend/.env`

## Test Data

Prepare the following data before testing:

- one renter account
- one landlord account
- one landlord email that matches a test case
- one supported image file for renter evidence
- one supported image file for landlord evidence
- one New York security deposit scenario
- one NYC repairs scenario
- one unsupported scenario for negative testing

## Test Strategy

### 1. Smoke testing

Confirm the system starts and basic health checks pass.

### 2. Functional testing

Verify the main renter, landlord, form, and arbitration workflows.

### 3. Negative testing

Verify invalid credentials, invalid case access, missing fields, unsupported dispute paths, and AI failures.

### 4. Regression testing

After any fixes, re-run the core flow from intake through arbitration to ensure earlier features still work.

## Test Deliverables

- pass/fail status for each test case below
- screenshots or terminal captures when useful
- generated PDFs where applicable
- notes on blockers and known defects

The repository also includes backend ticket test-result artifacts in:

- `backend/test_results/ticket_1_tests_done_and_results.pdf`
- `backend/test_results/ticket_2_tests_done_and_results.pdf`
- `backend/test_results/ticket_3_tests_done_and_results.pdf`

## Backend Test Cases

| ID | Test Case | Steps Summary | Expected Result | Related Requirements |
|---|---|---|---|---|
| TP-01 | Backend startup and health | Start backend and call `GET /api/health` | Response returns `status: ok` | AR1, AR3, AR15 |
| TP-02 | Renter registration | Register a renter with valid input | Account is created successfully | SR1, FR9, FR43 |
| TP-03 | Renter login | Login with valid renter credentials | JWT returned and protected access works | SR21, FR43 |
| TP-04 | Landlord registration and login | Register/login landlord whose email matches a case | Landlord can authenticate successfully | SR12, SR13, FR32, FR33 |
| TP-05 | Create dispute case | Submit valid renter case data | Case stored with `INTAKE_SUBMITTED` status | SR1, SR11, FR1, FR2, FR9-FR15, FR26 |
| TP-06 | Reject invalid case fields | Submit blank or invalid required fields | Validation errors returned | FR9-FR14, AR4 |
| TP-07 | Upload valid evidence | Upload supported image file | Evidence saved and listed on case | FR15-FR17, AR12 |
| TP-08 | Reject invalid evidence type | Upload unsupported file type | Upload is rejected with clear error | FR17, AR14 |
| TP-09 | Determine form requirements for supported case | Call `GET /form-requirements` for valid NY case | Correct filing path and missing fields returned | SR4-SR8, FR3-FR8, FR23, AR5-AR7 |
| TP-10 | Unsupported filing path handling | Use unsupported dispute/jurisdiction | System returns unsupported result instead of a PDF | SR5, FR5, FR6, AR14 |
| TP-11 | Save additional form answers | Call `PATCH /form-answers` with valid missing data | Answers are saved and validation passes | FR7, FR8, FR12-FR14, FR24 |
| TP-12 | Generate supported PDF | Call `POST /generate-form` after satisfying requirements | PDF is generated, stored, and downloadable | SR6-SR10, FR21-FR27, AR7, AR10, AR12 |
| TP-13 | Retrieve saved case details | Open case details after form generation | Case includes generated form metadata and current status | SR11, FR27, FR42 |
| TP-14 | Submit landlord response | Save valid landlord response for matching landlord | Response is stored and visible on the case | SR12-SR15, FR29-FR35 |
| TP-15 | Arbitration not ready without landlord response | Request arbitration before landlord response exists | System returns `ARBITRATION_NOT_READY` and missing field info | FR35, AR14 |
| TP-16 | Successful AI arbitration | Request arbitration after both sides submit info | Valid arbitration result is returned and saved | SR16-SR20, FR34-FR42, AR8-AR10, AR15 |
| TP-17 | Reject malformed AI output | Simulate invalid provider result if practical | System surfaces AI error instead of saving incomplete result | FR38, FR39, AR14 |
| TP-18 | Unauthorized case access | Try to access another user's case | Access is denied | SR21, FR28, FR43, FR44, AR13 |

## Frontend-Focused Checks

Will be Filled in by Ismail.

## Entry Criteria

Testing can begin when:

- MySQL is running
- backend dependencies are installed
- frontend dependencies are installed
- `backend/.env` is present
- template PDFs exist in the expected directory

## Exit Criteria

Testing is considered complete when:

- all critical-path tests pass
- no unresolved blocker remains on authentication, case creation, PDF generation, landlord response, or arbitration
- any remaining issues are documented in `docs/limitations.md`

## Risks To Testing

- invalid or missing AI credentials can block arbitration verification
- local environment differences may affect MySQL connectivity
- missing official template PDFs will block PDF generation tests

## Recommended Regression Set

After any change to the backend, rerun at least:

1. TP-01 backend health
2. TP-05 create case
3. TP-09 form requirements
4. TP-12 generate PDF
5. TP-14 landlord response
6. TP-16 successful arbitration
7. TP-18 unauthorized case access
