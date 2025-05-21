terraform {
  required_version = ">= 1.0.0"

  backend "s3" {
    # These values must be provided via command line arguments or environment variables
    # bucket         = "movie-streaming-terraform-state"
    # key            = "terraform.tfstate"
    # region         = "us-east-1"
    # dynamodb_table = "movie-streaming-terraform-locks"
    # encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = terraform.workspace
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}

# Remote state data source for shared resources
data "terraform_remote_state" "shared" {
  count = terraform.workspace == "dev" ? 0 : 1

  backend = "s3"
  config = {
    bucket = var.remote_state_bucket
    key    = "shared/terraform.tfstate"
    region = var.aws_region
  }
}

# Local variables
locals {
  environment = terraform.workspace
  name_prefix = "${var.project_name}-${local.environment}"
  domain_name = var.domain_name != null ? var.domain_name : null

  # Determine if we're using a custom domain
  use_custom_domain = var.domain_name != null && var.zone_id != null

  # Frontend domain names
  frontend_domain = local.use_custom_domain ? "${local.environment == "prod" ? "" : "${local.environment}."}${var.domain_name}" : null
  api_domain      = local.use_custom_domain ? "api.${local.environment == "prod" ? "" : "${local.environment}."}${var.domain_name}" : null

  # S3 bucket names
  main_bucket_name = var.s3_bucket_name_override != null ? var.s3_bucket_name_override : "${local.name_prefix}-main"

  # Email configuration
  use_ses = var.enable_ses && (var.ses_domain != null || local.use_custom_domain)
  ses_domain = var.ses_domain != null ? var.ses_domain : var.domain_name

  # Generate a random secret key if not provided
  api_secret_key = var.api_secret_key != null ? var.api_secret_key : random_password.api_secret[0].result

  # Tags
  common_tags = merge(
    var.tags,
    {
      Environment = local.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  )
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  name_prefix           = local.name_prefix
  vpc_cidr              = var.vpc_cidr
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs
  availability_zones    = var.availability_zones
  create_nat_gateway    = var.create_nat_gateway
  enable_flow_logs      = var.enable_vpc_flow_logs
}

# S3 Buckets Module
module "s3_buckets" {
  source = "./modules/s3"

  name_prefix        = local.name_prefix
  input_bucket_name  = var.input_bucket_name_override != null ? var.input_bucket_name_override : "${local.name_prefix}-input"
  output_bucket_name = var.output_bucket_name_override != null ? var.output_bucket_name_override : "${local.name_prefix}-output"
  force_destroy      = var.force_destroy_buckets != null ? var.force_destroy_buckets : local.environment != "prod"
  enable_versioning  = var.enable_bucket_versioning
  enable_encryption  = var.enable_bucket_encryption
  allowed_origins    = var.cloudfront_allowed_origins
}

# IAM Module
module "iam" {
  source = "./modules/iam"

  name_prefix        = local.name_prefix
  input_bucket_name  = module.s3_buckets.input_bucket_name
  output_bucket_name = module.s3_buckets.output_bucket_name
  main_bucket_name   = aws_s3_bucket.main.bucket
}

# MediaConvert Module
module "mediaconvert" {
  source = "./modules/mediaconvert"

  name_prefix           = local.name_prefix
  mediaconvert_role_arn = module.iam.mediaconvert_role_arn
  queue_priority        = var.mediaconvert_queue_priority
}

# CloudFront Module for video streaming
module "cloudfront" {
  source = "./modules/cloudfront"

  name_prefix               = local.name_prefix
  output_bucket_name        = module.s3_buckets.output_bucket_name
  output_bucket_arn         = module.s3_buckets.output_bucket_arn
  output_bucket_domain_name = module.s3_buckets.output_bucket_domain_name
  price_class               = var.cloudfront_price_class
  allowed_origins           = var.cloudfront_allowed_origins
}

# DNS Module
module "dns" {
  source = "./modules/dns"
  count  = local.use_custom_domain ? 1 : 0

  name_prefix                    = local.name_prefix
  create_certificate             = true
  domain_name                    = var.domain_name
  subject_alternative_names      = ["*.${var.domain_name}"]
  zone_id                        = var.zone_id

  # Frontend DNS settings
  frontend_domain_name           = local.frontend_domain
  frontend_cloudfront_domain_name = module.frontend.cloudfront_domain_name
  frontend_cloudfront_zone_id    = module.frontend.cloudfront_hosted_zone_id

  # Backend DNS settings
  backend_domain_name            = local.api_domain
  backend_alb_dns_name           = module.backend.alb_dns_name
  backend_alb_zone_id            = module.backend.alb_zone_id
  api_domain_name                = local.api_domain

  create_www_redirect            = var.create_www_redirect
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  name_prefix             = local.name_prefix
  vpc_id                  = module.vpc.vpc_id
  database_subnet_ids     = module.vpc.database_subnet_ids
  public_subnet_ids       = module.vpc.public_subnet_ids
  app_security_group_ids  = [module.backend.ecs_security_group_id]

  db_name                 = var.db_name
  db_username             = var.db_username
  db_instance_class       = var.db_instance_class
  db_allocated_storage    = var.db_allocated_storage
  db_max_allocated_storage = var.db_max_allocated_storage

  skip_final_snapshot     = var.db_skip_final_snapshot
  deletion_protection     = var.db_deletion_protection
  backup_retention_period = var.db_backup_retention_period
  multi_az                = var.db_multi_az
  apply_immediately       = var.db_apply_immediately

  create_cloudwatch_alarms = var.create_db_cloudwatch_alarms
  cloudwatch_alarm_actions = var.cloudwatch_alarm_actions
  publicly_accessible     = var.db_publicly_accessible
  bastion_security_group_id = var.enable_bastion ? module.bastion[0].bastion_security_group_id : null
}

# RDS Proxy Module (conditional)
module "rds_proxy" {
  source = "./modules/rds-proxy"
  count  = var.enable_rds_proxy ? 1 : 0

  name_prefix             = local.name_prefix
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.private_subnet_ids
  app_security_group_ids  = [module.backend.ecs_security_group_id]
  db_credentials_secret_arn = module.rds.db_credentials_secret_arn
  db_instance_identifier  = module.rds.db_instance_identifier
  aws_region              = var.aws_region

  debug_logging           = var.rds_proxy_debug_logging
  idle_client_timeout     = var.rds_proxy_idle_client_timeout
  require_tls             = var.rds_proxy_require_tls
  connection_borrow_timeout = var.rds_proxy_connection_borrow_timeout
  max_connections_percent = var.rds_proxy_max_connections_percent
  max_idle_connections_percent = var.rds_proxy_max_idle_connections_percent
}

# Bastion Host Module (conditional)
module "bastion" {
  source = "./modules/bastion"
  count  = var.enable_bastion ? 1 : 0

  name_prefix             = local.name_prefix
  vpc_id                  = module.vpc.vpc_id
  subnet_id               = module.vpc.public_subnet_ids[0]
  instance_type           = var.bastion_instance_type
  key_name                = var.bastion_key_name
  allowed_ssh_cidr_blocks = var.bastion_allowed_ssh_cidr_blocks
  rds_proxy_sg_id         = var.enable_rds_proxy ? module.rds_proxy[0].proxy_security_group_id : null
}

# Backend ECS Module
module "backend" {
  source = "./modules/ecs"

  name_prefix              = "${local.name_prefix}-backend"
  vpc_id                   = module.vpc.vpc_id
  public_subnet_ids        = module.vpc.public_subnet_ids
  private_subnet_ids       = module.vpc.private_subnet_ids
  aws_region               = var.aws_region

  container_image          = var.backend_container_image
  container_port           = var.backend_container_port
  health_check_path        = var.backend_health_check_path

  task_cpu                 = var.backend_task_cpu
  task_memory              = var.backend_task_memory
  desired_count            = var.backend_desired_count

  enable_deletion_protection = var.enable_deletion_protection
  certificate_arn          = local.use_custom_domain ? module.dns[0].certificate_arn : null

  enable_container_insights = var.enable_container_insights
  log_retention_days       = var.log_retention_days
  enable_execute_command   = var.enable_execute_command

  enable_autoscaling       = var.enable_backend_autoscaling
  min_capacity             = var.backend_min_capacity
  max_capacity             = var.backend_max_capacity
  cpu_target_value         = var.backend_cpu_target_value
  memory_target_value      = var.backend_memory_target_value

  input_bucket_name        = module.s3_buckets.input_bucket_name
  output_bucket_name       = module.s3_buckets.output_bucket_name
  main_bucket_name         = aws_s3_bucket.main.bucket
  cloudfront_domain        = module.cloudfront.cloudfront_domain_name
  mediaconvert_endpoint    = module.mediaconvert.endpoint
  mediaconvert_role_arn    = module.iam.mediaconvert_role_arn
  db_credentials_secret_arn = module.rds.db_credentials_secret_arn
  api_secret_arn           = aws_secretsmanager_secret.api_secret.arn
  emails_enabled           = local.use_ses
  emails_from_email        = var.emails_from_email
  emails_from_name         = var.emails_from_name
  frontend_url             = local.use_custom_domain ? "https://${local.frontend_domain}" : "https://${module.frontend.cloudfront_domain_name}"
}

# Frontend Hosting Module
module "frontend" {
  source = "./modules/frontend"

  name_prefix        = "${local.name_prefix}-frontend"
  bucket_name        = var.frontend_bucket_name != null ? var.frontend_bucket_name : "${local.name_prefix}-frontend"
  force_destroy      = var.force_destroy_buckets != null ? var.force_destroy_buckets : local.environment != "prod"
  enable_versioning  = var.enable_bucket_versioning
  enable_encryption  = var.enable_bucket_encryption
  price_class        = var.cloudfront_price_class
  certificate_arn    = local.use_custom_domain ? module.dns[0].certificate_arn : null
}

# Main S3 Bucket for general storage
resource "aws_s3_bucket" "main" {
  bucket        = local.main_bucket_name
  force_destroy = var.force_destroy_buckets != null ? var.force_destroy_buckets : local.environment != "prod"

  tags = {
    Name = "${local.name_prefix}-main-bucket"
  }
}

resource "aws_s3_bucket_versioning" "main" {
  count = var.enable_bucket_versioning ? 1 : 0

  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  count = var.enable_bucket_encryption ? 1 : 0

  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Random password for API secret key
resource "random_password" "api_secret" {
  count   = var.api_secret_key == null ? 1 : 0
  length  = 32
  special = true
}

# Store API secret key in Secrets Manager
resource "aws_secretsmanager_secret" "api_secret" {
  name        = "${local.name_prefix}-api-secret"
  description = "Secret key for the API"

  tags = {
    Name = "${local.name_prefix}-api-secret"
  }
}

resource "aws_secretsmanager_secret_version" "api_secret" {
  secret_id     = aws_secretsmanager_secret.api_secret.id
  secret_string = jsonencode({
    SECRET_KEY = local.api_secret_key
  })
}

# SES Configuration
resource "aws_ses_domain_identity" "main" {
  count  = local.use_ses ? 1 : 0
  domain = local.ses_domain
}

resource "aws_ses_domain_dkim" "main" {
  count  = local.use_ses ? 1 : 0
  domain = aws_ses_domain_identity.main[0].domain
}

resource "aws_route53_record" "ses_verification" {
  count   = local.use_ses && local.use_custom_domain ? 1 : 0
  zone_id = var.zone_id
  name    = "_amazonses.${aws_ses_domain_identity.main[0].domain}"
  type    = "TXT"
  ttl     = "600"
  records = [aws_ses_domain_identity.main[0].verification_token]
}

resource "aws_route53_record" "ses_dkim" {
  count   = local.use_ses && local.use_custom_domain ? 3 : 0
  zone_id = var.zone_id
  name    = "${aws_ses_domain_dkim.main[0].dkim_tokens[count.index]}._domainkey.${aws_ses_domain_identity.main[0].domain}"
  type    = "CNAME"
  ttl     = "600"
  records = ["${aws_ses_domain_dkim.main[0].dkim_tokens[count.index]}.dkim.amazonses.com"]
}
