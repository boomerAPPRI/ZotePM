# Deploy Script for Piano Instance (Simple UI)
# Usage: .\deploy_piano.ps1

$ErrorActionPreference = 'Stop'

Write-Host "Starting Piano Instance Deployment..." -ForegroundColor Green

# 1. Clean Build Directory
if (Test-Path "server\public") {
    Write-Host "Cleaning previous build..."
    Remove-Item -Path "server\public" -Recurse -Force
}
# 2. Build Client for Piano Mode
Set-Location client
# npm install is assumed done. Uncomment if needed.
# Write-Host "Installing dependencies..."
# cmd /c "npm install"

Write-Host "Building client (Mode: Piano)..."
cmd /c "npm run build -- --mode piano"

# Vite builds directly to ../server/public, so check that instead
if (!(Test-Path "..\server\public\index.html")) {
    Write-Error "Client build failed! ..\server\public\index.html not found."
}

Set-Location ..

# 3. Verify Server Public Content (Redundant but safe)
if (!(Test-Path "server\public\index.html")) {
    Write-Error "Deployment preparation failed! server\public\index.html missing."
}

# 5. Connect to GCP and Create Database (Idempotent)
Write-Host "Connecting to GCP SQL Proxy (Ensure Cloud SQL Auth Proxy is running if local, or gcloud handles it)..." 
# For deployment, the app connects via socket. For migration here, we use gcloud/psql if needed.
# We'll stick to creating the DB via gcloud command for safety.

$DB_INSTANCE = "appri-db-2"
$DB_NAME = "appri_piano"

Write-Host "Creating database $DB_NAME... (Ignore error if exists)"
cmd /c "gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE 2>&1"
# We ignore error because it might exist.

# 6. Deploy to App Engine (Service: piano)
Set-Location server
Write-Host "Deploying to App Engine (Service: piano)..."
# Use --version to avoid too many versions, or let GCP handle it.
cmd /c "gcloud app deploy app-piano.yaml --quiet"

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "URL: https://piano-dot-prediction-market-project.uc.r.appspot.com" -ForegroundColor Cyan
