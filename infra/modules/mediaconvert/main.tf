# Get the MediaConvert endpoint for the current region
# Using local-exec to get the endpoint since AWS provider doesn't have a data source for it
data "aws_region" "current" {}

locals {
  mediaconvert_endpoint = "https://${data.aws_region.current.name}.mediaconvert.amazonaws.com"
}

# MediaConvert Queue
resource "aws_media_convert_queue" "main" {
  name     = "${var.name_prefix}-queue"
  status   = "ACTIVE"
  pricing_plan = "ON_DEMAND"

  tags = {
    Name = "${var.name_prefix}-queue"
  }
}

# For MediaConvert presets, we'll use a null_resource with local-exec to create them
# since the AWS provider doesn't have a resource for MediaConvert presets

# Create a JSON file for the 1080p preset
resource "local_file" "preset_1080p_json" {
  content = jsonencode({
    name        = "${var.name_prefix}-preset-1080p"
    description = "1080p HLS preset"
    category    = "HLS"
    settings = {
      VideoDescription = {
        Width          = 1920
        Height         = 1080
        CodecSettings = {
          Codec = "H_264"
          H264Settings = {
            RateControlMode = "QVBR"
            SceneChangeDetect = "ENABLED"
            QualityTuningLevel = "HIGH"
            MaxBitrate = 6000000
            QvbrSettings = {
              QvbrQualityLevel = 8
            }
          }
        }
      }
      AudioDescriptions = [
        {
          CodecSettings = {
            Codec = "AAC"
            AacSettings = {
              Bitrate = 128000
              CodingMode = "CODING_MODE_2_0"
              SampleRate = 48000
            }
          }
        }
      ]
      ContainerSettings = {
        Container = "M3U8"
        M3u8Settings = {}
      }
    }
  })
  filename = "${path.module}/preset_1080p.json"
}

# Create a JSON file for the 720p preset
resource "local_file" "preset_720p_json" {
  content = jsonencode({
    name        = "${var.name_prefix}-preset-720p"
    description = "720p HLS preset"
    category    = "HLS"
    settings = {
      VideoDescription = {
        Width          = 1280
        Height         = 720
        CodecSettings = {
          Codec = "H_264"
          H264Settings = {
            RateControlMode = "QVBR"
            SceneChangeDetect = "ENABLED"
            QualityTuningLevel = "HIGH"
            MaxBitrate = 3000000
            QvbrSettings = {
              QvbrQualityLevel = 7
            }
          }
        }
      }
      AudioDescriptions = [
        {
          CodecSettings = {
            Codec = "AAC"
            AacSettings = {
              Bitrate = 96000
              CodingMode = "CODING_MODE_2_0"
              SampleRate = 48000
            }
          }
        }
      ]
      ContainerSettings = {
        Container = "M3U8"
        M3u8Settings = {}
      }
    }
  })
  filename = "${path.module}/preset_720p.json"
}

# Create a JSON file for the 480p preset
resource "local_file" "preset_480p_json" {
  content = jsonencode({
    name        = "${var.name_prefix}-preset-480p"
    description = "480p HLS preset"
    category    = "HLS"
    settings = {
      VideoDescription = {
        Width          = 854
        Height         = 480
        CodecSettings = {
          Codec = "H_264"
          H264Settings = {
            RateControlMode = "QVBR"
            SceneChangeDetect = "ENABLED"
            QualityTuningLevel = "HIGH"
            MaxBitrate = 1500000
            QvbrSettings = {
              QvbrQualityLevel = 7
            }
          }
        }
      }
      AudioDescriptions = [
        {
          CodecSettings = {
            Codec = "AAC"
            AacSettings = {
              Bitrate = 64000
              CodingMode = "CODING_MODE_2_0"
              SampleRate = 48000
            }
          }
        }
      ]
      ContainerSettings = {
        Container = "M3U8"
        M3u8Settings = {}
      }
    }
  })
  filename = "${path.module}/preset_480p.json"
}
