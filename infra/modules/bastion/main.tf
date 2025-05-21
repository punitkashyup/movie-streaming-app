resource "aws_security_group" "bastion" {
  name        = "${var.name_prefix}-bastion-sg"
  description = "Security group for bastion host"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH from allowed IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-bastion-sg"
  }
}

resource "aws_instance" "bastion" {
  ami                         = var.ami_id != null ? var.ami_id : data.aws_ami.amazon_linux_2.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  subnet_id                   = var.subnet_id
  associate_public_ip_address = true
  user_data                   = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y postgresql
    EOF

  tags = {
    Name = "${var.name_prefix}-bastion"
  }
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Allow the bastion host to access the RDS Proxy
resource "aws_security_group_rule" "rds_proxy_from_bastion" {
  count                    = var.rds_proxy_sg_id != null ? 1 : 0
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.bastion.id
  security_group_id        = var.rds_proxy_sg_id
  description              = "PostgreSQL from bastion host"
}
