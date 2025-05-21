variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for the ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the ECS tasks"
  type        = list(string)
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "container_image" {
  description = "Docker image for the container"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
  default     = 8000
}

variable "health_check_path" {
  description = "Path for health checks"
  type        = string
  default     = "/"
}

variable "task_cpu" {
  description = "CPU units for the task (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory for the task in MiB"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 1
}

variable "enable_deletion_protection" {
  description = "Whether to enable deletion protection for the ALB"
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate for HTTPS"
  type        = string
  default     = null
}

variable "enable_container_insights" {
  description = "Whether to enable Container Insights for the ECS cluster"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 7
}

variable "enable_execute_command" {
  description = "Whether to enable ECS Exec for the tasks"
  type        = bool
  default     = false
}

variable "enable_autoscaling" {
  description = "Whether to enable auto scaling for the ECS service"
  type        = bool
  default     = false
}

variable "min_capacity" {
  description = "Minimum number of tasks for auto scaling"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of tasks for auto scaling"
  type        = number
  default     = 5
}

variable "cpu_target_value" {
  description = "Target CPU utilization percentage for auto scaling"
  type        = number
  default     = 70
}

variable "memory_target_value" {
  description = "Target memory utilization percentage for auto scaling"
  type        = number
  default     = 70
}

variable "input_bucket_name" {
  description = "Name of the S3 bucket for input videos"
  type        = string
}

variable "output_bucket_name" {
  description = "Name of the S3 bucket for transcoded videos"
  type        = string
}

variable "cloudfront_domain" {
  description = "Domain name of the CloudFront distribution"
  type        = string
}

variable "mediaconvert_endpoint" {
  description = "MediaConvert endpoint URL"
  type        = string
}

variable "mediaconvert_role_arn" {
  description = "ARN of the IAM role for MediaConvert"
  type        = string
}

variable "db_credentials_secret_arn" {
  description = "ARN of the Secrets Manager secret containing database credentials"
  type        = string
}

variable "main_bucket_name" {
  description = "Name of the main S3 bucket"
  type        = string
}

variable "api_secret_arn" {
  description = "ARN of the Secrets Manager secret containing the API secret key"
  type        = string
}

variable "emails_enabled" {
  description = "Whether to enable email sending"
  type        = bool
  default     = false
}

variable "emails_from_email" {
  description = "Email address to use as the sender"
  type        = string
  default     = "info@example.com"
}

variable "emails_from_name" {
  description = "Name to use as the sender"
  type        = string
  default     = "Movie Streaming App"
}

variable "frontend_url" {
  description = "URL of the frontend application"
  type        = string
}
