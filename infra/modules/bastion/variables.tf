variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_id" {
  description = "ID of the public subnet to place the bastion host in"
  type        = string
}

variable "allowed_ssh_cidr_blocks" {
  description = "List of CIDR blocks allowed to SSH to the bastion host"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "instance_type" {
  description = "EC2 instance type for the bastion host"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for the bastion host (if not provided, latest Amazon Linux 2 will be used)"
  type        = string
  default     = null
}

variable "key_name" {
  description = "Name of the SSH key pair to use for the bastion host"
  type        = string
}

variable "rds_proxy_sg_id" {
  description = "Security group ID of the RDS Proxy (if any)"
  type        = string
  default     = null
}
