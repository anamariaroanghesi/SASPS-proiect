import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import RatingModal from '../components/RatingModal';
import { fetchMovies, fetchWatchlist, addToWatchlist, removeFromWatchlist, addToViewed } from '../api';
import './HomePage.css';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingMovie, setRatingMovie] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [moviesData, watchlistData] = await Promise.all([
        fetchMovies(),
        fetchWatchlist().catch(() => []) // Watchlist may fail if not implemented
      ]);
      setMovies(moviesData);
      setWatchlist(watchlistData);
      setError(null);
    } catch (err) {
      setError('Failed to load movies. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (movieId) => {
    try {
      await addToWatchlist(movieId);
      const movie = movies.find(m => m.id === movieId);
      if (movie) {
        setWatchlist([...watchlist, movie]);
      }
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      await removeFromWatchlist(movieId);
      setWatchlist(watchlist.filter(m => m.id !== movieId));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const handleMarkViewed = (movie) => {
    setRatingMovie(movie);
  };

  const handleSubmitRating = async (movieId, rating) => {
    try {
      await addToViewed(movieId, rating);
      // Optionally remove from watchlist after viewing
      setWatchlist(watchlist.filter(m => m.id !== movieId));
    } catch (err) {
      console.error('Failed to mark as viewed:', err);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const title = movie.title || movie.name || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const watchlistIds = new Set(watchlist.map(m => m.id));

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Discover Movies</h1>
          <p className="header-subtitle">Explore our collection of {movies.length} films</p>
        </div>
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery}
          placeholder="Search by title..."
        />
      </header>

      {filteredMovies.length === 0 ? (
        <div className="no-results">
          <p>No movies found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="movies-grid">
          {filteredMovies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onMarkViewed={handleMarkViewed}
              isInWatchlist={watchlistIds.has(movie.id)}
            />
          ))}
        </div>
      )}

      {ratingMovie && (
        <RatingModal
          movie={ratingMovie}
          onSubmit={handleSubmitRating}
          onClose={() => setRatingMovie(null)}
        />
      )}
    </div>
  );
}

