import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';

const CinematicVideoPlayer = ({ videoUrl, posterUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHls, setIsHls] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const playerContainerRef = useRef(null);

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

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBufferedTime(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('progress', handleProgress);

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
      video.play().catch(err => {
        console.error('Error playing video:', err);
        setError('Failed to play video. Please try again.');
      });
    }

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value) / 100;
    video.volume = newVolume;
    video.muted = newVolume === 0;
    setVolume(newVolume);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
    
    // When entering theater mode, ensure controls are visible
    if (!isTheaterMode) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Hide controls after a delay if video is playing
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleReload = () => {
    const video = videoRef.current;
    
    // Reload the video
    if (isHls && hlsRef.current) {
      hlsRef.current.destroy();
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.load();
    }
    
    setError(null);
    setIsLoading(true);
  };

  return (
    <div 
      className={`cinematic-player ${isTheaterMode ? 'theater-mode' : ''}`}
      ref={playerContainerRef}
    >
      <div 
        className="cinematic-player-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {isLoading && (
          <div className="cinematic-player-loading">
            <div className="cinematic-player-spinner"></div>
            <p className="cinematic-player-loading-text">Loading video...</p>
          </div>
        )}

        {error && (
          <div className="cinematic-player-error">
            <div className="cinematic-player-error-icon">⚠️</div>
            <p className="cinematic-player-error-message">{error}</p>
            <button 
              className="cinematic-player-error-button"
              onClick={handleReload}
            >
              Try Again
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          poster={posterUrl}
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {showControls && (
          <div className={`cinematic-player-controls ${isSeeking ? 'seeking' : ''}`}>
            <div className="cinematic-player-controls-top">
              {title && <h3 className="cinematic-player-title">{title}</h3>}
            </div>
            
            <div className="cinematic-player-progress" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              const video = videoRef.current;
              video.currentTime = pos * duration;
              setCurrentTime(pos * duration);
            }}>
              <div 
                className="cinematic-player-progress-loaded" 
                style={{ width: `${(bufferedTime / duration) * 100 || 0}%` }}
              ></div>
              <div 
                className="cinematic-player-progress-filled" 
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              ></div>
              <div 
                className="cinematic-player-progress-handle" 
                style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={(currentTime / duration) * 100 || 0}
                onChange={handleSeek}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchEnd={handleSeekEnd}
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%', 
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </div>
            
            <div className="cinematic-player-controls-bottom">
              <div className="cinematic-player-controls-left">
                <button
                  className="cinematic-player-button cinematic-player-play-button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                
                <div className="cinematic-player-volume">
                  <button
                    className="cinematic-player-button"
                    onClick={() => {
                      const video = videoRef.current;
                      if (video) {
                        const newMuted = !video.muted;
                        video.muted = newMuted;
                        setVolume(newMuted ? 0 : video.volume);
                      }
                    }}
                    aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                  >
                    {volume === 0 ? (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : volume < 0.5 ? (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>
                  <div className="cinematic-player-volume-slider">
                    <div 
                      className="cinematic-player-volume-filled" 
                      style={{ width: `${volume * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={handleVolumeChange}
                      style={{ 
                        position: 'absolute', 
                        width: '100%', 
                        height: '100%', 
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
                
                <span className="cinematic-player-time">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="cinematic-player-controls-right">
                <button
                  className="cinematic-player-button"
                  onClick={toggleTheaterMode}
                  aria-label={isTheaterMode ? 'Exit Theater Mode' : 'Enter Theater Mode'}
                >
                  {isTheaterMode ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinematicVideoPlayer;
