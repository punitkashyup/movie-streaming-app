terraform {
  required_version = ">= 1.0.0"

  backend "s3" {
    bucket         = "movie-streaming-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "movie-streaming-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "prod"
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}

module "movie_streaming" {
  source = "../../"

  aws_region          = var.aws_region
  project_name        = var.project_name
  remote_state_bucket = var.remote_state_bucket
  tags                = var.tags
}
