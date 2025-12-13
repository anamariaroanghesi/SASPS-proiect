import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import RatingModal from '../components/RatingModal';
import { fetchWatchlist, removeFromWatchlist, addToViewed } from '../api';
import './WatchlistPage.css';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingMovie, setRatingMovie] = useState(null);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const data = await fetchWatchlist();
      setWatchlist(data);
      setError(null);
    } catch (err) {
      setError('Failed to load watchlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (movieId) => {
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
      // Remove from watchlist after marking as viewed
      setWatchlist(watchlist.filter(m => m.id !== movieId));
    } catch (err) {
      console.error('Failed to mark as viewed:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>My Watchlist</h1>
          <p className="header-subtitle">
            {watchlist.length === 0 
              ? "You haven't added any movies yet" 
              : `${watchlist.length} movie${watchlist.length !== 1 ? 's' : ''} to watch`}
          </p>
        </div>
      </header>

      {error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠</div>
          <h2>Couldn't load watchlist</h2>
          <p>The watchlist feature may not be implemented yet in the backend.</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📽</div>
          <h2>Your watchlist is empty</h2>
          <p>Start browsing movies and add them to your watchlist!</p>
        </div>
      ) : (
        <div className="movies-grid">
          {watchlist.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isInWatchlist={true}
              onRemoveFromWatchlist={handleRemove}
              onMarkViewed={handleMarkViewed}
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

