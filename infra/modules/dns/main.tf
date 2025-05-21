resource "aws_acm_certificate" "main" {
  count             = var.create_certificate ? 1 : 0
  domain_name       = var.domain_name
  validation_method = "DNS"
  subject_alternative_names = var.subject_alternative_names

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.name_prefix}-certificate"
  }
}

data "aws_route53_zone" "main" {
  count = var.create_certificate && var.zone_id != null ? 1 : 0
  zone_id = var.zone_id
}

resource "aws_route53_record" "certificate_validation" {
  for_each = var.create_certificate && var.zone_id != null ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main[0].zone_id
}

resource "aws_acm_certificate_validation" "main" {
  count                   = var.create_certificate && var.zone_id != null ? 1 : 0
  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}

# Frontend DNS records
resource "aws_route53_record" "frontend" {
  count   = var.zone_id != null && var.frontend_domain_name != null && var.frontend_cloudfront_domain_name != null ? 1 : 0
  zone_id = var.zone_id
  name    = var.frontend_domain_name
  type    = "A"

  alias {
    name                   = var.frontend_cloudfront_domain_name
    zone_id                = var.frontend_cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "frontend_www" {
  count   = var.zone_id != null && var.frontend_domain_name != null && var.frontend_cloudfront_domain_name != null && var.create_www_redirect ? 1 : 0
  zone_id = var.zone_id
  name    = "www.${var.frontend_domain_name}"
  type    = "A"

  alias {
    name                   = var.frontend_cloudfront_domain_name
    zone_id                = var.frontend_cloudfront_zone_id
    evaluate_target_health = false
  }
}

# Backend DNS records
resource "aws_route53_record" "backend" {
  count   = var.zone_id != null && var.backend_domain_name != null && var.backend_alb_dns_name != null ? 1 : 0
  zone_id = var.zone_id
  name    = var.backend_domain_name
  type    = "A"

  alias {
    name                   = var.backend_alb_dns_name
    zone_id                = var.backend_alb_zone_id
    evaluate_target_health = true
  }
}

# API DNS records
resource "aws_route53_record" "api" {
  count   = var.zone_id != null && var.api_domain_name != null && var.backend_alb_dns_name != null ? 1 : 0
  zone_id = var.zone_id
  name    = var.api_domain_name
  type    = "A"

  alias {
    name                   = var.backend_alb_dns_name
    zone_id                = var.backend_alb_zone_id
    evaluate_target_health = true
  }
}
