variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "database_subnet_ids" {
  description = "List of database subnet IDs"
  type        = list(string)
}

variable "app_security_group_ids" {
  description = "List of security group IDs for the application"
  type        = list(string)
}

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

variable "db_engine_version" {
  description = "Version of the PostgreSQL engine"
  type        = string
  default     = "14.12"
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

variable "skip_final_snapshot" {
  description = "Whether to skip the final snapshot when deleting the database"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Whether to enable deletion protection for the database"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "multi_az" {
  description = "Whether to enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "apply_immediately" {
  description = "Whether to apply changes immediately or during the next maintenance window"
  type        = bool
  default     = false
}

variable "create_cloudwatch_alarms" {
  description = "Whether to create CloudWatch alarms for the database"
  type        = bool
  default     = false
}

variable "cloudwatch_alarm_actions" {
  description = "List of ARNs to notify when the database alarms trigger"
  type        = list(string)
  default     = []
}

variable "cloudwatch_ok_actions" {
  description = "List of ARNs to notify when the database alarms return to OK state"
  type        = list(string)
  default     = []
}

variable "publicly_accessible" {
  description = "Whether the database should be publicly accessible"
  type        = bool
  default     = false
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs (required when publicly_accessible is true)"
  type        = list(string)
  default     = []
}

variable "bastion_security_group_id" {
  description = "Security group ID of the bastion host (if any)"
  type        = string
  default     = null
}
