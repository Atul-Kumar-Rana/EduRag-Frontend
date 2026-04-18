import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">🍽 SmartRecipe</Link>

        <button className="navbar-toggler border-0" onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: '#fff' }}>
          <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '1.5rem' }}></i>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={isActive('/')} to="/" onClick={() => setMenuOpen(false)}>
                <i className="bi bi-house me-1"></i>Home
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className={isActive('/my-recipes')} to="/my-recipes" onClick={() => setMenuOpen(false)}>
                    <i className="bi bi-journal-text me-1"></i>My Recipes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={isActive('/saved')} to="/saved" onClick={() => setMenuOpen(false)}>
                    <i className="bi bi-bookmark-heart me-1"></i>Saved
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/add-recipe" onClick={() => setMenuOpen(false)}>
                    <span className="badge" style={{ background: '#f4845f', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
                      <i className="bi bi-plus-lg me-1"></i>Add Recipe
                    </span>
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#"
                    data-bs-toggle="dropdown">
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#52b788', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                    <span>{user?.name}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><span className="dropdown-item-text text-muted small">{user?.email}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={isActive('/login')} to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                </li>
                <li className="nav-item ms-2">
                  <Link to="/register" className="btn btn-sm" onClick={() => setMenuOpen(false)}
                    style={{ background: '#f4845f', color: '#fff', borderRadius: '20px', padding: '6px 18px', fontWeight: 600 }}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
