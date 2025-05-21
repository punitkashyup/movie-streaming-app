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

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default = {
    Environment = "dev"
  }
}
