output "input_bucket_name" {
  description = "The name of the input S3 bucket"
  value       = aws_s3_bucket.input_bucket.id
}

output "input_bucket_arn" {
  description = "The ARN of the input S3 bucket"
  value       = aws_s3_bucket.input_bucket.arn
}

output "input_bucket_domain_name" {
  description = "The domain name of the input S3 bucket"
  value       = aws_s3_bucket.input_bucket.bucket_regional_domain_name
}

output "output_bucket_name" {
  description = "The name of the output S3 bucket"
  value       = aws_s3_bucket.output_bucket.id
}

output "output_bucket_arn" {
  description = "The ARN of the output S3 bucket"
  value       = aws_s3_bucket.output_bucket.arn
}

output "output_bucket_domain_name" {
  description = "The domain name of the output S3 bucket"
  value       = aws_s3_bucket.output_bucket.bucket_regional_domain_name
}
