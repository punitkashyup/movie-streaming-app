# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.name_prefix} CloudFront distribution"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.name_prefix} distribution"
  default_root_object = "index.html"
  price_class         = var.price_class

  # Origin for S3 bucket
  origin {
    domain_name = var.output_bucket_domain_name
    origin_id   = "S3-${var.output_bucket_name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.output_bucket_name}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Cache behavior for HLS manifest files
  ordered_cache_behavior {
    path_pattern     = "*.m3u8"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.output_bucket_name}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 60  # Short TTL for manifest files
    max_ttl                = 300
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Cache behavior for HLS segment files
  ordered_cache_behavior {
    path_pattern     = "*.ts"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.output_bucket_name}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 86400  # Longer TTL for segment files
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Geo restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL certificate
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.name_prefix}-cloudfront-distribution"
  }
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = var.output_bucket_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "s3:GetObject"
        Effect   = "Allow"
        Resource = "${var.output_bucket_arn}/*"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
      }
    ]
  })
}
