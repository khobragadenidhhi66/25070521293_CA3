import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Save,
  LogOut,
  Shirt,
  Sparkles,
  CalendarDays,
  Bookmark,
  Heart,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);

  // Form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  const fetchProfileStats = async () => {
    try {
      setLoading(true);
      const data = await authService.getStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      showError('Could not load wardrobe analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Name cannot be empty.');
      return;
    }

    try {
      setSubmitting(true);
      const data = await authService.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        profileImage: profileImage.trim(),
      });
      if (data.success) {
        updateUser(data.user);
        showSuccess('Profile updated successfully.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update profile.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    showSuccess('You have been logged out.');
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner message="Loading stylist profile..." />;
  }

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="editorial-tag" style={{ marginBottom: '0.4rem' }}>
            Stylist Account
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600 }}>
            Profile & Wardrobe Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Manage your personal profile and inspect the statistical breakdown of your digital wardrobe.
          </p>
        </div>

        <button className="btn btn-outline" onClick={handleLogout} style={{ color: 'var(--status-error)' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Edit Profile Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Personal Details
          </h2>

          <form onSubmit={handleUpdateProfile}>
            {/* Avatar preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <img
                src={
                  profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt="Profile Preview"
                className="user-avatar"
                style={{ width: '64px', height: '64px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{name || 'Stylist'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Avatar Image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Styling Bio</label>
              <textarea
                className="form-textarea"
                placeholder="Share your personal style philosophy or capsule wardrobe approach..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
              disabled={submitting}
            >
              <Save size={16} />
              {submitting ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right: Wardrobe Analytics Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Key metrics grid */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Atelier Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Shirt size={15} /> CLOTHES
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {stats?.totalClothing || 0}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Sparkles size={15} /> OUTFITS
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {stats?.totalOutfits || 0}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <CalendarDays size={15} /> UPCOMING PLANS
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {stats?.upcomingPlansCount || 0}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Heart size={15} color="#e53935" /> TOTAL LIKES WON
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {stats?.totalLikesReceived || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600, marginBottom: '1rem' }}>
              Wardrobe by Category
            </h3>
            {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {Object.entries(stats.categoryBreakdown).map(([cat, count]) => {
                  const percent = Math.round((count / (stats.totalClothing || 1)) * 100);
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                        <span>{cat}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div style={{ height: '7px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: 'var(--accent-lavender)',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                No category data available yet.
              </p>
            )}
          </div>

          {/* Season Breakdown */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600, marginBottom: '1rem' }}>
              Wardrobe by Season
            </h3>
            {stats?.seasonBreakdown && Object.keys(stats.seasonBreakdown).length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(stats.seasonBreakdown).map(([season, count]) => (
                  <span
                    key={season}
                    className="badge badge-lavender"
                    style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    {season}: {count}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                No season data available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
