# User Manual

## Purpose

This manual explains how renters and landlords use the CSCI370 Renter Dispute Assistant MVP.

## Intended Users

- renters who want help organizing a dispute case and preparing supported official forms
- landlords who need to respond to a renter's claim
- instructors or reviewers who want to walk through the end-user workflow

## What The System Does

The MVP helps users:

- create and save rental dispute cases
- upload evidence
- route certain New York disputes to supported official forms
- generate a completed PDF for supported filing paths
- collect a landlord response
- generate an AI arbitration summary after both sides submit information

## Important Disclaimer

The arbitration output is:

- not legal advice
- not a court ruling
- not a binding government decision

Users should review all generated materials carefully before relying on them.

## Account Roles

There are two supported account roles:

- `RENTER`
- `LANDLORD`

A renter can create and manage their own cases. A landlord can access cases that match the landlord email recorded on the case.

## Renter Workflow

### 1. Register

From the registration screen:

1. enter full name
2. enter email
3. enter password
4. choose role `RENTER`
5. submit the form

### 2. Login

From the login screen:

1. enter renter email
2. enter password
3. click `Login`

Successful login redirects the renter to the dashboard.

### 3. Open the dashboard

The dashboard is the renter's home screen. It shows:

- existing cases
- case status
- property address
- amount requested
- link to open a case

If there are no cases yet, the dashboard prompts the renter to create one.

### 4. Create a new case

Use `Create New Case` and complete the intake form.

The renter should provide:

- renter identity and contact information
- landlord identity and contact information
- property address
- state and city information
- dispute type
- amount-related information when applicable
- date fields when applicable
- dispute description
- evidence description

### 5. Choose a dispute type

The backend currently supports these dispute types:

- `SECURITY_DEPOSIT`
- `MAINTENANCE`
- `OTHER`

### 6. Upload evidence

The renter may upload supporting images for the case.

Current backend rules:

- accepted file types: `JPEG`, `PNG`, `WEBP`
- max file size: `5 MB`

### 7. Review case details

From the dashboard, open a case to view:

- renter information
- landlord information
- property information
- dispute information
- dispute description
- evidence description

### 8. Continue the form workflow

For supported disputes, the backend can determine:

- the selected filing path
- the official form type
- required missing answers before generation

If required information is missing, the form workflow must be completed before an official PDF can be generated.

### 9. Generate the official form

When all required information is present, the renter can request PDF generation.

The result is:

- a stored generated-form record
- a downloadable PDF
- filing instructions for the selected path

### 10. Wait for landlord response

The landlord can submit a response after creating and logging into a landlord account that matches the email stored on the case.

### 11. Request arbitration

Once both sides are represented, the renter can request AI arbitration.

The returned result may include:

- neutral summary
- main claims from each side
- image evidence findings
- disputed facts
- missing evidence
- suggested resolution
- recommended next steps
- confidence level
- disclaimer

## Landlord Workflow

### 1. Register

The landlord creates an account using role `LANDLORD`.

Important:

- the landlord email should match the email already stored on the case

### 2. Login

After login, the landlord can access cases associated with that email address.

### 3. Open the case

The landlord can view case information for authorized cases.

### 4. Submit a response

The landlord response should include:

- landlord full name
- landlord email
- response statement
- optional amount claimed
- optional evidence description

### 5. Upload landlord evidence

The landlord can upload supporting images through the same protected evidence route used by renters. The system stores whether the uploader was the renter or landlord.

## Case Statuses Users May See

Common statuses in the backend workflow include:

- `INTAKE_SUBMITTED`
- `MISSING_FORM_INFORMATION`
- `FORM_READY`
- `UNSUPPORTED_FORM_TYPE`
- `ARBITRATION_COMPLETE`

These statuses help communicate where the case currently is in the workflow.

## Error Situations

### Invalid login

If credentials are incorrect, login fails and the user must retry.

### Access denied

If a user tries to open a case they do not own or are not authorized to view, the backend blocks access.

### Unsupported dispute path

If the case details do not match one of the MVP's supported filing paths, the system reports that no supported official form is available.

### Missing form information

If the case does not contain all required answers for the selected filing path, form generation is blocked until the missing fields are provided.

### Arbitration not ready

If the renter requests arbitration before a landlord response exists, the system returns a not-ready status and explains that the landlord response is missing.

## Best Practices For Users

- enter complete and accurate names, emails, and addresses
- double-check dates and dollar amounts
- upload clear image evidence
- review generated forms before printing or submitting
- treat AI output as informational support, not legal advice

## Current MVP Caveat

The backend supports the complete flow, but several later frontend pages still use placeholder/mock content. In practice, the most complete workflow is currently available through the backend API even though the frontend provides the main visual interface for authentication, dashboard access, and initial case creation.
