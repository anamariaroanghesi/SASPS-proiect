import { Link } from 'react-router-dom';
import './MovieCard.css';

export default function MovieCard({ movie, onAddToWatchlist, onRemoveFromWatchlist, onMarkViewed, isInWatchlist, showRating, rating }) {
  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist) {
      onRemoveFromWatchlist?.(movie.id);
    } else {
      onAddToWatchlist?.(movie.id);
    }
  };

  const handleViewedClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkViewed?.(movie);
  };

  // Generate a pseudo-random gradient based on movie id
  const gradients = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #2d132c 0%, #3e1f47 50%, #4a2c4a 100%)',
    'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1f1f1f 100%)',
    'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #2a3f54 100%)',
    'linear-gradient(135deg, #1c1c1c 0%, #2a2a2a 50%, #1a1a1a 100%)',
    'linear-gradient(135deg, #1a0a0a 0%, #2d1515 50%, #3d1a1a 100%)',
  ];
  const gradient = gradients[movie.id % gradients.length];

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card">
      <div className="movie-card-poster" style={{ background: gradient }}>
        <div className="movie-card-year">{movie.year}</div>
        <div className="movie-card-overlay">
          <div className="movie-card-actions">
            {onAddToWatchlist && (
              <button 
                className={`action-btn watchlist-btn ${isInWatchlist ? 'active' : ''}`}
                onClick={handleWatchlistClick}
                title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {isInWatchlist ? '✓' : '+'}
              </button>
            )}
            {onMarkViewed && (
              <button 
                className="action-btn viewed-btn"
                onClick={handleViewedClick}
                title="Mark as viewed"
              >
                ★
              </button>
            )}
          </div>
        </div>
        <div className="movie-card-title-overlay">
          <span className="movie-initial">{movie.title?.charAt(0) || 'M'}</span>
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title || movie.name}</h3>
        {showRating && rating && (
          <div className="movie-card-rating">
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
          </div>
        )}
      </div>
    </Link>
  );
}

