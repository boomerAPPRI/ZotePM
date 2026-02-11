$gcloud = "C:\Users\BoomerChang\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
$instance = "appri-db-2"

Write-Host "Waiting for Cloud SQL instance $instance to be ready..."
do {
    $status = & $gcloud sql instances describe $instance --format="value(state)"
    Write-Host "Status: $status"
    if ($status -ne "RUNNABLE") { Start-Sleep -Seconds 10 }
} until ($status -eq "RUNNABLE")

Write-Host "Instance is ready!"

Write-Host "Creating database appri_superbowl... (Ignore error if exists)"
& $gcloud sql databases create appri_superbowl --instance=$instance --quiet

Write-Host "Cleaning previous build..."
if (Test-Path "server\public") {
    Remove-Item -Recurse -Force "server\public\*"
}
New-Item -ItemType Directory -Force -Path "server\public" | Out-Null

Set-Location client
# Write-Host "Installing dependencies..."
# cmd /c "npm install"

Write-Host "Building client (Force Rebuild)..."
cmd /c "npm run build -- --mode superbowl"
Set-Location ..

if (!(Test-Path "server\public\index.html")) {
    Write-Error "Build failed! server\public\index.html not found."
    exit 1
}

Write-Host "Deploying to App Engine (Super Bowl Service)..."
Set-Location server
& $gcloud app deploy app-superbowl.yaml --quiet
Set-Location ..

Write-Host "Deployment complete! Access at: https://superbowl-dot-prediction-market-project.uc.r.appspot.com"
Write-Host "NOTE: This new version will automatically take 100% traffic."
