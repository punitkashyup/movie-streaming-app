import os
import logging
import requests
from typing import Dict, Any, Optional, List

# Set up logging
logger = logging.getLogger(__name__)

# TMDB API configuration
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

def search_movie(title: str) -> List[Dict[str, Any]]:
    """
    Search for movies by title using TMDB API
    Returns a list of movie results
    """
    if not TMDB_API_KEY:
        logger.warning("TMDB_API_KEY not set. Using mock data.")
        return _get_mock_search_results(title)
    
    try:
        url = f"{TMDB_BASE_URL}/search/movie"
        params = {
            "api_key": TMDB_API_KEY,
            "query": title,
            "language": "en-US",
            "page": 1,
            "include_adult": False
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        results = data.get("results", [])
        
        # Format the results
        formatted_results = []
        for movie in results[:5]:  # Limit to top 5 results
            formatted_results.append({
                "tmdb_id": movie.get("id"),
                "title": movie.get("title"),
                "release_year": _extract_year(movie.get("release_date", "")),
                "poster_path": _get_poster_url(movie.get("poster_path")),
                "overview": movie.get("overview"),
                "vote_average": movie.get("vote_average", 0)
            })
        
        return formatted_results
    
    except Exception as e:
        logger.error(f"Error searching for movie: {str(e)}")
        return _get_mock_search_results(title)

def get_movie_details(movie_id: int) -> Optional[Dict[str, Any]]:
    """
    Get detailed information about a movie by its TMDB ID
    """
    if not TMDB_API_KEY:
        logger.warning("TMDB_API_KEY not set. Using mock data.")
        return _get_mock_movie_details(movie_id)
    
    try:
        url = f"{TMDB_BASE_URL}/movie/{movie_id}"
        params = {
            "api_key": TMDB_API_KEY,
            "language": "en-US",
            "append_to_response": "credits"
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        movie = response.json()
        
        # Extract director(s)
        directors = []
        if "credits" in movie and "crew" in movie["credits"]:
            directors = [
                crew["name"] for crew in movie["credits"]["crew"]
                if crew["job"] == "Director"
            ]
        
        # Extract cast
        cast = []
        if "credits" in movie and "cast" in movie["credits"]:
            cast = [actor["name"] for actor in movie["credits"]["cast"][:5]]
        
        # Extract genres
        genres = [genre["name"] for genre in movie.get("genres", [])]
        
        return {
            "title": movie.get("title"),
            "description": movie.get("overview"),
            "release_year": _extract_year(movie.get("release_date", "")),
            "duration": movie.get("runtime", 0),
            "genre": ", ".join(genres),
            "director": ", ".join(directors),
            "cast": ", ".join(cast),
            "poster_url": _get_poster_url(movie.get("poster_path")),
            "rating": movie.get("vote_average", 0)
        }
    
    except Exception as e:
        logger.error(f"Error getting movie details: {str(e)}")
        return _get_mock_movie_details(movie_id)

def _extract_year(date_str: str) -> int:
    """Extract year from a date string (YYYY-MM-DD)"""
    try:
        if date_str and len(date_str) >= 4:
            return int(date_str[:4])
        return 0
    except ValueError:
        return 0

def _get_poster_url(poster_path: Optional[str]) -> Optional[str]:
    """Get full poster URL from poster path"""
    if not poster_path:
        return None
    return f"{TMDB_IMAGE_BASE_URL}{poster_path}"

def _get_mock_search_results(title: str) -> List[Dict[str, Any]]:
    """Return mock search results for testing without API key"""
    return [
        {
            "tmdb_id": 1,
            "title": f"{title} - The Movie",
            "release_year": 2023,
            "poster_path": None,
            "overview": "This is a mock movie description for testing purposes.",
            "vote_average": 7.5
        },
        {
            "tmdb_id": 2,
            "title": f"{title} 2: The Sequel",
            "release_year": 2021,
            "poster_path": None,
            "overview": "The exciting sequel to the original movie.",
            "vote_average": 6.8
        }
    ]

def _get_mock_movie_details(movie_id: int) -> Dict[str, Any]:
    """Return mock movie details for testing without API key"""
    return {
        "title": f"Mock Movie {movie_id}",
        "description": "This is a mock movie description for testing purposes.",
        "release_year": 2023,
        "duration": 120,
        "genre": "Action, Adventure",
        "director": "John Director",
        "cast": "Actor One, Actor Two, Actor Three",
        "poster_url": None,
        "rating": 7.5
    }
