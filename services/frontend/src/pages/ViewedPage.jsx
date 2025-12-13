import { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { fetchViewed, removeFromViewed } from '../api';
import './ViewedPage.css';

export default function ViewedPage() {
  const [viewed, setViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadViewed();
  }, []);

  const loadViewed = async () => {
    try {
      setLoading(true);
      const data = await fetchViewed();
      setViewed(data);
      setError(null);
    } catch (err) {
      setError('Failed to load viewed movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (movieId) => {
    try {
      await removeFromViewed(movieId);
      setViewed(viewed.filter(m => m.id !== movieId));
    } catch (err) {
      console.error('Failed to remove from viewed:', err);
    }
  };

  const avgRating = viewed.length > 0 
    ? (viewed.reduce((sum, m) => sum + (m.rating || 0), 0) / viewed.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading viewed movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Viewed Movies</h1>
          <p className="header-subtitle">
            {viewed.length === 0 
              ? "You haven't rated any movies yet" 
              : `${viewed.length} movie${viewed.length !== 1 ? 's' : ''} watched`}
          </p>
        </div>
        
        {viewed.length > 0 && (
          <div className="stats-card">
            <div className="stat">
              <span className="stat-value">{viewed.length}</span>
              <span className="stat-label">Movies Watched</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">{avgRating}★</span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>
        )}
      </header>

      {error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠</div>
          <h2>Couldn't load viewed movies</h2>
          <p>The viewed feature may not be implemented yet in the backend.</p>
        </div>
      ) : viewed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h2>No movies watched yet</h2>
          <p>When you watch a movie, rate it and it will appear here!</p>
        </div>
      ) : (
        <div className="movies-grid">
          {viewed.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              showRating={true}
              rating={movie.rating}
              onRemoveFromWatchlist={handleRemove}
              isInWatchlist={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

