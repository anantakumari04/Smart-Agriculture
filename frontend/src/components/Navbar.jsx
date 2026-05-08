import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <a href="/dashboard">🏠 Home</a>
        <a href="/dashboard">📊 Dashboard</a>
        <a href="/history">📈 History</a>
        <a href="/alerts">🔔 Alerts</a>
        <a href="/ai-recommendations">🤖 AI Recommendations</a>
        {user && user.role === 'admin' && <a href="/admin">⚙️ Admin</a>}
      </div>

      <div className="navbar-user-menu">
        <button className="navbar-user-button" onClick={() => setShowDropdown(!showDropdown)}>
          👤 {user?.firstName || 'User'}
        </button>

        {showDropdown && (
          <div className="navbar-dropdown">
            <a href="/dashboard">Profile</a>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
