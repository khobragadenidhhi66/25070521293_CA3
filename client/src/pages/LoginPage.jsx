import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Sparkles, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showSuccess('Welcome back to your Atelier!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sign in. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    try {
      setLoading(true);
      await login(demoEmail, demoPassword);
      showSuccess(`Signed in as demo curator!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Demo sign in failed.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Editorial side banner */}
      <div className="auth-sidebar-banner">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
          <span style={{ fontSize: '1.4rem' }}>✦</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700 }}>
            ClosetIQ
          </span>
        </Link>

        <div>
          <blockquote className="auth-banner-quote">
            "Buy less, choose well, and make it last. Quality, not quantity. Everybody's buying far too many clothes."
            <cite>— Vivienne Westwood</cite>
          </blockquote>
        </div>

        <div style={{ fontSize: '0.82rem', opacity: 0.75 }}>
          Curate, Architect, and Transcend Daily Dressing.
        </div>
      </div>

      {/* Login form side */}
      <div className="auth-card-container">
        <div className="auth-header">
          <h1>Sign in to ClosetIQ</h1>
          <p>Access your curated wardrobe, planned outfits, and lookbooks.</p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--status-error-bg)',
              color: 'var(--status-error)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(198, 40, 40, 0.2)',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '0.5rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="demo-accounts-box">
          <div className="demo-title">Quick Demo Login (Pre-seeded with 16 clothes & outfits)</div>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.78rem' }}
              onClick={() => handleDemoLogin('elena@closetiq.fashion', 'password123')}
              disabled={loading}
            >
              Elena (Minimalist Curator)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.78rem' }}
              onClick={() => handleDemoLogin('marcus@closetiq.fashion', 'password123')}
              disabled={loading}
            >
              Marcus (Streetwear)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'underline' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

