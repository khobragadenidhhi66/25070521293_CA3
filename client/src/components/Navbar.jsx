import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Atelier Overview';
      case '/wardrobe':
        return 'Digital Wardrobe';
      case '/builder':
        return 'Outfit Architect';
      case '/calendar':
        return 'Style Calendar';
      case '/wishlist':
        return 'Wishlist & Curation';
      case '/community':
        return 'Community Lookbook';
      case '/profile':
        return 'Profile & Wardrobe Analytics';
      default:
        return 'ClosetIQ';
    }
  };

  return (
    <header className="top-navbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobile}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="topbar-title">{getPageTitle()}</h1>
      </div>

      <div className="topbar-right">
        {location.pathname !== '/builder' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/builder')}
          >
            <Sparkles size={15} />
            <span style={{ display: window.innerWidth <= 640 ? 'none' : 'inline' }}>
              Build Look
            </span>
          </button>
        )}

        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <img
            src={
              user?.profileImage ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
            }
            alt={user?.name || 'User'}
            className="user-avatar"
            style={{ width: '34px', height: '34px' }}
          />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

