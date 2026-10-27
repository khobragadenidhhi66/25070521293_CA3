import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Check,
  X,
  Trash2,
  Calendar,
  Share2,
  Filter,
  Shirt,
  CalendarDays,
} from 'lucide-react';
import { clothingService } from '../services/clothingService';
import { outfitService } from '../services/outfitService';
import { useToast } from '../context/ToastContext';
import OutfitCard from '../components/OutfitCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];
const OCCASIONS = ['Casual', 'Work', 'Formal', 'Party', 'Sport', 'Loungewear', 'Vacation', 'Special Event'];
const SEASONS = ['All-Season', 'Spring', 'Summer', 'Fall', 'Winter'];

const OutfitBuilderPage = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);

  // Wardrobe filter inside builder
  const [wardrobeCategory, setWardrobeCategory] = useState('All');
  const [wardrobeSearch, setWardrobeSearch] = useState('');

  // Outfit Form State
  const [editingOutfitId, setEditingOutfitId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // array of ClothingItem objects
  const [outfitName, setOutfitName] = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('Casual');
  const [outfitSeason, setOutfitSeason] = useState('All-Season');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lookbook modal & delete dialog
  const [activeOutfitForView, setActiveOutfitForView] = useState(null);
  const [outfitToDelete, setOutfitToDelete] = useState(null);

  const fetchBuilderData = async () => {
    try {
      setLoading(true);
      const [clothingRes, outfitsRes] = await Promise.all([
        clothingService.getAll(),
        outfitService.getAll(),
      ]);
      if (clothingRes.success) setWardrobeItems(clothingRes.items);
      if (outfitsRes.success) setSavedOutfits(outfitsRes.outfits);
    } catch (err) {
      console.error('Error fetching builder data:', err);
      showError('Failed to load wardrobe data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilderData();
  }, []);

  const getFullImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
    if (url.startsWith('/uploads/')) {
      const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendBase}${url}`;
    }
    return url;
  };

  const handleToggleItemSelection = (item) => {
    const isSelected = selectedItems.some((i) => i._id === item._id);
    if (isSelected) {
      setSelectedItems((prev) => prev.filter((i) => i._id !== item._id));
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleRemoveCanvasItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((i) => i._id !== itemId));
  };

  const handleResetBuilder = () => {
    setEditingOutfitId(null);
    setSelectedItems([]);
    setOutfitName('');
    setOutfitDescription('');
    setOutfitOccasion('Casual');
    setOutfitSeason('All-Season');
    setScheduledDate('');
    setIsFavorite(false);
  };

  const handleEditOutfit = (outfit) => {
    setEditingOutfitId(outfit._id);
    setSelectedItems(outfit.clothingItems || []);
    setOutfitName(outfit.name);
    setOutfitDescription(outfit.description || '');
    setOutfitOccasion(outfit.occasion || 'Casual');
    setOutfitSeason(outfit.season || 'All-Season');
    setIsFavorite(outfit.isFavorite || false);
    setScheduledDate('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveOutfit = async (e) => {
    e.preventDefault();

    // Validation
    if (!outfitName.trim()) {
      showError('Please give this outfit a name.');
      return;
    }

    if (selectedItems.length === 0) {
      showError('Please select at least one clothing item from your wardrobe.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: outfitName.trim(),
        description: outfitDescription.trim(),
        clothingItems: selectedItems.map((i) => i._id),
        occasion: outfitOccasion,
        season: outfitSeason,
        isFavorite,
        scheduledDate: scheduledDate || undefined,
      };

      if (editingOutfitId) {
        await outfitService.update(editingOutfitId, payload);
        showSuccess(`Updated outfit "${outfitName}"!`);
      } else {
        await outfitService.create(payload);
        showSuccess(`Architected outfit "${outfitName}"!`);
      }

      handleResetBuilder();
      const updatedOutfits = await outfitService.getAll();
      if (updatedOutfits.success) setSavedOutfits(updatedOutfits.outfits);
    } catch (err) {
      console.error('Error saving outfit:', err);
      const msg = err.response?.data?.message || 'Failed to save outfit.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOutfit = async () => {
    if (!outfitToDelete) return;
    try {
      setSubmitting(true);
      await outfitService.delete(outfitToDelete._id);
      showSuccess(`Outfit "${outfitToDelete.name}" removed.`);
      setOutfitToDelete(null);
      const updated = await outfitService.getAll();
      if (updated.success) setSavedOutfits(updated.outfits);
    } catch (err) {
      showError('Failed to delete outfit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFavorite = async (outfit) => {
    try {
      await outfitService.toggleFavorite(outfit._id);
      const updated = await outfitService.getAll();
      if (updated.success) setSavedOutfits(updated.outfits);
    } catch (err) {
      showError('Could not update favorite status.');
    }
  };

  // Filtered wardrobe pieces for selector
  const filteredWardrobe = wardrobeItems.filter((item) => {
    const matchesCat = wardrobeCategory === 'All' || item.category === wardrobeCategory;
    const matchesSearch =
      !wardrobeSearch.trim() ||
      item.name.toLowerCase().includes(wardrobeSearch.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(wardrobeSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Preparing Outfit Architect..." />;
  }

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="editorial-tag" style={{ marginBottom: '0.4rem' }}>
          Outfit Architect
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600 }}>
          {editingOutfitId ? 'Edit Curated Look' : 'Architect a Cohesive Look'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Select pieces from your wardrobe and compose full styled outfits for any occasion.
        </p>
      </div>

      {/* Main Split Layout: Wardrobe Selection (Left) & Canvas + Form (Right) */}
      <div className="builder-layout" style={{ marginBottom: '3.5rem' }}>
        {/* Left: Wardrobe Browser */}
        <div className="builder-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600 }}>
              1. Select Wardrobe Pieces
            </h3>
            <span className="badge badge-lavender">
              {selectedItems.length} selected
            </span>
          </div>

          {/* Category filter pills inside builder */}
          <div className="category-pills" style={{ marginBottom: '1rem' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${wardrobeCategory === cat ? 'active' : ''}`}
                onClick={() => setWardrobeCategory(cat)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Filter pieces by name or brand..."
              value={wardrobeSearch}
              onChange={(e) => setWardrobeSearch(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
            />
          </div>

          {wardrobeItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Shirt size={32} color="var(--accent-lavender)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Your wardrobe is empty. Add clothing items first to architect outfits.
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/wardrobe')}
                style={{ marginTop: '0.75rem' }}
              >
                Go to Wardrobe
              </button>
            </div>
          ) : (
            <div className="builder-wardrobe-grid">
              {filteredWardrobe.map((item) => {
                const isSelected = selectedItems.some((i) => i._id === item._id);
                return (
                  <div
                    key={item._id}
                    className={`builder-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleItemSelection(item)}
                  >
                    <img
                      src={getFullImageUrl(item.imageUrl)}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                    <div className="builder-item-checkbox">
                      {isSelected ? (
                        <Check size={14} color="var(--accent-lavender-dark)" strokeWidth={3} />
                      ) : null}
                    </div>
                    <div className="builder-item-name">{item.name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Canvas Preview & Outfit Details Form */}
        <div className="builder-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600 }}>
              2. Canvas Preview & Styling
            </h3>
            {editingOutfitId && (
              <button className="btn btn-ghost btn-sm" onClick={handleResetBuilder}>
                Cancel Editing
              </button>
            )}
          </div>

          {/* Outfit Canvas Mosaic Preview */}
          <div className="canvas-preview-container">
            {selectedItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Sparkles size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.88rem' }}>
                  Click wardrobe pieces on the left to add them to your look.
                </p>
              </div>
            ) : (
              <div className="canvas-items-mosaic">
                {selectedItems.map((item) => (
                  <div key={item._id} className="canvas-item-preview">
                    <img src={getFullImageUrl(item.imageUrl)} alt={item.name} />
                    <button
                      type="button"
                      className="canvas-item-remove"
                      onClick={() => handleRemoveCanvasItem(item._id)}
                      title="Remove piece"
                    >
                      <X size={12} />
                    </button>
                    <div style={{ padding: '0.35rem', fontSize: '0.7rem', fontWeight: 600, background: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outfit Form */}
          <form onSubmit={handleSaveOutfit}>
            <div className="form-group">
              <label className="form-label">Outfit Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Gallery Opening & Cocktails"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Styling Notes & Description</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Pair tailored wool blazer over silk slip dress. Roll sleeves once for relaxed elegance."
                value={outfitDescription}
                onChange={(e) => setOutfitDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Occasion</label>
                <select
                  className="form-select"
                  value={outfitOccasion}
                  onChange={(e) => setOutfitOccasion(e.target.value)}
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Season</label>
                <select
                  className="form-select"
                  value={outfitSeason}
                  onChange={(e) => setOutfitSeason(e.target.value)}
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!editingOutfitId && (
              <div className="form-group">
                <label className="form-label">Optional: Schedule on Calendar</label>
                <input
                  type="date"
                  className="form-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <span className="form-hint">
                  Automatically adds this look to your style calendar for the chosen date.
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <input
                type="checkbox"
                id="outfitFavorite"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--text-primary)' }}
              />
              <label htmlFor="outfitFavorite" style={{ fontSize: '0.88rem', cursor: 'pointer', userSelect: 'none' }}>
                Add to Signature / Favorite Outfits
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={submitting}
              >
                <Sparkles size={16} />
                {submitting ? 'Saving...' : editingOutfitId ? 'Update Outfit' : 'Save Curated Look'}
              </button>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleResetBuilder}
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Saved Outfits Showcase Grid */}
      <div style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600 }}>
              Curated Lookbook
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {savedOutfits.length} saved {savedOutfits.length === 1 ? 'look' : 'looks'} ready to wear
            </p>
          </div>
        </div>

        {savedOutfits.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No outfits saved yet"
            description="Use the builder above to compose your first signature look."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {savedOutfits.map((outfit) => (
              <OutfitCard
                key={outfit._id}
                outfit={outfit}
                onView={() => setActiveOutfitForView(outfit)}
                onEdit={() => handleEditOutfit(outfit)}
                onDelete={() => setOutfitToDelete(outfit)}
                onSchedule={() => navigate('/calendar')}
                onShare={() => navigate('/community')}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lookbook Detail Modal */}
      <Modal
        isOpen={!!activeOutfitForView}
        onClose={() => setActiveOutfitForView(null)}
        title={activeOutfitForView?.name || 'Lookbook Details'}
        maxWidth="740px"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                const outfit = activeOutfitForView;
                setActiveOutfitForView(null);
                handleEditOutfit(outfit);
              }}
            >
              Edit Look
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setActiveOutfitForView(null);
                navigate('/calendar');
              }}
            >
              Plan on Calendar
            </button>
          </div>
        }
      >
        {activeOutfitForView && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-lavender">{activeOutfitForView.occasion}</span>
              <span className="badge badge-default">{activeOutfitForView.season}</span>
              <span className="badge badge-dark">{activeOutfitForView.clothingItems?.length || 0} Pieces</span>
              {activeOutfitForView.isFavorite && <span className="badge badge-gold">★ Signature Look</span>}
            </div>

            {activeOutfitForView.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {activeOutfitForView.description}
              </p>
            )}

            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Selected Pieces Breakdown
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {activeOutfitForView.clothingItems?.map((piece) => (
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
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '0.65rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-lavender-dark)', textTransform: 'uppercase' }}>
                      {piece.category}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {piece.name}
                    </div>
                    {piece.brand && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {piece.brand}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!outfitToDelete}
        onClose={() => setOutfitToDelete(null)}
        onConfirm={handleDeleteOutfit}
        title="Delete Curated Look?"
        message={`Are you sure you want to remove "${outfitToDelete?.name}"? Any calendar plans and community posts linked to this look will also be removed.`}
        confirmText="Yes, Delete Look"
        loading={submitting}
      />
    </div>
  );
};

export default OutfitBuilderPage;

