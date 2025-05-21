output "mediaconvert_role_arn" {
  description = "The ARN of the IAM role for MediaConvert"
  value       = aws_iam_role.mediaconvert_role.arn
}

output "mediaconvert_role_name" {
  description = "The name of the IAM role for MediaConvert"
  value       = aws_iam_role.mediaconvert_role.name
}
