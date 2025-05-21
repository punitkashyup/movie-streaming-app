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

variable "main_bucket_name" {
  description = "Name of the main S3 bucket for general storage"
  type        = string
  default     = ""
}
