resource "aws_s3_bucket" "input_bucket" {
  bucket        = var.input_bucket_name
  force_destroy = var.force_destroy

  tags = {
    Name = "${var.name_prefix}-input-bucket"
  }
}

resource "aws_s3_bucket" "output_bucket" {
  bucket        = var.output_bucket_name
  force_destroy = var.force_destroy

  tags = {
    Name = "${var.name_prefix}-output-bucket"
  }
}

# Input bucket configuration
resource "aws_s3_bucket_versioning" "input_versioning" {
  count = var.enable_versioning ? 1 : 0

  bucket = aws_s3_bucket.input_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "input_encryption" {
  count = var.enable_encryption ? 1 : 0

  bucket = aws_s3_bucket.input_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "input_lifecycle" {
  bucket = aws_s3_bucket.input_bucket.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    filter {
      prefix = ""
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Output bucket configuration
resource "aws_s3_bucket_versioning" "output_versioning" {
  count = var.enable_versioning ? 1 : 0

  bucket = aws_s3_bucket.output_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "output_encryption" {
  count = var.enable_encryption ? 1 : 0

  bucket = aws_s3_bucket.output_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "output_lifecycle" {
  bucket = aws_s3_bucket.output_bucket.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    filter {
      prefix = ""
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# CORS configuration for output bucket (needed for HLS streaming)
resource "aws_s3_bucket_cors_configuration" "output_cors" {
  bucket = aws_s3_bucket.output_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
