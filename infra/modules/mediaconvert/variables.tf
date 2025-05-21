variable "name_prefix" {
  description = "Prefix to use for resource names"
  type        = string
}

variable "mediaconvert_role_arn" {
  description = "The ARN of the IAM role for MediaConvert"
  type        = string
}

variable "queue_priority" {
  description = "Priority for the MediaConvert queue"
  type        = number
  default     = 0
}
