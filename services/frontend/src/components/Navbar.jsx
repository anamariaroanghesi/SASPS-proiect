import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/">
          <span className="brand-icon">◉</span>
          <span className="brand-text">CineVault</span>
        </NavLink>
      </div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          Browse
        </NavLink>
        <NavLink to="/watchlist" className={({ isActive }) => isActive ? 'active' : ''}>
          Watchlist
        </NavLink>
        <NavLink to="/viewed" className={({ isActive }) => isActive ? 'active' : ''}>
          Viewed
        </NavLink>
      </div>
    </nav>
  );
}

