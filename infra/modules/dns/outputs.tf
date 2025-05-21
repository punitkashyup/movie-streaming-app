output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = var.create_certificate ? aws_acm_certificate.main[0].arn : null
}

output "certificate_domain_validation_options" {
  description = "Domain validation options for the certificate"
  value       = var.create_certificate ? aws_acm_certificate.main[0].domain_validation_options : null
}

output "certificate_status" {
  description = "Status of the certificate"
  value       = var.create_certificate ? aws_acm_certificate.main[0].status : null
}

output "frontend_dns_name" {
  description = "DNS name for the frontend"
  value       = var.zone_id != null && var.frontend_domain_name != null ? var.frontend_domain_name : null
}

output "backend_dns_name" {
  description = "DNS name for the backend"
  value       = var.zone_id != null && var.backend_domain_name != null ? var.backend_domain_name : null
}

output "api_dns_name" {
  description = "DNS name for the API"
  value       = var.zone_id != null && var.api_domain_name != null ? var.api_domain_name : null
}
