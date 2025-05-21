output "endpoint" {
  description = "The MediaConvert endpoint URL"
  value       = local.mediaconvert_endpoint
}

output "queue_arn" {
  description = "The ARN of the MediaConvert queue"
  value       = aws_media_convert_queue.main.arn
}

output "preset_1080p_path" {
  description = "The path to the 1080p preset JSON file"
  value       = local_file.preset_1080p_json.filename
}

output "preset_720p_path" {
  description = "The path to the 720p preset JSON file"
  value       = local_file.preset_720p_json.filename
}

output "preset_480p_path" {
  description = "The path to the 480p preset JSON file"
  value       = local_file.preset_480p_json.filename
}
