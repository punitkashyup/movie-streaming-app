import React from 'react';
import '../styles/home-skeleton.css';

const HomeSkeletonLoader = () => {
  // Generate skeleton movie cards
  const renderSkeletonCards = (count) => {
    return Array(count).fill().map((_, index) => (
      <div key={index} className="skeleton-card">
        <div className="skeleton-poster"></div>
        <div className="skeleton-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-meta"></div>
          <div className="skeleton-rating"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="home-skeleton">
      {/* Hero Section Skeleton */}
      <div className="hero-skeleton">
        <div className="hero-content-skeleton">
          <div className="hero-text-skeleton">
            <div className="skeleton-heading"></div>
            <div className="skeleton-paragraph"></div>
            <div className="skeleton-paragraph short"></div>
            <div className="skeleton-button"></div>
          </div>
          <div className="hero-image-skeleton">
            <div className="cinema-skeleton">
              <div className="play-button-skeleton">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Movies Section Skeleton */}
      <div className="section-skeleton">
        <div className="section-header-skeleton">
          <div className="skeleton-section-title"></div>
          <div className="skeleton-section-link"></div>
        </div>
        <div className="movie-grid-skeleton">
          {renderSkeletonCards(4)}
        </div>
      </div>

      {/* New Releases Section Skeleton */}
      <div className="section-skeleton">
        <div className="section-header-skeleton">
          <div className="skeleton-section-title"></div>
          <div className="skeleton-section-link"></div>
        </div>
        <div className="movie-grid-skeleton">
          {renderSkeletonCards(4)}
        </div>
      </div>
    </div>
  );
};

export default HomeSkeletonLoader;
