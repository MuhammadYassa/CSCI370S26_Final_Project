# Limitations Document

## Overview

This document records the major known limitations of the current CSCI370 Renter Dispute Assistant MVP. These are not hidden defects; they are important scope, implementation, and deployment boundaries for the project as it exists in the repository.

## Functional Limitations

### Limited dispute and jurisdiction support

The MVP only supports a narrow set of filing paths:

- New York Attorney General security deposit complaint
- NYC small claims security deposit path
- NYC housing repairs petition

Disputes outside those supported rules return an unsupported-form result instead of a valid official filing document.

### No electronic filing

The system generates and stores PDFs, but it does not:

- submit forms to a court
- submit forms to a government agency
- track court acceptance
- schedule hearings

## Evidence Handling Limitations

### Image-only upload support

The backend evidence upload middleware only allows:

- `JPEG`
- `PNG`
- `WEBP`

It does not accept:

- PDF evidence files
- Word documents
- spreadsheets
- audio
- video

### Small file-size threshold

The current evidence upload limit is `5 MB` per file. Larger files are rejected.

### Local filesystem storage only

Evidence is stored on local disk under `backend/uploads/evidence/`. This means:

- files are tied to the deployment machine
- there is no cloud/object storage
- there is no built-in redundancy

## Security And Access Limitations

### MVP-level authorization model

Case access is currently based on:

- renter ownership through authenticated user ID
- landlord access through authenticated email matching the case landlord email

This is acceptable for an MVP, but it is not a robust invitation-token or enterprise access-control design.

### No HTTPS or production hardening in the repo

The repository does not include:

- HTTPS termination
- rate limiting
- account lockout
- CSRF protections for a cookie-based auth design
- audit logging
- malware scanning on uploads

### Local token storage

The frontend stores auth information in browser local storage. This is common in small demos, but not ideal for a security-sensitive production legal application.

## AI Limitations

### AI output is non-binding

Arbitration output is advisory only. It is not:

- legal advice
- a judicial order
- a government decision

### External provider dependency

Arbitration depends on an external AI provider being available and correctly configured. Failures can occur due to:

- missing API key
- invalid model name
- network problems
- malformed provider output

### Limited image evidence attachment

Image evidence can be attached to arbitration requests, but the number of attached images is capped by configuration through `AI_MAX_IMAGES_PER_SIDE`.

### Structured-output fragility

The backend validates required sections from the AI response. If the provider returns malformed or incomplete structured data, the request fails rather than silently accepting a bad result.

## Data And Persistence Limitations

### No document versioning workflow

Generated forms are stored, but the system does not provide a rich version history UI or rollback workflow for multiple regenerated document states.

### No backup or recovery workflow in the app

The repository does not implement:

- automated backups
- restore automation
- storage migration tooling

### No seeded demo data

The repository does not come with ready-made database seed scripts for demo accounts and cases, so setup requires manual creation or API calls.

## Testing Limitations

### Limited automated testing in the repository

The repository contains test-result artifacts in `backend/test_results/`, but it does not currently include a full automated test suite for:

- unit tests
- integration tests
- frontend component tests
- end-to-end browser tests

### Manual API testing is still central

Because of the frontend integration gaps, manual API-based verification is still the most reliable way to test the complete workflow.

## Legal And Product Limitations

### New York-focused MVP

The supported filing logic is tailored to a limited New York scope and is not a general national renter-dispute platform.

### Not a substitute for legal counsel

The system is helpful for organizing facts and generating documents, but it should not be treated as a replacement for:

- an attorney
- a housing advocate
- official filing instructions from a court or agency

## Summary

The current MVP succeeds as a backend-complete academic demonstration of renter intake, form routing, document generation, landlord response, and AI arbitration. Its biggest current limitations are:

- narrow legal scope
- partial frontend integration
- image-only evidence support
- local-only storage
- MVP-level security and deployment assumptions
