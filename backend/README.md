# Renter Dispute Assistant Backend

This backend currently implements **Jira Ticket 1** for the CSCI370 Renter Dispute Assistant project.

## Implemented in Ticket 1

- User authentication foundation
  - Register
  - Login
  - `GET /api/me`
  - JWT middleware
  - Password hashing with bcrypt

- Dispute case intake, storage, and retrieval
  - Create renter dispute cases
  - List cases for the logged-in user
  - Retrieve one case by ID
  - Role-based case access for renters and landlords

- Protected image evidence upload and retrieval
  - Local image storage
  - MySQL evidence metadata
  - Protected evidence file access through backend routes

## Not Implemented Yet

The following routes are intentionally not implemented yet because they belong to later Jira tickets:

- `POST /api/cases/:caseId/generate-form`
- `POST /api/cases/:caseId/landlord-response`
- `POST /api/cases/:caseId/arbitration`
- `GET /api/cases/:caseId/arbitration`

---

# Technology Stack

- Node.js
- Express.js
- MySQL
- JWT authentication
- bcrypt password hashing
- multer for image evidence uploads
- local backend file storage for uploaded evidence images

---

# System Requirements

Install the following before running the backend:

- Node.js
- npm
- MySQL Server
- MySQL Workbench or MySQL command-line client

The backend runs on:

```text
http://localhost:8080
```

The frontend is expected to run on:

```text
http://localhost:5173
```

---

# Project Setup

## 1. Install dependencies

From the `backend` folder:

```powershell
npm install
```

## 2. Create environment file

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set your real local values:

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

Do **not** commit the `.env` file.

---

# Database Setup

The schema file is located at:

```text
backend/sql/schema.sql
```

## Option 1: Run schema through MySQL command line

If `mysql` is available in your Windows PATH, run this from the `backend` folder:

```powershell
mysql -u root -p --execute="source sql/schema.sql"
```

If MySQL is not in PATH, use the full path to `mysql.exe`.

Example:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p --execute="source sql/schema.sql"
```

If your installed version is different, change the path. For example:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p --execute="source sql/schema.sql"
```

## Option 2: Run schema through MySQL Workbench

1. Open MySQL Workbench.
2. Connect to your local MySQL server.
3. Open `backend/sql/schema.sql`.
4. Run the full script.
5. Confirm the `renter_dispute_app` database and tables were created.

---

# Run the Backend

From the `backend` folder:

```powershell
npm run dev
```

If successful, the backend should run on:

```text
http://localhost:8080
```

Health check:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
```

---

# Manual Testing with PowerShell

The following commands use PowerShell native requests instead of `curl`.

Run these commands in a second PowerShell terminal while the backend is running in the first terminal.

## 1. Set API base URL

```powershell
$API = "http://localhost:8080/api"
```

## 2. Register a renter

```powershell
$renterRegisterBody = @{
  fullName = "John Smith"
  email = "john@example.com"
  password = "password123"
  role = "RENTER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API/auth/register" -Method POST -ContentType "application/json" -Body $renterRegisterBody
```

## 3. Login as renter

```powershell
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

## 4. Confirm logged-in user

```powershell
Invoke-RestMethod -Uri "$API/me" -Method GET -Headers $renterHeaders
```

## 5. Create a dispute case

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

  disputeDescription = "The landlord withheld most of my security deposit for normal wear and tear."
  evidenceDescription = "Photos, text messages, lease agreement, and move-out notes."
} | ConvertTo-Json

$createdCase = Invoke-RestMethod -Uri "$API/cases" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $caseBody

$createdCase

$caseId = $createdCase.caseId
```

## 6. List renter cases

```powershell
Invoke-RestMethod -Uri "$API/cases" -Method GET -Headers $renterHeaders
```

## 7. Get one case by ID

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId" -Method GET -Headers $renterHeaders
```

---

# Evidence Image Upload Testing

PowerShell 5 does not support `Invoke-RestMethod -Form`, so use the script below.

## 1. Set image path

Change this path to an actual image on your computer:

```powershell
$imagePath = "C:\path\to\photo1.jpg"
```

Supported file types:

```text
.jpg
.jpeg
.png
.webp
```

## 2. Upload evidence image

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

$responseText

$fileStream.Dispose()
$content.Dispose()
$client.Dispose()
```

## 3. Save evidence ID

```powershell
$uploadResponse = $responseText | ConvertFrom-Json
$evidenceId = $uploadResponse.evidenceFiles[0].id
$evidenceId
```

## 4. List evidence metadata

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId/evidence" -Method GET -Headers $renterHeaders
```

## 5. Download uploaded evidence image

```powershell
Invoke-WebRequest `
  -Uri "$API/evidence/$evidenceId/file" `
  -Headers $renterHeaders `
  -OutFile ".\downloaded-evidence.jpg"
```

Open the downloaded image:

```powershell
Start-Process ".\downloaded-evidence.jpg"
```

---

# Error Testing

## Validation error

```powershell
$badCaseBody = @{
  renterFullName = ""
  renterEmail = "bad-email"
  landlordFullName = ""
  landlordEmail = "bad-email"
  propertyAddress = ""
  state = ""
  disputeType = "INVALID_TYPE"
  disputeDescription = ""
  amountRequested = -100
} | ConvertTo-Json

try {
  Invoke-RestMethod -Uri "$API/cases" -Method POST -Headers $renterHeaders -ContentType "application/json" -Body $badCaseBody
} catch {
  $_.ErrorDetails.Message
}
```

## Unauthorized request

```powershell
try {
  Invoke-RestMethod -Uri "$API/cases" -Method GET
} catch {
  $_.ErrorDetails.Message
}
```

## Not found case

```powershell
try {
  Invoke-RestMethod -Uri "$API/cases/999999" -Method GET -Headers $renterHeaders
} catch {
  $_.ErrorDetails.Message
}
```

---

# Landlord Access Test

Register a landlord using the same email saved in the case:

```powershell
$landlordRegisterBody = @{
  fullName = "ABC Management"
  email = "landlord@example.com"
  password = "password123"
  role = "LANDLORD"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API/auth/register" -Method POST -ContentType "application/json" -Body $landlordRegisterBody
```

Login as landlord:

```powershell
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

List landlord cases:

```powershell
Invoke-RestMethod -Uri "$API/cases" -Method GET -Headers $landlordHeaders
```

Get renter case as landlord:

```powershell
Invoke-RestMethod -Uri "$API/cases/$caseId" -Method GET -Headers $landlordHeaders
```

---

# Forbidden Access Test

Register another landlord with a different email:

```powershell
$otherLandlordRegisterBody = @{
  fullName = "Wrong Landlord"
  email = "wronglandlord@example.com"
  password = "password123"
  role = "LANDLORD"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API/auth/register" -Method POST -ContentType "application/json" -Body $otherLandlordRegisterBody
```

Login as the unrelated landlord:

```powershell
$otherLandlordLoginBody = @{
  email = "wronglandlord@example.com"
  password = "password123"
} | ConvertTo-Json

$otherLandlordLoginResponse = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -ContentType "application/json" -Body $otherLandlordLoginBody

$otherLandlordHeaders = @{
  Authorization = "Bearer $otherLandlordLoginResponse.token"
}
```

Try to access another user’s case:

```powershell
try {
  Invoke-RestMethod -Uri "$API/cases/$caseId" -Method GET -Headers $otherLandlordHeaders
} catch {
  $_.ErrorDetails.Message
}
```

Expected result: `FORBIDDEN`.

---

# Stopping the Backend

In the PowerShell terminal running the backend:

```text
Ctrl + C
```

If asked:

```text
Terminate batch job (Y/N)?
```

Type:

```text
Y
```

Then press Enter.

---

# Git Notes

Commit these files:

```text
README.md
.env.example
package.json
package-lock.json
sql/schema.sql
src/
uploads/evidence/.gitkeep
```

Do not commit these files:

```text
.env
node_modules/
uploads/evidence/*.jpg
uploads/evidence/*.jpeg
uploads/evidence/*.png
uploads/evidence/*.webp
```

`node_modules/` should not be committed to GitHub. For Node.js projects, the required libraries are represented by:

```text
package.json
package-lock.json
```

Anyone reviewing or running the project can install the required libraries with:

```powershell
npm install
```

If the final submission zip must run completely offline, `node_modules/` can be included only in the final zip as an extra precaution, but it should still not be committed to GitHub.

---

# Notes

This backend is prepared for later Jira tickets.

Ticket 2 should implement official form selection and generated form data.

Ticket 3 should implement landlord response and AI arbitration.