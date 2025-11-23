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

Write-Host "Setting postgres user password..."
& $gcloud sql users set-password postgres --instance=$instance --password="SecureP@ssw0rd2025!" --quiet

Write-Host "Creating database appri..."
& $gcloud sql databases create appri --instance=$instance --quiet

Write-Host "Deploying to App Engine..."
Set-Location server
& $gcloud app deploy --quiet
Set-Location ..

Write-Host "Deployment complete!"
