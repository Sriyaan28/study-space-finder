import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  Calendar,
  BarChart3,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  LayoutDashboard,
  Building2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenAI }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : ''}`;

  return (
    <header className="navbar-container">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="brand-icon-box">
            <Compass size={22} color="#ffffff" />
          </div>
          <div>
            <span className="brand-title">Campus<span className="brand-highlight">Spaces</span></span>
            <span className="brand-sub">University Study Hub</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/spaces" className={navLinkClass}>Find Spaces</NavLink>

          {isAuthenticated && !isAdmin && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/reservations" className={navLinkClass}>Reservations</NavLink>
              <NavLink to="/favorites" className={navLinkClass}>Favorites</NavLink>
              <NavLink to="/analytics" className={navLinkClass}>Analytics</NavLink>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <NavLink to="/admin" className={navLinkClass}>Admin Dashboard</NavLink>
              <NavLink to="/admin/spaces" className={navLinkClass}>Manage Spaces</NavLink>
              <NavLink to="/admin/students" className={navLinkClass}>Students</NavLink>
              <NavLink to="/admin/reservations" className={navLinkClass}>All Bookings</NavLink>
            </>
          )}
        </nav>

        {/* Right CTA / Auth controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* AI Assistant Button */}
          <button
            type="button"
            className="ai-trigger-btn"
            onClick={onOpenAI}
            title="Ask AI Study Space Assistant"
          >
            <Sparkles size={16} className="sparkle-icon" />
            <span className="ai-trigger-text">AI Assistant</span>
          </button>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info-text">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role-badge">{isAdmin ? 'Admin' : 'Student'}</span>
                </div>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-user-name">{user?.name}</p>
                    <p className="dropdown-user-email">{user?.email}</p>
                    <span className={`badge ${isAdmin ? 'badge-indigo' : 'badge-emerald'}`} style={{ marginTop: '0.375rem' }}>
                      {isAdmin ? 'Campus Admin' : user?.department || 'Student'}
                    </span>
                  </div>

                  <div className="dropdown-divider"></div>

                  {isAdmin ? (
                    <>
                      <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <LayoutDashboard size={16} /> Admin Portal
                      </Link>
                      <Link to="/admin/spaces" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Building2 size={16} /> Manage Spaces
                      </Link>
                      <Link to="/admin/students" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Users size={16} /> Student Directory
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <LayoutDashboard size={16} /> Student Dashboard
                      </Link>
                      <Link to="/reservations" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Calendar size={16} /> My Reservations
                      </Link>
                      <Link to="/favorites" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Bookmark size={16} /> Favorite Spaces
                      </Link>
                      <Link to="/analytics" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <BarChart3 size={16} /> Study Habits & Analytics
                      </Link>
                    </>
                  )}

                  <div className="dropdown-divider"></div>

                  <button type="button" className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/spaces" onClick={() => setMobileMenuOpen(false)}>Find Study Spaces</Link>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Overview</Link>
                    <Link to="/admin/spaces" onClick={() => setMobileMenuOpen(false)}>Manage Study Spaces</Link>
                    <Link to="/admin/students" onClick={() => setMobileMenuOpen(false)}>Student Accounts</Link>
                    <Link to="/admin/reservations" onClick={() => setMobileMenuOpen(false)}>Campus Reservations</Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    <Link to="/reservations" onClick={() => setMobileMenuOpen(false)}>My Reservations</Link>
                    <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>Saved Spaces</Link>
                    <Link to="/analytics" onClick={() => setMobileMenuOpen(false)}>Usage Analytics</Link>
                  </>
                )}
                <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.5rem 0', paddingTop: '0.5rem' }}>
                  <button type="button" className="btn btn-danger btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign Up Free</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scoped Styles for Navbar */}
      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-subtle);
        }
        .brand-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
        }
        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-main);
          display: block;
          line-height: 1.1;
        }
        .brand-highlight {
          color: var(--primary);
        }
        .brand-sub {
          font-size: 0.6875rem;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: var(--transition);
          padding: 0.375rem 0.25rem;
          position: relative;
        }
        .nav-link:hover {
          color: var(--primary);
        }
        .nav-link-active {
          color: var(--primary);
        }
        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--primary);
          border-radius: 2px;
        }
        .ai-trigger-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #4f46e5;
          font-weight: 700;
          font-size: 0.8125rem;
          padding: 0.45rem 0.875rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition);
        }
        .ai-trigger-btn:hover {
          background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.25);
          transform: translateY(-1px);
        }
        .sparkle-icon {
          color: #7c3aed;
        }
        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          padding: 0.35rem 0.65rem 0.35rem 0.35rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition);
        }
        .user-profile-btn:hover {
          border-color: var(--border-focus);
          background: #f8fafc;
        }
        .avatar-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8125rem;
        }
        .user-info-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .user-name {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-main);
          max-width: 100px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-role-badge {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }
        .user-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 240px;
          background: #ffffff;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-xl);
          padding: 0.5rem;
          z-index: 50;
          animation: slideUp 0.15s ease-out;
        }
        .dropdown-header {
          padding: 0.625rem 0.75rem;
        }
        .dropdown-user-name {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--text-main);
        }
        .dropdown-user-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          word-break: break-all;
        }
        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 0.375rem 0;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-main);
          border-radius: var(--radius-sm);
          transition: var(--transition);
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
        }
        .dropdown-item:hover {
          background: #f1f5f9;
          color: var(--primary);
        }
        .dropdown-logout {
          color: var(--rose-600);
        }
        .dropdown-logout:hover {
          background: var(--rose-50);
          color: var(--rose-600);
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-main);
        }
        .mobile-nav-drawer {
          background: #ffffff;
          border-top: 1px solid var(--border-subtle);
          padding: 1rem 1.5rem;
        }
        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          font-weight: 600;
          font-size: 0.9375rem;
        }
        @media (max-width: 900px) {
          .desktop-nav {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
          .user-info-text {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .ai-trigger-text {
            display: none;
          }
          .brand-sub {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
