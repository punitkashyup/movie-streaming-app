variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "output_bucket_name" {
  description = "Name of the S3 bucket for transcoded videos"
  type        = string
}

variable "output_bucket_arn" {
  description = "ARN of the S3 bucket for transcoded videos"
  type        = string
}

variable "output_bucket_domain_name" {
  description = "Domain name of the S3 bucket for transcoded videos"
  type        = string
}

variable "price_class" {
  description = "The price class for the CloudFront distribution"
  type        = string
  default     = "PriceClass_100" # Use only North America and Europe
}

variable "allowed_origins" {
  description = "List of allowed origins for CORS in CloudFront"
  type        = list(string)
  default     = ["*"]
}
