import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMovie, addToWatchlist, addToViewed } from '../api';
import RatingModal from '../components/RatingModal';
import './MoviePage.css';

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    try {
      setLoading(true);
      const data = await fetchMovie(id);
      setMovie(data);
      setError(null);
    } catch (err) {
      setError('Movie not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      await addToWatchlist(movie.id);
      setAddedToWatchlist(true);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const handleSubmitRating = async (movieId, rating) => {
    try {
      await addToViewed(movieId, rating);
      setShowRatingModal(false);
    } catch (err) {
      console.error('Failed to mark as viewed:', err);
    }
  };

  if (loading) {
    return (
      <div className="movie-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading movie...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-page">
        <div className="error">
          <h2>Movie not found</h2>
          <Link to="/" className="back-link">← Back to movies</Link>
        </div>
      </div>
    );
  }

  // Generate gradient based on movie id
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
    <div className="movie-page">
      <div className="movie-hero" style={{ background: gradient }}>
        <div className="hero-overlay"></div>
        <Link to="/" className="back-button">← Back</Link>
        
        <div className="hero-content">
          <div className="movie-poster">
            <span className="poster-initial">{movie.title?.charAt(0) || 'M'}</span>
          </div>
          
          <div className="movie-info">
            <div className="movie-meta">
              <span className="year-badge">{movie.year}</span>
              {movie.genre && <span className="genre-badge">{movie.genre.trim()}</span>}
            </div>
            
            <h1 className="movie-title">{movie.title}</h1>
            
            {movie.director && (
              <p className="movie-director">Directed by <span>{movie.director.trim()}</span></p>
            )}
            
            <div className="movie-actions">
              <button 
                className={`action-button primary ${addedToWatchlist ? 'added' : ''}`}
                onClick={handleAddToWatchlist}
                disabled={addedToWatchlist}
              >
                {addedToWatchlist ? '✓ Added to Watchlist' : '+ Add to Watchlist'}
              </button>
              <button 
                className="action-button secondary"
                onClick={() => setShowRatingModal(true)}
              >
                ★ Rate Movie
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {movie.synopsis && (
        <div className="movie-details">
          <section className="synopsis-section">
            <h2>Synopsis</h2>
            <p>{movie.synopsis.trim()}</p>
          </section>
        </div>
      )}

      {showRatingModal && (
        <RatingModal
          movie={movie}
          onSubmit={handleSubmitRating}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
}

