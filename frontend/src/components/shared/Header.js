import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';
import NotificationBell from './NotificationBell';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUserFromStorage();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="header">
      {/* Ambient glow top line */}
      <div className="header-glow-line" />

      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.9"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="logo-text">
            E<span className="logo-accent">Learn</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links">
          <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>
            Courses
          </Link>
          {isAuthenticated && (
            <>
              {user?.is_instructor ? (
                <Link to="/dashboard/instructor" className={`nav-link ${isActive('/dashboard/instructor') ? 'active' : ''}`}>
                  Dashboard
                </Link>
              ) : (
                <Link to="/dashboard/student" className={`nav-link ${isActive('/dashboard/student') ? 'active' : ''}`}>
                  My Courses
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="nav-right">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* Role badge */}
              <span className={`role-badge ${user?.is_instructor ? 'instructor' : 'student'}`}>
                {user?.is_instructor ? 'Instructor' : 'Student'}
              </span>

              {/* User Dropdown */}
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  className="avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <div className="avatar">
                    {getInitials()}
                  </div>
                  <svg
                    className={`chevron ${dropdownOpen ? 'open' : ''}`}
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{getInitials()}</div>
                      <div className="dropdown-user-info">
                        <span className="dropdown-name">
                          {user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}
                        </span>
                        <span className="dropdown-email">{user?.email}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <Link to="/profile" className="dropdown-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Profile
                    </Link>

                    {user?.is_instructor ? (
                      <Link to="/dashboard/instructor" className="dropdown-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Dashboard
                      </Link>
                    ) : (
                      <Link to="/dashboard/student" className="dropdown-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                        My Courses
                      </Link>
                    )}

                    <div className="dropdown-divider" />

                    <button onClick={handleLogout} className="dropdown-item logout">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className={`hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <Link to="/courses" className="mobile-link">Courses</Link>
        {isAuthenticated ? (
          <>
            {user?.is_instructor ? (
              <Link to="/dashboard/instructor" className="mobile-link">Dashboard</Link>
            ) : (
              <Link to="/dashboard/student" className="mobile-link">My Courses</Link>
            )}
            <Link to="/profile" className="mobile-link">Profile</Link>
            <div className="mobile-user-info">
              <div className="avatar small">{getInitials()}</div>
              <span>{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="mobile-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-link">Login</Link>
            <Link to="/register" className="mobile-link highlight">Get Started</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;