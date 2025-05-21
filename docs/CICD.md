# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Movie Streaming application.

## Overview

The CI/CD pipeline automates the testing, building, and deployment of the application across different environments (dev, staging, prod). It consists of three main workflows:

1. **Infrastructure Pipeline**: Manages the Terraform infrastructure
2. **Backend Pipeline**: Builds and deploys the FastAPI backend
3. **Frontend Pipeline**: Builds and deploys the React frontend

## Prerequisites

Before using the CI/CD pipeline, you need to set up the following:

1. **GitHub Repository**: Push your code to a GitHub repository
2. **GitHub Secrets**: Configure the required secrets (see below)
3. **AWS Account**: Create an AWS account with appropriate permissions
4. **Initial Infrastructure**: Run the initialization workflow to set up the Terraform state storage

## GitHub Secrets

The following secrets need to be configured in your GitHub repository:

### AWS Credentials
- `AWS_ACCESS_KEY_ID`: AWS access key with appropriate permissions
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key

### Terraform Configuration
- `TF_STATE_BUCKET`: S3 bucket for Terraform state (created by init workflow)
- `TF_LOCK_TABLE`: DynamoDB table for Terraform state locking (created by init workflow)
- `PROJECT_NAME`: Name of your project (e.g., "movie-streaming")

### Domain Configuration (Optional)
- `DOMAIN_NAME`: Your custom domain name (e.g., "example.com")
- `ZONE_ID`: Route53 hosted zone ID for your domain

### Email Configuration
- `EMAILS_FROM_EMAIL`: Email address to use as the sender
- `EMAILS_FROM_NAME`: Name to use as the sender

### Frontend Configuration
- `FRONTEND_BUCKET_NAME`: S3 bucket name for frontend hosting
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID
- `VITE_API_URL`: URL of the backend API
- `VITE_CLOUDFRONT_DOMAIN`: CloudFront domain for video streaming

### GitHub Token
- `GH_PA_TOKEN`: GitHub Personal Access Token with repo and workflow permissions

## Workflow Descriptions

### 1. Initialize Infrastructure Workflow

This workflow sets up the necessary AWS resources for Terraform state management:

- Creates an S3 bucket for Terraform state
- Creates a DynamoDB table for state locking
- Creates an ECR repository for the backend container

**Trigger**: Manual (workflow_dispatch)

**File**: `.github/workflows/init-infrastructure.yml`

### 2. Terraform Infrastructure Workflow

This workflow manages the deployment of the infrastructure using Terraform:

- Validates and formats Terraform code
- Plans infrastructure changes
- Applies infrastructure changes
- Outputs environment variables for the application

**Triggers**:
- Push to main branch (infra directory changes)
- Pull request to main branch (infra directory changes)
- Manual (workflow_dispatch)
- Repository dispatch event from other workflows

**File**: `.github/workflows/terraform.yml`

### 3. Backend CI/CD Workflow

This workflow manages the backend application:

- Runs tests
- Builds and pushes Docker image to ECR
- Triggers infrastructure deployment to update the ECS service

**Triggers**:
- Push to main branch (backend directory changes)
- Pull request to main branch (backend directory changes)
- Manual (workflow_dispatch)

**File**: `.github/workflows/backend.yml`

### 4. Frontend CI/CD Workflow

This workflow manages the frontend application:

- Runs tests
- Builds the React application
- Deploys to S3
- Invalidates CloudFront cache

**Triggers**:
- Push to main branch (frontend directory changes)
- Pull request to main branch (frontend directory changes)
- Manual (workflow_dispatch)

**File**: `.github/workflows/frontend.yml`

## Deployment Process

### Initial Setup

1. Push your code to GitHub
2. Configure all required GitHub secrets
3. Run the "Initialize Infrastructure" workflow
4. Run the "Terraform Infrastructure" workflow to create the initial infrastructure

### Ongoing Development

1. Develop and push changes to your repository
2. The appropriate workflow will automatically run based on the changed files
3. For backend changes, the Docker image is built and pushed to ECR, then the infrastructure is updated
4. For frontend changes, the React app is built and deployed to S3, then the CloudFront cache is invalidated
5. For infrastructure changes, Terraform applies the changes to the AWS resources

## Environment Variables

After the infrastructure is deployed, the Terraform workflow outputs environment variables that can be used by the application. These variables are saved as an artifact and can be downloaded from the GitHub Actions run.

## Troubleshooting

If a workflow fails, check the following:

1. **GitHub Secrets**: Ensure all required secrets are configured correctly
2. **AWS Permissions**: Verify that the AWS credentials have the necessary permissions
3. **Workflow Logs**: Check the GitHub Actions logs for detailed error messages
4. **Manual Deployment**: Try running the workflow manually with the workflow_dispatch trigger
