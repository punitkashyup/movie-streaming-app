# VPC Outputs
output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

output "database_subnet_ids" {
  description = "List of IDs of database subnets"
  value       = module.vpc.database_subnet_ids
}

# S3 Outputs
output "input_bucket_name" {
  description = "Name of the S3 bucket for input videos"
  value       = module.s3_buckets.input_bucket_name
}

output "output_bucket_name" {
  description = "Name of the S3 bucket for transcoded videos"
  value       = module.s3_buckets.output_bucket_name
}

output "frontend_bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  value       = module.frontend.bucket_name
}

output "main_bucket_name" {
  description = "Name of the main S3 bucket for general storage"
  value       = aws_s3_bucket.main.bucket
}

# CloudFront Outputs
output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution for video streaming"
  value       = module.cloudfront.cloudfront_domain_name
}

output "frontend_cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution for frontend"
  value       = module.frontend.cloudfront_domain_name
}

# MediaConvert Outputs
output "mediaconvert_endpoint" {
  description = "MediaConvert endpoint URL"
  value       = module.mediaconvert.endpoint
}

output "mediaconvert_role_arn" {
  description = "The ARN of the IAM role for MediaConvert"
  value       = module.iam.mediaconvert_role_arn
}

output "mediaconvert_queue_arn" {
  description = "ARN of the MediaConvert queue"
  value       = module.mediaconvert.queue_arn
}

# RDS Outputs
output "db_instance_endpoint" {
  description = "The connection endpoint of the RDS instance"
  value       = module.rds.db_instance_endpoint
}

output "db_proxy_endpoint" {
  description = "The connection endpoint for the RDS Proxy (if enabled)"
  value       = var.enable_rds_proxy ? module.rds_proxy[0].proxy_endpoint : null
}

output "bastion_public_ip" {
  description = "The public IP address of the bastion host (if enabled)"
  value       = var.enable_bastion ? module.bastion[0].bastion_public_ip : null
}

output "db_instance_name" {
  description = "The database name"
  value       = module.rds.db_instance_name
}

output "db_credentials_secret_arn" {
  description = "The ARN of the Secrets Manager secret containing database credentials"
  value       = module.rds.db_credentials_secret_arn
}

# Backend ECS Outputs
output "backend_alb_dns_name" {
  description = "DNS name of the Application Load Balancer for the backend"
  value       = module.backend.alb_dns_name
}

output "backend_cluster_name" {
  description = "Name of the ECS cluster for the backend"
  value       = module.backend.cluster_name
}

output "backend_service_name" {
  description = "Name of the ECS service for the backend"
  value       = module.backend.service_name
}

# DNS Outputs
output "frontend_url" {
  description = "URL for the frontend application"
  value       = local.use_custom_domain ? "https://${local.frontend_domain}" : "https://${module.frontend.cloudfront_domain_name}"
}

output "api_url" {
  description = "URL for the API"
  value       = local.use_custom_domain ? "https://${local.api_domain}" : "http://${module.backend.alb_dns_name}"
}

# Environment Variables for Application
output "api_secret_arn" {
  description = "ARN of the Secrets Manager secret containing the API secret key"
  value       = aws_secretsmanager_secret.api_secret.arn
}

output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = local.use_ses ? aws_ses_domain_identity.main[0].arn : null
}

output "env_file_content" {
  description = "Content that can be used in your application's .env file"
  value       = <<-EOT
    # AWS Settings for ${local.environment} environment
    AWS_REGION=${var.aws_region}
    S3_BUCKET_NAME=${aws_s3_bucket.main.bucket}
    S3_INPUT_BUCKET=${module.s3_buckets.input_bucket_name}
    S3_OUTPUT_BUCKET=${module.s3_buckets.output_bucket_name}
    CLOUDFRONT_DOMAIN=${module.cloudfront.cloudfront_domain_name}
    MEDIACONVERT_ENDPOINT=${module.mediaconvert.endpoint}
    MEDIACONVERT_ROLE_ARN=${module.iam.mediaconvert_role_arn}

    # Database Settings
    # Use Secrets Manager to retrieve the database credentials in production
    # DATABASE_URL can be retrieved from Secrets Manager using the ARN: ${module.rds.db_credentials_secret_arn}
    # RDS Proxy endpoint: ${var.enable_rds_proxy ? module.rds_proxy[0].proxy_endpoint : "Not enabled"}
    # Bastion host: ${var.enable_bastion ? module.bastion[0].bastion_public_ip : "Not enabled"}

    # API Settings
    # SECRET_KEY can be retrieved from Secrets Manager using the ARN: ${aws_secretsmanager_secret.api_secret.arn}

    # Email Settings
    EMAILS_ENABLED=${local.use_ses ? "True" : "False"}
    EMAILS_FROM_EMAIL=${var.emails_from_email}
    EMAILS_FROM_NAME=${var.emails_from_name}
    EMAILS_TEMPLATE_DIR=app/email-templates

    # URLs
    FRONTEND_URL=${local.use_custom_domain ? "https://${local.frontend_domain}" : "https://${module.frontend.cloudfront_domain_name}"}
    API_URL=${local.use_custom_domain ? "https://${local.api_domain}" : "http://${module.backend.alb_dns_name}"}
  EOT
}
