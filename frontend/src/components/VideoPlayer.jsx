import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, posterUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHls, setIsHls] = useState(false);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    setIsLoading(true);
    setError(null);

    // Check if the video URL is an HLS stream (.m3u8)
    const isHlsStream = videoUrl.includes('.m3u8');
    setIsHls(isHlsStream);

    // Initialize HLS if needed
    if (isHlsStream && Hls.isSupported()) {
      // Destroy previous HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (isPlaying) {
          video.play().catch(err => {
            console.error('Error playing video:', err);
            setError('Failed to play video. Please try again.');
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS error:', data);
          setError('Error loading video. Please try again later.');
          setIsLoading(false);
        }
      });
    } else if (isHlsStream && video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has built-in HLS support
      video.src = videoUrl;
    } else {
      // Regular video file
      video.src = videoUrl;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      console.error('Video error:', video.error);
      setError('Error loading video. Please try again later.');
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);

      // Clean up HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const seekTime = (e.target.value / 100) * duration;

    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = e.target.value / 100;

    video.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div className="video-player">
      <div
        className="video-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {isLoading && (
          <div className="video-loading">
            <div className="spinner"></div>
            <p>Loading video...</p>
          </div>
        )}

        {error && (
          <div className="video-error">
            <p>{error}</p>
          </div>
        )}

        <video
          ref={videoRef}
          poster={posterUrl}
          onClick={togglePlay}
          playsInline
        />

        {showControls && (
          <div className="video-controls">
            <button
              className="play-button"
              onClick={togglePlay}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>

            <div className="progress-container">
              <input
                type="range"
                className="progress-slider"
                min="0"
                max="100"
                value={(currentTime / duration) * 100 || 0}
                onChange={handleSeek}
              />
              <div className="time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="volume-container">
              <button className="volume-button" onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.muted = !video.muted;
                  setVolume(video.muted ? 0 : video.volume);
                }
              }}>
                {volume === 0 ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
              </button>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
              />
            </div>

            <button
              className="fullscreen-button"
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;

                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  video.requestFullscreen();
                }
              }}
            >
              ⤢
            </button>
          </div>
        )}
      </div>

      {/* Title is now handled by the MovieDetails component */}
    </div>
  );
};

export default VideoPlayer;
