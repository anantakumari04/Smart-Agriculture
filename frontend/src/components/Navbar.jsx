import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-icon">🌱</span>
        <span>Smart Agriculture</span>
      </div>

      <div className="navbar-nav">
        <Link to="/dashboard">🏠 Home</Link>
        <Link to="/dashboard">📊 Dashboard</Link>
        <Link to="/history">📈 History</Link>
        <Link to="/alerts">🔔 Alerts</Link>
        <Link to="/ai-recommendations">🤖 AI Recommendations</Link>
        {user && user.role === 'admin' && <Link to="/admin">⚙️ Admin</Link>}
      </div>

      <div className="navbar-user-menu">
        <button className="navbar-user-button" onClick={() => setShowDropdown(!showDropdown)}>
          👤 {user?.firstName || 'User'}
        </button>

        {showDropdown && (
          <div className="navbar-dropdown">
            <Link to="/dashboard">Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
