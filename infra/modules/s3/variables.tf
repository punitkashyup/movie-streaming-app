variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "input_bucket_name" {
  description = "Name of the S3 bucket for input videos"
  type        = string
}

variable "output_bucket_name" {
  description = "Name of the S3 bucket for transcoded videos"
  type        = string
}

variable "force_destroy" {
  description = "Whether to force destroy the buckets even if they contain objects"
  type        = bool
  default     = false
}

variable "enable_versioning" {
  description = "Whether to enable versioning on the S3 buckets"
  type        = bool
  default     = true
}

variable "enable_encryption" {
  description = "Whether to enable encryption on the S3 buckets"
  type        = bool
  default     = true
}

variable "allowed_origins" {
  description = "List of allowed origins for CORS in S3"
  type        = list(string)
  default     = ["*"]
}
