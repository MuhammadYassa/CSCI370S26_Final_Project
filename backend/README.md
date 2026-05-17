# Renter Dispute Assistant Backend

This backend now implements:

- Ticket 1: authentication, dispute case intake, case retrieval, and protected evidence upload/retrieval
- Ticket 2: deterministic filing-path detection, missing-field collection, saved guided form answers, official PDF generation, generated PDF storage, generated form metadata, and protected generated PDF download

This backend does **not** implement Ticket 3 landlord response or AI arbitration yet.

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
```

## Database Setup

Full schema file:

```text
backend/sql/schema.sql
```

Ticket 2 migration file for existing Ticket 1 databases:

```text
backend/sql/ticket2-migration.sql
```

Run the full schema for a fresh setup:

```powershell
mysql -u root -p --execute="source sql/schema.sql"
```

Run only the Ticket 2 migration on top of an existing Ticket 1 database:

```powershell
mysql -u root -p --execute="source sql/ticket2-migration.sql"
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

### 4. Create a Ticket 1 dispute case

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
```

### 6. Check form requirements

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId/form-requirements" -Method GET -Headers $renterHeaders
```

Expected result for the sample above:

- `selectedFilingPath = NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50`
- `canGenerate = True` if enough data is present

### 7. Generate the official form PDF

```powershell
$generateFormBody = @{
  confirmGenerate = $true
} | ConvertTo-Json

$generatedFormResponse = Invoke-RestMethod -Uri "$API/cases/$caseId/generate-form" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $generateFormBody
$generatedFormId = $generatedFormResponse.generatedForm.id
$generatedFormId
```

### 8. Confirm generated form metadata on the case

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId" -Method GET -Headers $renterHeaders
Invoke-RestMethod -Uri "$API/cases/$caseId/generated-form" -Method GET -Headers $renterHeaders
```

### 9. Download the generated PDF

```powershell
Invoke-WebRequest `
  -Uri "$API/generated-forms/$generatedFormId/file" `
  -Headers $renterHeaders `
  -OutFile ".\generated-form.pdf"

Start-Process ".\generated-form.pdf"
```

### 10. Upload and verify evidence from Ticket 1

Set a real image path first:

```powershell
$imagePath = "C:\path\to\photo1.jpg"
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
$evidenceId = $uploadResponse.evidence[0].evidenceId

$fileStream.Dispose()
$content.Dispose()
$client.Dispose()

$evidenceId
```

List evidence:

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId/evidence" -Method GET -Headers $renterHeaders
```

Download evidence:

```powershell
Invoke-WebRequest `
  -Uri "$API/evidence/$evidenceId/file" `
  -Headers $renterHeaders `
  -OutFile ".\downloaded-evidence.jpg"
```

### 11. Test missing information path

Create another case, then save incomplete answers:

```powershell
$missingAnswersBody = @{
  answers = @{
    securityDepositIssueType = "WITHHELD_FOR_DAMAGE"
    borough = "QUEENS"
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$API/cases/$caseId/form-answers" -Method PATCH -Headers $renterHeaders -ContentType "application/json" -Body $missingAnswersBody

Invoke-RestMethod -Uri "$API/cases/$caseId/form-requirements" -Method GET -Headers $renterHeaders

Invoke-RestMethod -Uri "$API/cases/$caseId/generate-form" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $generateFormBody
```

Expected result:

- `status = MISSING_FORM_INFORMATION`
- `missingFields` includes the unanswered form fields

### 12. Test unsupported path

Create a case with an unsupported path:

```powershell
$unsupportedCaseBody = @{
  renterFullName = "John Smith"
  renterEmail = "john@example.com"
  landlordFullName = "Out of State Landlord"
  landlordEmail = "other@example.com"
  propertyAddress = "500 Market Street, Newark, NJ 07102"
  city = "Newark"
  state = "NJ"
  disputeType = "OTHER"
  disputeDescription = "This dispute does not match a supported New York filing path."
} | ConvertTo-Json

$unsupportedCase = Invoke-RestMethod -Uri "$API/cases" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $unsupportedCaseBody
$unsupportedCaseId = $unsupportedCase.caseId

Invoke-RestMethod -Uri "$API/cases/$unsupportedCaseId/form-requirements" -Method GET -Headers $renterHeaders
Invoke-RestMethod -Uri "$API/cases/$unsupportedCaseId/generate-form" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $generateFormBody
```

Expected result:

- `status = UNSUPPORTED_FORM_TYPE`

### 13. Test forbidden form-access path with a landlord

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
$landlordHeaders = @{
  Authorization = "Bearer $($landlordLoginResponse.token)"
}

try {
  Invoke-RestMethod -Uri "$API/cases/$caseId/form-requirements" -Method GET -Headers $landlordHeaders
} catch {
  $_.ErrorDetails.Message
}
```

Expected result: `FORBIDDEN`

### 14. Test unauthorized request

```powershell
try {
  Invoke-RestMethod -Uri "$API/cases/$caseId/form-requirements" -Method GET
} catch {
  $_.ErrorDetails.Message
}
```

## Notes

- Generated PDFs are protected and are **not** exposed through `express.static`.
- Ticket 2 uses deterministic routing only. It does **not** use AI to choose or fill forms.
- The MVP generates official filing packets for renter review/download/use. It does **not** electronically file them with a court or agency.
