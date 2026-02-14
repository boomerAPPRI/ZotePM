# Deploy Script for APPRI Instance
# Usage: .\deploy_appri.ps1

$ErrorActionPreference = 'Stop'

Write-Host "Starting APPRI Instance Deployment..." -ForegroundColor Green

# 1. Clean Build Directory
if (Test-Path "server\public") {
    Write-Host "Cleaning previous build..."
    Remove-Item -Path "server\public" -Recurse -Force
}

# 2. Build Client for APPRI Mode
Set-Location client
Write-Host "Building client (Mode: APPRI)..."
cmd /c "npm run build -- --mode appri"

# Vite builds directly to ../server/public, so check that instead
if (!(Test-Path "..\server\public\index.html")) {
    Write-Error "Client build failed! ..\server\public\index.html not found."
}

Set-Location ..

# 3. Connect to GCP and Create Database (Idempotent)
Write-Host "Connecting to GCP SQL Proxy..." 
$DB_INSTANCE = "appri-db-2"
$DB_NAME = "appri_appri"

Write-Host "Creating database $DB_NAME... (Ignore error if exists)"
cmd /c "gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE 2>&1"
# We ignore error because it might exist.

# 4. Deploy to App Engine (Service: appri)
Set-Location server
Write-Host "Deploying to App Engine (Service: appri)..."
cmd /c "gcloud app deploy app-appri.yaml --quiet"

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "URL: https://appri-dot-prediction-market-project.uc.r.appspot.com" -ForegroundColor Cyan
