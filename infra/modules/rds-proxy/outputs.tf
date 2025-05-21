output "proxy_endpoint" {
  description = "The endpoint of the RDS Proxy"
  value       = aws_db_proxy.main.endpoint
}

output "proxy_arn" {
  description = "The ARN of the RDS Proxy"
  value       = aws_db_proxy.main.arn
}

output "proxy_security_group_id" {
  description = "The ID of the security group for the RDS Proxy"
  value       = aws_security_group.rds_proxy_sg.id
}
