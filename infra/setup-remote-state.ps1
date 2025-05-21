# PowerShell script to set up remote state for Terraform

param (
    [string]$BucketName = "movie-streaming-terraform-state",
    [string]$TableName = "movie-streaming-terraform-locks",
    [string]$Region = "us-east-1"
)

Write-Host "Setting up Terraform remote state infrastructure..." -ForegroundColor Green

# Create S3 bucket for Terraform state
Write-Host "Creating S3 bucket: $BucketName..." -ForegroundColor Yellow
try {
    aws s3api create-bucket --bucket $BucketName --region $Region
    Write-Host "S3 bucket created successfully." -ForegroundColor Green
} catch {
    Write-Host "Error creating S3 bucket: $_" -ForegroundColor Red
    Write-Host "The bucket might already exist or the name is taken." -ForegroundColor Yellow
}

# Enable versioning on the bucket
Write-Host "Enabling versioning on the bucket..." -ForegroundColor Yellow
try {
    aws s3api put-bucket-versioning --bucket $BucketName --versioning-configuration Status=Enabled
    Write-Host "Versioning enabled successfully." -ForegroundColor Green
} catch {
    Write-Host "Error enabling versioning: $_" -ForegroundColor Red
}

# Enable encryption on the bucket
Write-Host "Enabling encryption on the bucket..." -ForegroundColor Yellow
try {
    aws s3api put-bucket-encryption --bucket $BucketName --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
    Write-Host "Encryption enabled successfully." -ForegroundColor Green
} catch {
    Write-Host "Error enabling encryption: $_" -ForegroundColor Red
}

# Create DynamoDB table for state locking
Write-Host "Creating DynamoDB table: $TableName..." -ForegroundColor Yellow
try {
    aws dynamodb create-table `
        --table-name $TableName `
        --attribute-definitions AttributeName=LockID,AttributeType=S `
        --key-schema AttributeName=LockID,KeyType=HASH `
        --billing-mode PAY_PER_REQUEST `
        --region $Region
    Write-Host "DynamoDB table created successfully." -ForegroundColor Green
} catch {
    Write-Host "Error creating DynamoDB table: $_" -ForegroundColor Red
    Write-Host "The table might already exist." -ForegroundColor Yellow
}

Write-Host "Remote state setup complete!" -ForegroundColor Green
Write-Host "You can now initialize Terraform with these backend settings:" -ForegroundColor Green
Write-Host "
terraform {
  backend ""s3"" {
    bucket         = ""$BucketName""
    key            = ""<environment>/terraform.tfstate""
    region         = ""$Region""
    dynamodb_table = ""$TableName""
    encrypt        = true
  }
}
" -ForegroundColor Cyan
