variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "create_certificate" {
  description = "Whether to create an ACM certificate"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Domain name for the certificate"
  type        = string
  default     = null
}

variable "subject_alternative_names" {
  description = "Subject alternative names for the certificate"
  type        = list(string)
  default     = []
}

variable "zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
  default     = null
}

variable "frontend_domain_name" {
  description = "Domain name for the frontend"
  type        = string
  default     = null
}

variable "frontend_cloudfront_domain_name" {
  description = "CloudFront domain name for the frontend"
  type        = string
  default     = null
}

variable "frontend_cloudfront_zone_id" {
  description = "CloudFront hosted zone ID for the frontend"
  type        = string
  default     = null
}

variable "backend_domain_name" {
  description = "Domain name for the backend"
  type        = string
  default     = null
}

variable "backend_alb_dns_name" {
  description = "ALB DNS name for the backend"
  type        = string
  default     = null
}

variable "backend_alb_zone_id" {
  description = "ALB hosted zone ID for the backend"
  type        = string
  default     = null
}

variable "api_domain_name" {
  description = "Domain name for the API"
  type        = string
  default     = null
}

variable "create_www_redirect" {
  description = "Whether to create a www redirect"
  type        = bool
  default     = true
}
