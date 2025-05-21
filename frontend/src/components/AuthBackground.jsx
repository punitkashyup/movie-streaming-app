import React, { useEffect, useState } from 'react';

// Sample movie poster URLs - in a real app, these would come from your API
const SAMPLE_POSTERS = [
  '/images/posters/poster1.jpg',
  '/images/posters/poster2.jpg',
  '/images/posters/poster3.jpg',
  '/images/posters/poster4.jpg',
  '/images/posters/poster5.jpg',
  '/images/posters/poster6.jpg',
  '/images/posters/poster7.jpg',
  '/images/posters/poster8.jpg',
  '/images/posters/poster9.jpg',
  '/images/posters/poster10.jpg',
  '/images/posters/poster11.jpg',
  '/images/posters/poster12.jpg',
  '/images/posters/poster13.jpg',
  '/images/posters/poster14.jpg',
  '/images/posters/poster15.jpg',
  '/images/posters/poster16.jpg',
  '/images/posters/poster17.jpg',
  '/images/posters/poster18.jpg',
  '/images/posters/poster19.jpg',
  '/images/posters/poster20.jpg',
];

// Fallback posters in case the above ones aren't available
const FALLBACK_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1512070679279-8988d32161be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80',
];

const AuthBackground = () => {
  const [posters, setPosters] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Set the posters directly since we've downloaded them
    setPosters(SAMPLE_POSTERS);
    setLoaded(true);
  }, []);

  // Generate a random offset for each poster to create a more dynamic layout
  const getRandomOffset = () => {
    return Math.floor(Math.random() * 20) - 10; // Random value between -10 and 10
  };

  if (!loaded) {
    return null; // Don't render anything until we've determined which posters to use
  }

  return (
    <div className="auth-background">
      <div className="poster-grid">
        {posters.map((poster, index) => (
          <div
            key={index}
            className="poster-item"
            style={{
              transform: `rotate(${getRandomOffset()}deg)`,
              animationDelay: `${index * 0.1}s`
            }}
          >
            <img src={poster} alt="Movie poster" />
          </div>
        ))}
      </div>
      <div className="overlay"></div>
    </div>
  );
};

export default AuthBackground;
