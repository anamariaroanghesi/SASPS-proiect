const API_BASE = 'http://localhost:5000';

// Hardcoded user ID for now
export const USER_ID = 1;

export async function fetchMovies() {
  const res = await fetch(`${API_BASE}/movies`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
}

export async function fetchMovie(movieId, level = 'complex') {
  const res = await fetch(`${API_BASE}/movies/${movieId}?level=${level}`);
  if (!res.ok) throw new Error('Failed to fetch movie');
  return res.json();
}

export async function fetchWatchlist(userId = USER_ID) {
  const res = await fetch(`${API_BASE}/users/${userId}/watchlist`);
  if (!res.ok) throw new Error('Failed to fetch watchlist');
  return res.json();
}

export async function addToWatchlist(movieId, userId = USER_ID) {
  const res = await fetch(`${API_BASE}/users/${userId}/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movie_id: movieId }),
  });
  if (!res.ok) throw new Error('Failed to add to watchlist');
  return res.json();
}

export async function removeFromWatchlist(movieId, userId = USER_ID) {
  const res = await fetch(`${API_BASE}/users/${userId}/watchlist/${movieId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove from watchlist');
  return res.ok;
}

export async function fetchViewed(userId = USER_ID) {
  const res = await fetch(`${API_BASE}/users/${userId}/viewed`);
  if (!res.ok) throw new Error('Failed to fetch viewed movies');
  return res.json();
}

export async function addToViewed(movieId, rating, userId = USER_ID) {
  const res = await fetch(`${API_BASE}/users/${userId}/viewed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movie_id: movieId, rating }),
  });
  if (!res.ok) throw new Error('Failed to add to viewed');
  return res.json();
}

export async function removeFromViewed(movieId, userId = USER_ID) {
  const res = await fetch(`${API_BASE}/users/${userId}/viewed/${movieId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove from viewed');
  return res.ok;
}

