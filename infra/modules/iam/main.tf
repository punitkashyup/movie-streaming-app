# IAM Role for MediaConvert
resource "aws_iam_role" "mediaconvert_role" {
  name = "${var.name_prefix}-mediaconvert-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "mediaconvert.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.name_prefix}-mediaconvert-role"
  }
}

# Policy for MediaConvert to access S3 buckets
resource "aws_iam_policy" "mediaconvert_s3_access" {
  name        = "${var.name_prefix}-mediaconvert-s3-access"
  description = "Policy for MediaConvert to access S3 buckets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Effect = "Allow"
        Resource = concat(
          ["arn:aws:s3:::${var.input_bucket_name}/*"],
          var.main_bucket_name != "" ? ["arn:aws:s3:::${var.main_bucket_name}/*"] : []
        )
      },
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:s3:::${var.output_bucket_name}",
          "arn:aws:s3:::${var.output_bucket_name}/*"
        ]
      }
    ]
  })
}

# Attach the policy to the role
resource "aws_iam_role_policy_attachment" "mediaconvert_s3_access_attachment" {
  role       = aws_iam_role.mediaconvert_role.name
  policy_arn = aws_iam_policy.mediaconvert_s3_access.arn
}
