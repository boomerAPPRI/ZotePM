$gcloud = "C:\Users\BoomerChang\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
$instance = "appri-db-2"
$region = "us-central1"
$project = "prediction-market-project"

Write-Host "Waiting for Cloud SQL instance $instance to be ready..."
do {
    $status = & $gcloud sql instances describe $instance --format="value(state)"
    Write-Host "Status: $status"
    if ($status -ne "RUNNABLE") { Start-Sleep -Seconds 10 }
} until ($status -eq "RUNNABLE")

Write-Host "Instance is ready!"

Write-Host "Creating database appri_staging..."
& $gcloud sql databases create appri_staging --instance=$instance --quiet

Write-Host "Building client..."
& npm run build --prefix client

Write-Host "Deploying to App Engine (Staging)..."
Set-Location server
& $gcloud app deploy app-staging.yaml --quiet
Set-Location ..

Write-Host "Deployment complete! Access staging at: https://staging-dot-prediction-market-project.uc.r.appspot.com"
