import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shirt,
  Sparkles,
  CalendarDays,
  Bookmark,
  Plus,
  ArrowRight,
  TrendingUp,
  Heart,
  Eye,
} from 'lucide-react';
import { authService } from '../services/authService';
import { clothingService } from '../services/clothingService';
import { outfitService } from '../services/outfitService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import OutfitCard from '../components/OutfitCard';
import Modal from '../components/Modal';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClothing: 0,
    totalOutfits: 0,
    totalWishlist: 0,
    upcomingPlansCount: 0,
    totalLikesReceived: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [recentOutfits, setRecentOutfits] = useState([]);
  
  // Quick View Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await authService.getStats();
      if (data.success) {
        setStats(data.stats);
        setRecentItems(data.recentItems || []);
        setRecentOutfits(data.recentOutfits || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      showError('Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFullImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
    if (url.startsWith('/uploads/')) {
      const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendBase}${url}`;
    }
    return url;
  };

  const handleToggleOutfitFavorite = async (outfit) => {
    try {
      await outfitService.toggleFavorite(outfit._id);
      fetchDashboardData();
    } catch (err) {
      showError('Could not update favorite status.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Curating your personal atelier..." />;
  }

  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div className="dashboard-welcome">
        <div>
          <span className="editorial-tag" style={{ marginBottom: '0.5rem' }}>
            Personal Atelier
          </span>
          <h1 className="welcome-title">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Stylist'}
          </h1>
          <p className="welcome-subtitle">
            Here is the current state of your digitized wardrobe and upcoming looks.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/wardrobe')}>
          <Plus size={16} /> Add Clothing Item
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="dashboard-stats-grid">
        <div className="stat-card" onClick={() => navigate('/wardrobe')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-value">{stats.totalClothing}</span>
            <span className="stat-label">Clothing Items</span>
          </div>
          <div className="stat-icon">
            <Shirt size={24} />
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/builder')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOutfits}</span>
            <span className="stat-label">Saved Outfits</span>
          </div>
          <div className="stat-icon">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/calendar')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-value">{stats.upcomingPlansCount}</span>
            <span className="stat-label">Upcoming Plans</span>
          </div>
          <div className="stat-icon">
            <CalendarDays size={24} />
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/wishlist')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-value">{stats.totalWishlist}</span>
            <span className="stat-label">Wishlist Items</span>
          </div>
          <div className="stat-icon">
            <Bookmark size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Strip */}
      <div className="quick-actions-bar">
        <div className="quick-actions-title">
          <TrendingUp size={18} color="var(--accent-lavender-dark)" />
          <span>Quick Atelier Actions</span>
        </div>
        <div className="quick-actions-buttons">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/wardrobe')}>
            <Shirt size={14} /> Digitize Clothing
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/builder')}>
            <Sparkles size={14} /> Create Outfit
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/calendar')}>
            <CalendarDays size={14} /> Plan On Calendar
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/community')}>
            Browse Community &rarr;
          </button>
        </div>
      </div>

      {/* Main Grid: Recently Added Clothes & Recent Outfits */}
      <div className="dashboard-grid-dual">
        {/* Recently Added Clothing Rail */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600 }}>
              Recent Additions
            </h2>
            <Link to="/wardrobe" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-lavender-dark)' }}>
              View Wardrobe ({stats.totalClothing}) &rarr;
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <EmptyState
              icon={Shirt}
              title="Your wardrobe is empty"
              description="Digitize the clothes you love by uploading photos and tagging them with categories and colors."
              actionLabel="Add First Item"
              onAction={() => navigate('/wardrobe')}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
              {recentItems.map((item) => (
                <div
                  key={item._id}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={getFullImageUrl(item.imageUrl)}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                    <span className="clothing-card-category-tag" style={{ fontSize: '0.62rem' }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    {item.brand && (
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                        {item.brand}
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Created Outfits */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600 }}>
              Recent Outfits
            </h2>
            <Link to="/builder" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-lavender-dark)' }}>
              Open Builder &rarr;
            </Link>
          </div>

          {recentOutfits.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No outfits designed yet"
              description="Open the Outfit Architect to compose looks using pieces from your wardrobe."
              actionLabel="Architect Outfit"
              onAction={() => navigate('/builder')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {recentOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit._id}
                  outfit={outfit}
                  onView={() => setSelectedOutfit(outfit)}
                  onToggleFavorite={handleToggleOutfitFavorite}
                  onSchedule={() => navigate('/calendar')}
                  onShare={() => navigate('/community')}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name || 'Clothing Details'}
        footer={
          <button className="btn btn-outline" onClick={() => setSelectedItem(null)}>
            Close
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '280px' }}>
              <img
                src={getFullImageUrl(selectedItem.imageUrl)}
                alt={selectedItem.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedItem.brand && (
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-lavender-dark)' }}>
                  {selectedItem.brand}
                </div>
              )}
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>{selectedItem.name}</h3>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-dark">{selectedItem.category}</span>
                <span className="badge badge-lavender">{selectedItem.season}</span>
                <span className="badge badge-default">{selectedItem.occasion}</span>
                {selectedItem.color && <span className="badge badge-default">{selectedItem.color}</span>}
              </div>

              {selectedItem.notes && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <strong>Notes:</strong> {selectedItem.notes}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Outfit Lookbook Modal */}
      <Modal
        isOpen={!!selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        title={selectedOutfit?.name || 'Outfit Lookbook'}
        maxWidth="720px"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => setSelectedOutfit(null)}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                const outfit = selectedOutfit;
                setSelectedItem(null);
                setSelectedOutfit(null);
                navigate('/calendar');
              }}
            >
              Plan on Calendar
            </button>
          </div>
        }
      >
        {selectedOutfit && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-lavender">{selectedOutfit.occasion}</span>
              <span className="badge badge-default">{selectedOutfit.season}</span>
              <span className="badge badge-dark">{selectedOutfit.clothingItems?.length || 0} pieces</span>
            </div>

            {selectedOutfit.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {selectedOutfit.description}
              </p>
            )}

            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Included Wardrobe Pieces
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
              {selectedOutfit.clothingItems?.map((piece) => (
                <div
                  key={piece._id}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <img
                    src={getFullImageUrl(piece.imageUrl)}
                    alt={piece.name}
                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent-lavender-dark)', textTransform: 'uppercase' }}>
                      {piece.category}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {piece.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
