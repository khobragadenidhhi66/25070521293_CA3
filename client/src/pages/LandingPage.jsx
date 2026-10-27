import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shirt,
  CalendarDays,
  Bookmark,
  Globe2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const LandingPage = () => {
  const sampleCards = [
    {
      title: 'Silk Ivory & Charcoal Pleats',
      category: 'Workwear Atelier',
      img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Camel Gabardine Trench',
      category: 'Transitional Outerwear',
      img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Muted Lavender Silk Slip',
      category: 'Evening Vernissage',
      img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Spazzolato Calf Loafers',
      category: 'Footwear & Accents',
      img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Editorial Navigation */}
      <nav className="landing-nav">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '1.4rem' }}>✦</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            ClosetIQ
          </span>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-lavender)', fontWeight: 600 }}>
            ATELIER
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn btn-outline btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4rem', padding: '0 2rem' }}>
          <div className="landing-hero-content">
            <span className="editorial-tag">
              <Sparkles size={14} /> The Digital Wardrobe Architecture
            </span>
            <h1 className="hero-title">
              Curate your closet. <em>Master</em> your personal style.
            </h1>
            <p className="hero-subtitle">
              ClosetIQ brings editorial-level wardrobe digitization and outfit planning to your daily routine. Catalog pieces you own, architect cohesive looks, eliminate morning decision fatigue, and share style inspiration.
            </p>
            <div className="hero-cta-group">
              <Link to="/register" className="btn btn-primary btn-lg">
                Enter Atelier <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Explore Demo Looks
              </Link>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.75rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700 }}>100%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Private Wardrobe</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700 }}>Smart</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calendar Sync</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700 }}>Social</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lookbook Feed</div>
              </div>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="hero-collage">
              {sampleCards.map((card, idx) => (
                <div key={idx} className="hero-card">
                  <img src={card.img} alt={card.title} />
                  <div className="hero-card-meta">
                    <div className="hero-card-subtitle">{card.category}</div>
                    <div className="hero-card-title">{card.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="editorial-tag">Core Capabilities</span>
          <h2 className="section-title">Designed for Modern Style Curators</h2>
          <p className="section-subtitle">
            Everything you need to transform a chaotic closet into a high-functioning capsule wardrobe.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <Shirt size={26} />
            </div>
            <h3>Digitize Your Clothes</h3>
            <p>
              Upload photos of tops, bottoms, dresses, outerwear, shoes, bags, and jewelry. Tag by season, color, brand, and occasion for instant searchable retrieval.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Sparkles size={26} />
            </div>
            <h3>Interactive Outfit Builder</h3>
            <p>
              Mix and match pieces side-by-side on a live visual canvas. Test combinations before getting dressed and save signature outfits for any occasion.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <CalendarDays size={26} />
            </div>
            <h3>Monthly Style Calendar</h3>
            <p>
              Schedule outfits in advance for meetings, dates, galas, and trips. Built-in conflict detection prevents duplicate outfits on the same day.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Bookmark size={26} />
            </div>
            <h3>Wishlist & Favorites</h3>
            <p>
              Track desired luxury pieces with prices and links. Once purchased, move wishlisted items straight into your active wardrobe with a single click.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Globe2 size={26} />
            </div>
            <h3>Community Lookbook</h3>
            <p>
              Share your favorite outfits and styling notes with fellow curators. Discover fresh color pairings while your private wardrobe remains completely secure.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <CheckCircle2 size={26} />
            </div>
            <h3>Wardrobe Analytics</h3>
            <p>
              Visualize your closet composition by category, season, and wear frequency to make more intentional, sustainable shopping choices.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>
              ClosetIQ
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              The digital wardrobe and outfit architecture platform.
            </p>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            &copy; 2026 ClosetIQ Atelier. Crafted with minimalist elegance.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
