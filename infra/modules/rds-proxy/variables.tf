variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the RDS Proxy"
  type        = list(string)
}

variable "app_security_group_ids" {
  description = "List of security group IDs for the application"
  type        = list(string)
}

variable "bastion_security_group_id" {
  description = "Security group ID for the bastion host (if any)"
  type        = string
  default     = null
}

variable "db_credentials_secret_arn" {
  description = "ARN of the Secrets Manager secret containing database credentials"
  type        = string
}

variable "db_instance_identifier" {
  description = "Identifier of the RDS instance to connect to"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "debug_logging" {
  description = "Whether to enable debug logging for the proxy"
  type        = bool
  default     = false
}

variable "idle_client_timeout" {
  description = "The number of seconds that a connection to the proxy can be inactive before the proxy disconnects it"
  type        = number
  default     = 1800
}

variable "require_tls" {
  description = "Whether to require TLS for connections to the proxy"
  type        = bool
  default     = true
}

variable "connection_borrow_timeout" {
  description = "The number of seconds for a proxy to wait for a connection to become available in the connection pool"
  type        = number
  default     = 120
}

variable "max_connections_percent" {
  description = "The maximum size of the connection pool for each target in a target group"
  type        = number
  default     = 100
}

variable "max_idle_connections_percent" {
  description = "The maximum size of the idle connection pool for each target in a target group"
  type        = number
  default     = 50
}
