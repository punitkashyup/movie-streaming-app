#!/bin/bash
# Script to set up remote state for Terraform

# Default values
BUCKET_NAME=${1:-"movie-streaming-terraform-state"}
TABLE_NAME=${2:-"movie-streaming-terraform-locks"}
REGION=${3:-"us-east-1"}

echo -e "\e[32mSetting up Terraform remote state infrastructure...\e[0m"

# Create S3 bucket for Terraform state
echo -e "\e[33mCreating S3 bucket: $BUCKET_NAME...\e[0m"
if aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION; then
    echo -e "\e[32mS3 bucket created successfully.\e[0m"
else
    echo -e "\e[31mError creating S3 bucket.\e[0m"
    echo -e "\e[33mThe bucket might already exist or the name is taken.\e[0m"
fi

# Enable versioning on the bucket
echo -e "\e[33mEnabling versioning on the bucket...\e[0m"
if aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled; then
    echo -e "\e[32mVersioning enabled successfully.\e[0m"
else
    echo -e "\e[31mError enabling versioning.\e[0m"
fi

# Enable encryption on the bucket
echo -e "\e[33mEnabling encryption on the bucket...\e[0m"
if aws s3api put-bucket-encryption --bucket $BUCKET_NAME --server-side-encryption-configuration '{
    "Rules": [
        {
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }
    ]
}'; then
    echo -e "\e[32mEncryption enabled successfully.\e[0m"
else
    echo -e "\e[31mError enabling encryption.\e[0m"
fi

# Create DynamoDB table for state locking
echo -e "\e[33mCreating DynamoDB table: $TABLE_NAME...\e[0m"
if aws dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION; then
    echo -e "\e[32mDynamoDB table created successfully.\e[0m"
else
    echo -e "\e[31mError creating DynamoDB table.\e[0m"
    echo -e "\e[33mThe table might already exist.\e[0m"
fi

echo -e "\e[32mRemote state setup complete!\e[0m"
echo -e "\e[32mYou can now initialize Terraform with these backend settings:\e[0m"
echo -e "\e[36m
terraform {
  backend \"s3\" {
    bucket         = \"$BUCKET_NAME\"
    key            = \"<environment>/terraform.tfstate\"
    region         = \"$REGION\"
    dynamodb_table = \"$TABLE_NAME\"
    encrypt        = true
  }
}
\e[0m"
