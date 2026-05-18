# Renter Dispute Assistant Backend

This backend now implements:

- Ticket 1: authentication, dispute case intake, case retrieval, and protected evidence upload/retrieval
- Ticket 2: deterministic filing-path detection, missing-field collection, saved guided form answers, official PDF generation, generated form metadata, and protected generated PDF download
- Ticket 3: landlord response storage, shared renter/landlord evidence support, real external AI arbitration, arbitration result storage, and protected arbitration retrieval

## Implemented Routes

Public routes:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Protected Ticket 1 routes:

- `GET /api/me`
- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/:caseId`
- `POST /api/cases/:caseId/evidence`
- `GET /api/cases/:caseId/evidence`
- `GET /api/evidence/:evidenceId/file`

Protected Ticket 2 routes:

- `GET /api/cases/:caseId/form-requirements`
- `PATCH /api/cases/:caseId/form-answers`
- `POST /api/cases/:caseId/generate-form`
- `GET /api/cases/:caseId/generated-form`
- `GET /api/generated-forms/:generatedFormId/file`

Protected Ticket 3 routes:

- `POST /api/cases/:caseId/landlord-response`
- `GET /api/cases/:caseId/landlord-response`
- `POST /api/cases/:caseId/arbitration`
- `GET /api/cases/:caseId/arbitration`

## Technology Stack

- Node.js
- Express.js
- MySQL
- JWT authentication
- bcrypt
- multer
- mysql2/promise
- pdf-lib
- local backend file storage for evidence images and generated PDFs

## Required Template Paths

These official templates must exist:

```text
backend/templates/legal-forms/ny/oag-rent-security-complaint.pdf
backend/templates/legal-forms/ny/nyc-small-claims-civ-sc-50.pdf
backend/templates/legal-forms/ny/ucs-lt12b-repairs-petition.pdf
```

Generated PDFs are saved to:

```text
backend/generated/forms/
```

## Project Setup

From the `backend` folder:

```powershell
Copy-Item .env.example .env
npm.cmd install
```

Set real values in `.env`:

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
AI_API_KEY=replace_with_real_gemini_api_key
AI_API_URL=https://generativelanguage.googleapis.com/v1beta
AI_MODEL=replace_with_gemini_model_name
AI_TIMEOUT_MS=30000
AI_INCLUDE_IMAGE_EVIDENCE=true
AI_MAX_IMAGES_PER_SIDE=3
AI_USE_STRUCTURED_OUTPUT=true
```

AI notes:

- `AI_API_KEY`, `AI_API_URL`, and `AI_MODEL` are required for Ticket 3 arbitration.
- If those values are missing, arbitration returns `AI_API_ERROR`.
- `AI_PROVIDER=GEMINI` enables Gemini native `generateContent` requests.
- `AI_INCLUDE_IMAGE_EVIDENCE=true` sends actual uploaded renter and landlord images to Gemini as inline image parts when they can be read safely from local storage.
- `AI_MAX_IMAGES_PER_SIDE=3` limits inline image uploads to Gemini while still keeping full evidence metadata in the prompt context.
- `AI_USE_STRUCTURED_OUTPUT=true` requests JSON output mode when the configured provider supports it. Set it to `false` if your provider rejects structured-output settings.

## Database Setup

Full schema file:

```text
backend/sql/schema.sql
```

Migration files:

```text
backend/sql/ticket2-migration.sql
backend/sql/ticket3-migration.sql
```

Run the full schema for a fresh setup:

```powershell
mysql -u root -p --execute="source sql/schema.sql"
```

Run only the Ticket 2 migration on top of an existing Ticket 1 database:

```powershell
mysql -u root -p --execute="source sql/ticket2-migration.sql"
```

Run only the Ticket 3 migration on top of an existing Ticket 1 + Ticket 2 database:

```powershell
mysql -u root -p --execute="source sql/ticket3-migration.sql"
```

If MySQL is not in PATH, use the full path to `mysql.exe`.

## Run the Backend

From the `backend` folder:

```powershell
npm.cmd run dev
```

Health check:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
```

## Manual Testing with PowerShell

Open a second PowerShell window while the backend is running.

### 1. Set API base URL

```powershell
$API = "http://localhost:8080/api"
```

### 2. Register and login a renter

```powershell
$renterRegisterBody = @{
  fullName = "John Smith"
  email = "john@example.com"
  password = "password123"
  role = "RENTER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API/auth/register" -Method POST -ContentType "application/json" -Body $renterRegisterBody

$renterLoginBody = @{
  email = "john@example.com"
  password = "password123"
} | ConvertTo-Json

$renterLoginResponse = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -ContentType "application/json" -Body $renterLoginBody
$renterToken = $renterLoginResponse.token

$renterHeaders = @{
  Authorization = "Bearer $renterToken"
}
```

### 3. Confirm the logged-in renter

```powershell
Invoke-RestMethod -Uri "$API/me" -Method GET -Headers $renterHeaders
```

### 4. Create a case

```powershell
$caseBody = @{
  renterFullName = "John Smith"
  renterEmail = "john@example.com"
  renterPhone = "555-123-4567"
  landlordFullName = "ABC Management"
  landlordEmail = "landlord@example.com"
  landlordPhone = "555-987-6543"
  propertyAddress = "123 Main Street, Queens, NY 11367"
  city = "Queens"
  state = "NY"
  zipCode = "11367"
  disputeType = "SECURITY_DEPOSIT"
  securityDepositAmount = 1500
  amountRequested = 1200
  leaseStartDate = "2024-09-01"
  leaseEndDate = "2025-09-01"
  moveOutDate = "2025-09-01"
  disputeDescription = "The landlord withheld my security deposit because of disputed apartment damage."
  evidenceDescription = "Photos, text messages, lease agreement, and move-out notes."
} | ConvertTo-Json

$createdCase = Invoke-RestMethod -Uri "$API/cases" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $caseBody
$caseId = $createdCase.caseId
$caseId
```

### 5. Save additional Ticket 2 form answers

```powershell
$answersBody = @{
  answers = @{
    securityDepositIssueType = "WITHHELD_FOR_DAMAGE"
    claimantAddress = "55 Tenant Avenue"
    claimantCity = "Queens"
    claimantState = "NY"
    claimantZipCode = "11367"
    defendantAddress = "123 Landlord Office Address"
    defendantCity = "Queens"
    defendantState = "NY"
    defendantZipCode = "11367"
    borough = "QUEENS"
    dateOfOccurrence = "2025-09-01"
    reasonForClaim = "Return of security deposit withheld for disputed apartment damage."
    attemptedResolution = $true
    dateComplainedToLandlord = "2025-09-10"
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$API/cases/$caseId/form-answers" -Method PATCH -Headers $renterHeaders -ContentType "application/json" -Body $answersBody
Invoke-RestMethod -Uri "$API/cases/$caseId/form-requirements" -Method GET -Headers $renterHeaders
```

### 6. Generate the Ticket 2 official form PDF

```powershell
$generateFormBody = @{
  confirmGenerate = $true
} | ConvertTo-Json

$generatedFormResponse = Invoke-RestMethod -Uri "$API/cases/$caseId/generate-form" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $generateFormBody
$generatedFormId = $generatedFormResponse.generatedForm.id
$generatedFormId
```

### 7. Confirm the generated form on the case

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId" -Method GET -Headers $renterHeaders
Invoke-RestMethod -Uri "$API/cases/$caseId/generated-form" -Method GET -Headers $renterHeaders
```

### 8. Upload renter evidence

Set a real image path first:

```powershell
$imagePath = "C:\path\to\renter-photo.jpg"
```

Upload:

```powershell
Add-Type -AssemblyName System.Net.Http

$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $renterToken)

$content = New-Object System.Net.Http.MultipartFormDataContent
$fileStream = [System.IO.File]::OpenRead($imagePath)
$fileName = [System.IO.Path]::GetFileName($imagePath)
$fileContent = New-Object System.Net.Http.StreamContent($fileStream)

$extension = [System.IO.Path]::GetExtension($imagePath).ToLower()
if ($extension -eq ".jpg" -or $extension -eq ".jpeg") {
  $mimeType = "image/jpeg"
} elseif ($extension -eq ".png") {
  $mimeType = "image/png"
} elseif ($extension -eq ".webp") {
  $mimeType = "image/webp"
} else {
  throw "Unsupported image type. Use jpg, jpeg, png, or webp."
}

$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse($mimeType)
$content.Add($fileContent, "evidenceImages", $fileName)

$response = $client.PostAsync("$API/cases/$caseId/evidence", $content).Result
$responseText = $response.Content.ReadAsStringAsync().Result
$uploadResponse = $responseText | ConvertFrom-Json
$renterEvidenceId = $uploadResponse.evidence[0].evidenceId

$fileStream.Dispose()
$content.Dispose()
$client.Dispose()

$renterEvidenceId
```

### 9. Register and login the matching landlord

```powershell
$landlordRegisterBody = @{
  fullName = "ABC Management"
  email = "landlord@example.com"
  password = "password123"
  role = "LANDLORD"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API/auth/register" -Method POST -ContentType "application/json" -Body $landlordRegisterBody

$landlordLoginBody = @{
  email = "landlord@example.com"
  password = "password123"
} | ConvertTo-Json

$landlordLoginResponse = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -ContentType "application/json" -Body $landlordLoginBody
$landlordToken = $landlordLoginResponse.token

$landlordHeaders = @{
  Authorization = "Bearer $landlordToken"
}
```

### 10. Submit landlord response

```powershell
$landlordResponseBody = @{
  landlordFullName = "ABC Management"
  landlordEmail = "landlord@example.com"
  responseStatement = "The deposit was withheld because the tenant damaged the walls and additional cleaning was required."
  amountLandlordClaims = 700
  evidenceDescription = "Move-out inspection notes and repair invoice."
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API/cases/$caseId/landlord-response" -Method POST -Headers $landlordHeaders -ContentType "application/json" -Body $landlordResponseBody
Invoke-RestMethod -Uri "$API/cases/$caseId/landlord-response" -Method GET -Headers $landlordHeaders
Invoke-RestMethod -Uri "$API/cases/$caseId" -Method GET -Headers $renterHeaders
```

### 11. Upload landlord evidence using the same protected evidence route

Set a real landlord image path first:

```powershell
$landlordImagePath = "C:\path\to\repair-invoice.jpg"
```

Upload:

```powershell
Add-Type -AssemblyName System.Net.Http

$landlordClient = New-Object System.Net.Http.HttpClient
$landlordClient.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $landlordToken)

$landlordContent = New-Object System.Net.Http.MultipartFormDataContent
$landlordStream = [System.IO.File]::OpenRead($landlordImagePath)
$landlordFileName = [System.IO.Path]::GetFileName($landlordImagePath)
$landlordFileContent = New-Object System.Net.Http.StreamContent($landlordStream)

$landlordExtension = [System.IO.Path]::GetExtension($landlordImagePath).ToLower()
if ($landlordExtension -eq ".jpg" -or $landlordExtension -eq ".jpeg") {
  $landlordMimeType = "image/jpeg"
} elseif ($landlordExtension -eq ".png") {
  $landlordMimeType = "image/png"
} elseif ($landlordExtension -eq ".webp") {
  $landlordMimeType = "image/webp"
} else {
  throw "Unsupported image type. Use jpg, jpeg, png, or webp."
}

$landlordFileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse($landlordMimeType)
$landlordContent.Add($landlordFileContent, "evidenceImages", $landlordFileName)

$landlordUploadResponse = $landlordClient.PostAsync("$API/cases/$caseId/evidence", $landlordContent).Result
$landlordUploadText = $landlordUploadResponse.Content.ReadAsStringAsync().Result
$landlordUploadJson = $landlordUploadText | ConvertFrom-Json
$landlordEvidenceId = $landlordUploadJson.evidence[0].evidenceId

$landlordStream.Dispose()
$landlordContent.Dispose()
$landlordClient.Dispose()

$landlordEvidenceId
```

Confirm evidence metadata includes uploader information:

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId/evidence" -Method GET -Headers $renterHeaders
```

Expected result:

- renter and landlord evidence entries both appear
- each entry includes `uploadedByRole`

### 12. Test arbitration without AI env config

```powershell
$arbitrationBody = @{
  confirmArbitration = $true
} | ConvertTo-Json

try {
  Invoke-RestMethod -Uri "$API/cases/$caseId/arbitration" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $arbitrationBody
} catch {
  $_.ErrorDetails.Message
}
```

Expected result: `AI_API_ERROR`

### 13. Add AI config to `.env` and restart the backend

Required keys:

```env
AI_PROVIDER=GEMINI
AI_API_KEY=replace_with_real_gemini_api_key
AI_API_URL=https://generativelanguage.googleapis.com/v1beta
AI_MODEL=replace_with_gemini_model_name
AI_INCLUDE_IMAGE_EVIDENCE=true
AI_MAX_IMAGES_PER_SIDE=3
AI_USE_STRUCTURED_OUTPUT=true
```

Then restart:

```powershell
npm.cmd run dev
```

### 14. Request arbitration

```powershell
$arbitrationBody = @{
  confirmArbitration = $true
} | ConvertTo-Json

$arbitrationResponse = Invoke-RestMethod -Uri "$API/cases/$caseId/arbitration" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $arbitrationBody
$arbitrationResponse
```

Expected result:

- `status = ARBITRATION_COMPLETE`
- `arbitrationResult.imageEvidenceFindings` is present

### 15. Retrieve the saved arbitration result

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId/arbitration" -Method GET -Headers $renterHeaders
Invoke-RestMethod -Uri "$API/cases/$caseId" -Method GET -Headers $renterHeaders
```

Expected result:

- both responses include `arbitrationResult.imageEvidenceFindings`

### 16. Download protected evidence or PDF files

```powershell
Invoke-WebRequest -Uri "$API/evidence/$renterEvidenceId/file" -Headers $renterHeaders -OutFile ".\renter-evidence.jpg"
Invoke-WebRequest -Uri "$API/evidence/$landlordEvidenceId/file" -Headers $landlordHeaders -OutFile ".\landlord-evidence.jpg"
Invoke-WebRequest -Uri "$API/generated-forms/$generatedFormId/file" -Headers $renterHeaders -OutFile ".\generated-form.pdf"
```

### 17. Test missing landlord response behavior

Create a fresh case without a landlord response:

```powershell
$missingLandlordCaseBody = @{
  renterFullName = "John Smith"
  renterEmail = "john@example.com"
  landlordFullName = "No Response Management"
  landlordEmail = "noresponse@example.com"
  propertyAddress = "77 Example Street, Queens, NY 11367"
  city = "Queens"
  state = "NY"
  disputeType = "SECURITY_DEPOSIT"
  disputeDescription = "The landlord has not returned my security deposit."
} | ConvertTo-Json

$missingLandlordCase = Invoke-RestMethod -Uri "$API/cases" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $missingLandlordCaseBody
$missingLandlordCaseId = $missingLandlordCase.caseId
```

Then call:

```powershell
Invoke-RestMethod -Uri "$API/cases/$missingLandlordCaseId/arbitration" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $arbitrationBody
```

Expected result:

- `status = ARBITRATION_NOT_READY`
- `missingFields = ["landlordResponse"]`

### 18. Test forbidden unrelated user

```powershell
$otherRegisterBody = @{
  fullName = "Other User"
  email = "other@example.com"
  password = "password123"
  role = "LANDLORD"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API/auth/register" -Method POST -ContentType "application/json" -Body $otherRegisterBody

$otherLoginBody = @{
  email = "other@example.com"
  password = "password123"
} | ConvertTo-Json

$otherLoginResponse = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -ContentType "application/json" -Body $otherLoginBody
$otherHeaders = @{
  Authorization = "Bearer $($otherLoginResponse.token)"
}

try {
  Invoke-RestMethod -Uri "$API/cases/$caseId/landlord-response" -Method GET -Headers $otherHeaders
} catch {
  $_.ErrorDetails.Message
}
```

### 19. Test unauthorized request

```powershell
try {
  Invoke-RestMethod -Uri "$API/cases/$caseId/arbitration" -Method GET
} catch {
  $_.ErrorDetails.Message
}
```

### 20. Test invalid AI response handling if practical

If your AI provider allows testing against a model or endpoint that returns invalid non-JSON output, temporarily point `.env` at that endpoint and call the arbitration route again. The backend should return `AI_API_ERROR` and should not mark the case as `ARBITRATION_COMPLETE`.

## Notes

- Evidence uploads remain protected and are not exposed through `express.static`.
- The same evidence upload route supports both renter and landlord uploads. The backend determines `uploadedByRole` from the JWT-authenticated user.
- Arbitration includes renter and landlord evidence separately.
- When `AI_PROVIDER=GEMINI` and `AI_INCLUDE_IMAGE_EVIDENCE=true`, the backend reads uploaded images from local storage, converts them to base64, and sends them to Gemini as inline image parts.
- Ticket 2 still uses deterministic routing only. It does not use AI to choose or fill forms.
- The MVP prepares official filing packets for review/download/use. It does not electronically file with a court or agency.
- AI arbitration is an informational workflow only. It is not legal advice and not a binding legal decision.
