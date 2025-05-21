resource "aws_iam_role" "rds_proxy_role" {
  name = "${var.name_prefix}-rds-proxy-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name = "${var.name_prefix}-rds-proxy-role"
  }
}

resource "aws_iam_policy" "rds_proxy_policy" {
  name        = "${var.name_prefix}-rds-proxy-policy"
  description = "Policy for RDS Proxy to access Secrets Manager"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [var.db_credentials_secret_arn]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = ["*"]
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.${var.aws_region}.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_proxy_policy_attachment" {
  role       = aws_iam_role.rds_proxy_role.name
  policy_arn = aws_iam_policy.rds_proxy_policy.arn
}

resource "aws_security_group" "rds_proxy_sg" {
  name        = "${var.name_prefix}-rds-proxy-sg"
  description = "Security group for RDS Proxy"
  vpc_id      = var.vpc_id
  
  # Allow inbound traffic from the application security groups
  ingress {
    description     = "PostgreSQL from application"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.app_security_group_ids
  }
  
  # Allow inbound traffic from the bastion host if provided
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
    Name = "${var.name_prefix}-rds-proxy-sg"
  }
}

resource "aws_db_proxy" "main" {
  name                   = "${var.name_prefix}-proxy"
  debug_logging          = var.debug_logging
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = var.idle_client_timeout
  require_tls            = var.require_tls
  role_arn               = aws_iam_role.rds_proxy_role.arn
  vpc_security_group_ids = [aws_security_group.rds_proxy_sg.id]
  vpc_subnet_ids         = var.subnet_ids
  
  auth {
    auth_scheme = "SECRETS"
    iam_auth    = "DISABLED"
    secret_arn  = var.db_credentials_secret_arn
  }
  
  tags = {
    Name = "${var.name_prefix}-proxy"
  }
}

resource "aws_db_proxy_default_target_group" "main" {
  db_proxy_name = aws_db_proxy.main.name
  
  connection_pool_config {
    connection_borrow_timeout    = var.connection_borrow_timeout
    max_connections_percent      = var.max_connections_percent
    max_idle_connections_percent = var.max_idle_connections_percent
  }
}

resource "aws_db_proxy_target" "main" {
  db_instance_identifier = var.db_instance_identifier
  db_proxy_name          = aws_db_proxy.main.name
  target_group_name      = aws_db_proxy_default_target_group.main.name
}
