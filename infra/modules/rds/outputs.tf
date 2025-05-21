output "db_instance_id" {
  description = "The ID of the RDS instance"
  value       = aws_db_instance.main.id
}

output "db_instance_address" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.main.address
}

output "db_instance_endpoint" {
  description = "The connection endpoint of the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_name" {
  description = "The database name"
  value       = aws_db_instance.main.db_name
}

output "db_instance_username" {
  description = "The master username for the database"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "db_instance_port" {
  description = "The database port"
  value       = aws_db_instance.main.port
}

output "db_security_group_id" {
  description = "The security group ID for the database"
  value       = aws_security_group.db.id
}

output "db_subnet_group_id" {
  description = "The database subnet group ID"
  value       = aws_db_subnet_group.main.id
}

output "db_parameter_group_id" {
  description = "The database parameter group ID"
  value       = aws_db_parameter_group.main.id
}

output "db_credentials_secret_arn" {
  description = "The ARN of the Secrets Manager secret containing database credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "db_connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${aws_db_instance.main.username}:${random_password.db_password.result}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
  sensitive   = true
}

output "db_instance_identifier" {
  description = "The identifier of the RDS instance"
  value       = aws_db_instance.main.identifier
}
