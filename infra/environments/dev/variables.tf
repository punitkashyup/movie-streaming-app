variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "movie-streaming"
}

variable "remote_state_bucket" {
  description = "The S3 bucket for storing terraform remote state"
  type        = string
  default     = "movie-streaming-terraform-state"
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = null
}

variable "zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
  default     = null
}

# VPC Variables
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for the public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for the private subnets"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for the database subnets"
  type        = list(string)
  default     = ["10.0.5.0/24", "10.0.6.0/24"]
}

variable "availability_zones" {
  description = "Availability zones to use for the subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "create_nat_gateway" {
  description = "Whether to create a NAT Gateway for private subnet internet access"
  type        = bool
  default     = true
}

variable "enable_vpc_flow_logs" {
  description = "Whether to enable VPC flow logs"
  type        = bool
  default     = false
}

# S3 Variables
variable "input_bucket_name_override" {
  description = "Override the default input bucket name"
  type        = string
  default     = null
}

variable "output_bucket_name_override" {
  description = "Override the default output bucket name"
  type        = string
  default     = null
}

variable "force_destroy_buckets" {
  description = "Whether to force destroy the buckets even if they contain objects"
  type        = bool
  default     = false
}

variable "enable_bucket_versioning" {
  description = "Whether to enable versioning on the S3 buckets"
  type        = bool
  default     = true
}

variable "enable_bucket_encryption" {
  description = "Whether to enable encryption on the S3 buckets"
  type        = bool
  default     = true
}

# CloudFront Variables
variable "cloudfront_price_class" {
  description = "The price class for the CloudFront distribution"
  type        = string
  default     = "PriceClass_100" # Use only North America and Europe
}

variable "cloudfront_allowed_origins" {
  description = "List of allowed origins for CORS in CloudFront"
  type        = list(string)
  default     = ["*"]
}

# MediaConvert Variables
variable "mediaconvert_queue_priority" {
  description = "Priority for the MediaConvert queue"
  type        = number
  default     = 0
}

# RDS Variables
variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "moviedb"
}

variable "db_username" {
  description = "Username for the database"
  type        = string
  default     = "movieadmin"
}

variable "db_instance_class" {
  description = "Instance class for the database"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for the database in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for the database in GB"
  type        = number
  default     = 100
}

variable "db_skip_final_snapshot" {
  description = "Whether to skip the final snapshot when deleting the database"
  type        = bool
  default     = true
}

variable "db_deletion_protection" {
  description = "Whether to enable deletion protection for the database"
  type        = bool
  default     = false
}

variable "db_backup_retention_period" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "db_multi_az" {
  description = "Whether to enable Multi-AZ deployment for the database"
  type        = bool
  default     = false
}

variable "db_apply_immediately" {
  description = "Whether to apply changes immediately to the database"
  type        = bool
  default     = true
}

variable "create_db_cloudwatch_alarms" {
  description = "Whether to create CloudWatch alarms for the database"
  type        = bool
  default     = false
}

variable "db_publicly_accessible" {
  description = "Whether the database should be publicly accessible"
  type        = bool
  default     = false
}

# RDS Proxy Variables
variable "enable_rds_proxy" {
  description = "Whether to enable RDS Proxy"
  type        = bool
  default     = false
}

variable "rds_proxy_debug_logging" {
  description = "Whether to enable debug logging for the RDS Proxy"
  type        = bool
  default     = false
}

variable "rds_proxy_idle_client_timeout" {
  description = "The number of seconds that a connection to the proxy can be inactive before the proxy disconnects it"
  type        = number
  default     = 1800
}

variable "rds_proxy_require_tls" {
  description = "Whether to require TLS for connections to the proxy"
  type        = bool
  default     = true
}

variable "rds_proxy_connection_borrow_timeout" {
  description = "The number of seconds for a proxy to wait for a connection to become available in the connection pool"
  type        = number
  default     = 120
}

variable "rds_proxy_max_connections_percent" {
  description = "The maximum size of the connection pool for each target in a target group"
  type        = number
  default     = 100
}

variable "rds_proxy_max_idle_connections_percent" {
  description = "The maximum size of the idle connection pool for each target in a target group"
  type        = number
  default     = 50
}

# Bastion Host Variables
variable "enable_bastion" {
  description = "Whether to create a bastion host"
  type        = bool
  default     = false
}

variable "bastion_instance_type" {
  description = "EC2 instance type for the bastion host"
  type        = string
  default     = "t3.micro"
}

variable "bastion_key_name" {
  description = "Name of the SSH key pair to use for the bastion host"
  type        = string
  default     = null
}

variable "bastion_allowed_ssh_cidr_blocks" {
  description = "List of CIDR blocks allowed to SSH to the bastion host"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Backend ECS Variables
variable "backend_container_image" {
  description = "Docker image for the backend container"
  type        = string
  default     = "public.ecr.aws/nginx/nginx:latest"
}

variable "backend_container_port" {
  description = "Port exposed by the backend container"
  type        = number
  default     = 8000
}

variable "backend_health_check_path" {
  description = "Path for backend health checks"
  type        = string
  default     = "/"
}

variable "backend_task_cpu" {
  description = "CPU units for the backend task (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "backend_task_memory" {
  description = "Memory for the backend task in MiB"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 1
}

variable "enable_deletion_protection" {
  description = "Whether to enable deletion protection for the load balancer"
  type        = bool
  default     = false
}

variable "enable_container_insights" {
  description = "Whether to enable Container Insights for the ECS cluster"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 7
}

variable "enable_execute_command" {
  description = "Whether to enable ECS Exec for the tasks"
  type        = bool
  default     = true
}

variable "enable_backend_autoscaling" {
  description = "Whether to enable autoscaling for the backend service"
  type        = bool
  default     = false
}

variable "backend_min_capacity" {
  description = "Minimum number of tasks for autoscaling"
  type        = number
  default     = 1
}

variable "backend_max_capacity" {
  description = "Maximum number of tasks for autoscaling"
  type        = number
  default     = 3
}

variable "backend_cpu_target_value" {
  description = "Target CPU utilization percentage for autoscaling"
  type        = number
  default     = 70
}

variable "backend_memory_target_value" {
  description = "Target memory utilization percentage for autoscaling"
  type        = number
  default     = 70
}

# Email Configuration
variable "enable_ses" {
  description = "Whether to enable SES for email sending"
  type        = bool
  default     = false
}

variable "emails_from_email" {
  description = "Email address to send emails from"
  type        = string
  default     = "info@example.com"
}

variable "emails_from_name" {
  description = "Name to display as the sender of emails"
  type        = string
  default     = "Movie Streaming App"
}

# Main S3 Bucket
variable "s3_bucket_name_override" {
  description = "Override the default main S3 bucket name"
  type        = string
  default     = null
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default = {
    Environment = "dev"
  }
}
