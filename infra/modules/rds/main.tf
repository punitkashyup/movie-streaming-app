resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet-group"
  subnet_ids = var.publicly_accessible ? var.public_subnet_ids : var.database_subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet-group"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.name_prefix}-db-sg"
  description = "Security group for ${var.name_prefix} database"
  vpc_id      = var.vpc_id

  # Allow connections from application security groups
  ingress {
    description     = "PostgreSQL from application"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.app_security_group_ids
  }

  # Allow connections from anywhere when publicly accessible
  dynamic "ingress" {
    for_each = var.publicly_accessible ? [1] : []
    content {
      description = "PostgreSQL from anywhere (public access)"
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  # Allow connections from bastion host if provided
  dynamic "ingress" {
    for_each = var.bastion_security_group_id != null ? [1] : []
    content {
      description     = "PostgreSQL from bastion host"
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [var.bastion_security_group_id]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-db-sg"
  }
}

resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.name_prefix}-db-credentials"
  description = "Database credentials for ${var.name_prefix}"

  tags = {
    Name = "${var.name_prefix}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.main.address
    port     = 5432
    dbname   = var.db_name
  })
}

resource "aws_db_parameter_group" "main" {
  name   = "${var.name_prefix}-db-parameter-group"
  family = "postgres14"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name = "${var.name_prefix}-db-parameter-group"
  }
}

resource "aws_db_instance" "main" {
  identifier             = "${var.name_prefix}-db"
  engine                 = "postgres"
  engine_version         = var.db_engine_version
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = var.db_max_allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true
  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db_password.result
  port                   = 5432
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name
  publicly_accessible    = var.publicly_accessible
  skip_final_snapshot    = var.skip_final_snapshot
  deletion_protection    = var.deletion_protection
  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"
  multi_az               = var.multi_az
  apply_immediately      = var.apply_immediately

  tags = {
    Name = "${var.name_prefix}-db"
  }
}

# CloudWatch alarms for the database
resource "aws_cloudwatch_metric_alarm" "db_cpu" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.name_prefix}-db-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = var.cloudwatch_alarm_actions
  ok_actions          = var.cloudwatch_ok_actions
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "db_memory" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.name_prefix}-db-freeable-memory"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 1000000000  # 1 GB in bytes
  alarm_description   = "This metric monitors RDS freeable memory"
  alarm_actions       = var.cloudwatch_alarm_actions
  ok_actions          = var.cloudwatch_ok_actions
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "db_storage" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.name_prefix}-db-free-storage-space"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 5000000000  # 5 GB in bytes
  alarm_description   = "This metric monitors RDS free storage space"
  alarm_actions       = var.cloudwatch_alarm_actions
  ok_actions          = var.cloudwatch_ok_actions
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}
