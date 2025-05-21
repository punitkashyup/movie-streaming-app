import { useState, useEffect } from 'react';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';

const Browse = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovies();
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await movieService.searchMovies(searchQuery);
      setMovies(response.data);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to search movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies
    .filter(movie => !selectedGenre || movie.genre.includes(selectedGenre))
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'year') {
        return b.release_year - a.release_year;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  if (loading && movies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Movies</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="md:w-1/2">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search movies..."
              className="input-field rounded-r-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>
        
        <div className="md:w-1/2 flex gap-2">
          {/* Genre Filter */}
          <select
            className="input-field"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          {/* Sort By */}
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="title">Sort by Title</option>
            <option value="year">Sort by Year</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No movies found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('');
                }}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browse;
