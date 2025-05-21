# Movie Streaming Infrastructure

This directory contains Terraform configurations for setting up the AWS infrastructure required for the movie streaming application.

## Architecture

The infrastructure consists of the following AWS resources:

- **S3 Buckets**: For storing original videos and transcoded HLS files
- **IAM Roles and Policies**: For secure access to AWS resources
- **MediaConvert**: For transcoding videos to HLS format
- **CloudFront**: For efficient content delivery

## Directory Structure

```
infra/
├── modules/                  # Reusable Terraform modules
│   ├── s3/                   # S3 bucket configuration
│   ├── iam/                  # IAM roles and policies
│   ├── mediaconvert/         # MediaConvert resources
│   └── cloudfront/           # CloudFront distribution
├── environments/             # Environment-specific configurations
│   ├── dev/                  # Development environment
│   ├── staging/              # Staging environment
│   └── prod/                 # Production environment
├── main.tf                   # Main Terraform configuration
├── variables.tf              # Input variables
└── outputs.tf                # Output values
```

## Prerequisites

1. [Terraform](https://www.terraform.io/downloads.html) (v1.0.0 or newer)
2. AWS CLI configured with appropriate credentials
3. S3 bucket for Terraform state (create this manually before running Terraform)
4. DynamoDB table for state locking (create this manually before running Terraform)

## Setting Up Remote State

Before running Terraform, you need to create an S3 bucket and DynamoDB table for remote state:

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket movie-streaming-terraform-state \
  --region us-east-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
  --bucket movie-streaming-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name movie-streaming-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Usage

### Initialize Terraform

```bash
# Navigate to the environment directory
cd environments/dev

# Initialize Terraform
terraform init
```

### Create a Workspace (Optional)

```bash
# Create and switch to a new workspace
terraform workspace new dev
```

### Plan and Apply

```bash
# Generate and review an execution plan
terraform plan

# Apply the changes
terraform apply
```

Each environment has its own `terraform.tfvars` file with environment-specific configurations:

- **Development**: Optimized for rapid iteration with force_destroy enabled
- **Staging**: Similar to production but with more permissive settings
- **Production**: Strict security settings with no automatic bucket deletion

### Switching Environments

```bash
# Navigate to the desired environment
cd ../staging

# Initialize and apply
terraform init
terraform apply
```

## Outputs

After applying the Terraform configuration, you'll get several outputs that you can use in your application:

- `input_bucket_name`: The name of the S3 bucket for input videos
- `output_bucket_name`: The name of the S3 bucket for transcoded videos
- `mediaconvert_endpoint`: The MediaConvert endpoint URL
- `mediaconvert_role_arn`: The ARN of the IAM role for MediaConvert
- `cloudfront_domain_name`: The domain name of the CloudFront distribution
- `env_file_content`: Content that can be used in your application's .env file

## Environment Variables

The `env_file_content` output provides the environment variables you need to add to your application's `.env` file:

```
# AWS Settings for dev environment
AWS_REGION=us-east-1
S3_INPUT_BUCKET=movie-streaming-dev-input
S3_OUTPUT_BUCKET=movie-streaming-dev-output
CLOUDFRONT_DOMAIN=d1234abcdef.cloudfront.net
MEDIACONVERT_ENDPOINT=https://abcd1234.mediaconvert.us-east-1.amazonaws.com
MEDIACONVERT_ROLE_ARN=arn:aws:iam::123456789012:role/movie-streaming-dev-mediaconvert-role
```

## Cleanup

To destroy the infrastructure:

```bash
terraform destroy
```

## Notes

- The `force_destroy` parameter is set to `true` for non-production environments, allowing you to delete S3 buckets even if they contain objects.
- For production, consider adding additional security measures like bucket policies, encryption, and access logging.
- CloudFront distributions can take up to 15-30 minutes to deploy or update.
