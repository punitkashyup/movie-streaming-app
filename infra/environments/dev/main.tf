terraform {
  required_version = ">= 1.0.0"

  backend "s3" {
    bucket         = "movie-streaming-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "movie-streaming-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "dev"
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}

module "movie_streaming" {
  source = "../../"

  # General settings
  aws_region          = var.aws_region
  project_name        = var.project_name
  remote_state_bucket = var.remote_state_bucket
  tags                = var.tags

  # Domain settings
  domain_name         = var.domain_name
  zone_id             = var.zone_id

  # VPC settings
  vpc_cidr              = var.vpc_cidr
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs
  availability_zones    = var.availability_zones
  create_nat_gateway    = var.create_nat_gateway
  enable_vpc_flow_logs  = var.enable_vpc_flow_logs

  # S3 settings
  input_bucket_name_override  = var.input_bucket_name_override
  output_bucket_name_override = var.output_bucket_name_override
  s3_bucket_name_override     = var.s3_bucket_name_override
  force_destroy_buckets       = var.force_destroy_buckets
  enable_bucket_versioning    = var.enable_bucket_versioning
  enable_bucket_encryption    = var.enable_bucket_encryption

  # CloudFront settings
  cloudfront_price_class    = var.cloudfront_price_class
  cloudfront_allowed_origins = var.cloudfront_allowed_origins

  # MediaConvert settings
  mediaconvert_queue_priority = var.mediaconvert_queue_priority

  # RDS settings
  db_name                  = var.db_name
  db_username              = var.db_username
  db_instance_class        = var.db_instance_class
  db_allocated_storage     = var.db_allocated_storage
  db_max_allocated_storage = var.db_max_allocated_storage
  db_skip_final_snapshot   = var.db_skip_final_snapshot
  db_deletion_protection   = var.db_deletion_protection
  db_backup_retention_period = var.db_backup_retention_period
  db_multi_az              = var.db_multi_az
  db_apply_immediately     = var.db_apply_immediately
  create_db_cloudwatch_alarms = var.create_db_cloudwatch_alarms
  db_publicly_accessible   = var.db_publicly_accessible

  # RDS Proxy settings
  enable_rds_proxy                    = var.enable_rds_proxy
  rds_proxy_debug_logging             = var.rds_proxy_debug_logging
  rds_proxy_idle_client_timeout       = var.rds_proxy_idle_client_timeout
  rds_proxy_require_tls               = var.rds_proxy_require_tls
  rds_proxy_connection_borrow_timeout = var.rds_proxy_connection_borrow_timeout
  rds_proxy_max_connections_percent   = var.rds_proxy_max_connections_percent
  rds_proxy_max_idle_connections_percent = var.rds_proxy_max_idle_connections_percent

  # Bastion Host settings
  enable_bastion                    = var.enable_bastion
  bastion_instance_type             = var.bastion_instance_type
  bastion_key_name                  = var.bastion_key_name
  bastion_allowed_ssh_cidr_blocks   = var.bastion_allowed_ssh_cidr_blocks

  # Backend ECS settings
  backend_container_image   = var.backend_container_image
  backend_container_port    = var.backend_container_port
  backend_health_check_path = var.backend_health_check_path
  backend_task_cpu          = var.backend_task_cpu
  backend_task_memory       = var.backend_task_memory
  backend_desired_count     = var.backend_desired_count
  enable_deletion_protection = var.enable_deletion_protection
  enable_container_insights = var.enable_container_insights
  log_retention_days        = var.log_retention_days
  enable_execute_command    = var.enable_execute_command
  enable_backend_autoscaling = var.enable_backend_autoscaling
  backend_min_capacity      = var.backend_min_capacity
  backend_max_capacity      = var.backend_max_capacity
  backend_cpu_target_value  = var.backend_cpu_target_value
  backend_memory_target_value = var.backend_memory_target_value

  # Email settings
  enable_ses               = var.enable_ses
  emails_from_email        = var.emails_from_email
  emails_from_name         = var.emails_from_name
}
