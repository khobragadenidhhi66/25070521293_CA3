import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  CalendarDays,
  Bookmark,
  Globe2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleCollapse, mobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Wardrobe', path: '/wardrobe', icon: Shirt },
    { name: 'Outfit Builder', path: '/builder', icon: Sparkles },
    { name: 'Outfit Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Wishlist & Faves', path: '/wishlist', icon: Bookmark },
    { name: 'Community', path: '/community', icon: Globe2 },
    { name: 'Profile & Stats', path: '/profile', icon: UserCheck },
  ];

  return (
    <>
      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <NavLink to="/dashboard" className="sidebar-logo" onClick={closeMobile}>
            <span style={{ fontSize: '1.4rem' }}>✦</span>
            <span className="sidebar-logo-text">ClosetIQ</span>
            <span className="sidebar-logo-tag">ATELIER</span>
          </NavLink>

          {/* Desktop collapse toggle */}
          <button
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ display: window.innerWidth <= 768 ? 'none' : 'flex' }}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile close button */}
          <button
            className="sidebar-collapse-btn"
            onClick={closeMobile}
            style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                onClick={closeMobile}
                title={item.name}
              >
                <Icon size={20} strokeWidth={1.8} />
                <span className="nav-text">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/profile"
            className="user-profile-summary"
            onClick={closeMobile}
            title="View Profile"
          >
            <img
              src={
                user?.profileImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
              }
              alt={user?.name || 'User'}
              className="user-avatar"
            />
            <div className="user-info-text">
              <span className="user-name">{user?.name || 'Stylist'}</span>
              <span className="user-role">{user?.email || 'Active Member'}</span>
            </div>
          </NavLink>

          <button
            className="btn-ghost btn-icon btn-sm"
            onClick={handleLogout}
            title="Log Out"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* Mobile background overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={closeMobile}
      />
    </>
  );
};

export default Sidebar;
