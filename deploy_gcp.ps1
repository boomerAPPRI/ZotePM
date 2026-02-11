# Default Deployment Script (ZotePM)
# Usage: .\deploy_gcp.ps1

$ErrorActionPreference = 'Stop'

Write-Host "Starting Default Instance Deployment..." -ForegroundColor Green

# 1. Clean Build Directory
if (Test-Path "server\public") {
    Write-Host "Cleaning previous build..."
    Remove-Item -Path "server\public" -Recurse -Force
}
New-Item -ItemType Directory -Force -Path "server\public" | Out-Null

# 2. Build Client (Default Mode)
Set-Location client
Write-Host "Building client (Mode: Default)..."
cmd /c "npm run build"

# Vite builds directly to ../server/public
if (!(Test-Path "..\server\public\index.html")) {
    Write-Error "Client build failed! ..\server\public\index.html not found."
}
Set-Location ..

# 3. Verify Server Public Content
if (!(Test-Path "server\public\index.html")) {
    Write-Error "Deployment preparation failed! server\public\index.html missing."
}

# 4. Connect to GCP and Create Database (Idempotent)
Write-Host "Connecting to GCP SQL Proxy..." 
$DB_INSTANCE = "appri-db-2"
$DB_NAME = "appri"

Write-Host "Creating database $DB_NAME... (Ignore error if exists)"
cmd /c "gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE 2>&1"
# Ignore error if exists

# 5. Deploy to App Engine (Default Service)
Set-Location server
Write-Host "Deploying to App Engine (Service: default)..."
cmd /c "gcloud app deploy app.yaml --quiet"

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "URL: https://prediction-market-project.uc.r.appspot.com" -ForegroundColor Cyan
