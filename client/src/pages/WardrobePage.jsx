import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Heart,
  Upload,
  Link as LinkIcon,
  Shirt,
  X,
  Check,
} from 'lucide-react';
import { clothingService } from '../services/clothingService';
import { useToast } from '../context/ToastContext';
import ClothingCard from '../components/ClothingCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];
const SEASONS = ['All', 'Spring', 'Summer', 'Fall', 'Winter', 'All-Season'];
const OCCASIONS = ['All', 'Casual', 'Work', 'Formal', 'Party', 'Sport', 'Loungewear'];
const COLORS = ['All', 'Black', 'White', 'Ivory', 'Grey', 'Charcoal', 'Navy', 'Camel', 'Beige', 'Blue', 'Brown', 'Green', 'Red', 'Pink', 'Lavender', 'Gold', 'Silver'];

const WardrobePage = () => {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search & Sort
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sort, setSort] = useState('newest');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected item states
  const [activeItem, setActiveItem] = useState(null);
  const [linkedOutfits, setLinkedOutfits] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tops',
    color: 'Neutral',
    season: 'All-Season',
    occasion: 'Casual',
    brand: '',
    notes: '',
    isFavorite: false,
    imageUrl: '',
  });
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory,
        season: selectedSeason,
        occasion: selectedOccasion,
        color: selectedColor,
        isFavorite: onlyFavorites ? 'true' : undefined,
        search: search.trim() || undefined,
        sort,
      };
      const data = await clothingService.getAll(params);
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching wardrobe items:', err);
      showError('Failed to load wardrobe pieces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedSeason, selectedOccasion, selectedColor, onlyFavorites, sort]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchItems();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Image file handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('File size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Tops',
      color: 'Neutral',
      season: 'All-Season',
      occasion: 'Casual',
      brand: '',
      notes: '',
      isFavorite: false,
      imageUrl: '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadType('file');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setActiveItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      color: item.color || 'Neutral',
      season: item.season || 'All-Season',
      occasion: item.occasion || 'Casual',
      brand: item.brand || '',
      notes: item.notes || '',
      isFavorite: item.isFavorite || false,
      imageUrl: item.imageUrl || '',
    });
    setSelectedFile(null);
    setPreviewUrl(getFullImageUrl(item.imageUrl));
    setUploadType(item.imageUrl?.startsWith('/uploads/') ? 'file' : 'url');
    setIsEditModalOpen(true);
  };

  const handleOpenView = async (item) => {
    setActiveItem(item);
    setIsViewModalOpen(true);
    try {
      const data = await clothingService.getById(item._id);
      if (data.success) {
        setLinkedOutfits(data.linkedOutfits || []);
      }
    } catch (err) {
      console.warn('Could not load linked outfits:', err);
    }
  };

  const handleOpenDelete = (item) => {
    setActiveItem(item);
    setIsDeleteOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Please provide an item name.');
      return;
    }

    if (uploadType === 'file' && !selectedFile && !formData.imageUrl) {
      showError('Please choose an image file to upload.');
      return;
    }
    if (uploadType === 'url' && !formData.imageUrl) {
      showError('Please enter an image URL.');
      return;
    }

    try {
      setSubmitting(true);

      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('name', formData.name);
        payload.append('category', formData.category);
        payload.append('color', formData.color);
        payload.append('season', formData.season);
        payload.append('occasion', formData.occasion);
        payload.append('brand', formData.brand);
        payload.append('notes', formData.notes);
        payload.append('isFavorite', formData.isFavorite);
        payload.append('image', selectedFile);
      } else {
        payload = {
          ...formData,
        };
      }

      if (isEditModalOpen && activeItem) {
        await clothingService.update(activeItem._id, payload);
        showSuccess('Clothing item updated successfully.');
        setIsEditModalOpen(false);
      } else {
        await clothingService.create(payload);
        showSuccess('New item added to your digital wardrobe.');
        setIsAddModalOpen(false);
      }

      fetchItems();
    } catch (err) {
      console.error('Save clothing error:', err);
      const msg = err.response?.data?.message || 'Failed to save clothing item.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!activeItem) return;
    try {
      setSubmitting(true);
      await clothingService.delete(activeItem._id);
      showSuccess(`Deleted "${activeItem.name}" from wardrobe.`);
      setIsDeleteOpen(false);
      setActiveItem(null);
      fetchItems();
    } catch (err) {
      console.error('Delete item error:', err);
      showError('Could not delete clothing item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFavorite = async (item) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isFavorite: !i.isFavorite } : i))
    );

    try {
      const data = await clothingService.toggleFavorite(item._id);
      showSuccess(data.isFavorite ? 'Saved to favorites' : 'Removed from favorites');
    } catch (err) {
      showError('Could not toggle favorite.');
      fetchItems(); // revert on error
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
    if (url.startsWith('/uploads/')) {
      const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendBase}${url}`;
    }
    return url;
  };

  return (
    <div>
      {/* Header bar with Add button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="editorial-tag" style={{ marginBottom: '0.4rem' }}>
            Wardrobe Archive
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600 }}>
            My Digital Wardrobe
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {items.length} curated {items.length === 1 ? 'piece' : 'pieces'} cataloged
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Digitize New Piece
        </button>
      </div>

      {/* Toolbar: Category Pills + Search + Filters + Sort */}
      <div className="wardrobe-toolbar">
        {/* Category Filter Pills */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="toolbar-top">
          {/* Search bar */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by name, brand, color, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '0.85rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="toolbar-filters">
            <select
              className="filter-select"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              title="Filter by season"
            >
              <option value="All">All Seasons</option>
              {SEASONS.filter((s) => s !== 'All').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              title="Filter by occasion"
            >
              <option value="All">All Occasions</option>
              {OCCASIONS.filter((o) => o !== 'All').map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              title="Filter by color"
            >
              <option value="All">All Colors</option>
              {COLORS.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              title="Sort items"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
              <option value="name-desc">Alphabetical (Z-A)</option>
            </select>

            <button
              className={`btn btn-sm ${onlyFavorites ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              title="Filter favorited items only"
            >
              <Heart size={14} fill={onlyFavorites ? '#e53935' : 'none'} color={onlyFavorites ? '#e53935' : 'currentColor'} />
              <span>Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wardrobe Grid Content */}
      {loading ? (
        <LoadingSpinner message="Loading your wardrobe..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title={search || selectedCategory !== 'All' ? 'No items match your filters' : 'Your digital wardrobe is empty'}
          description={
            search || selectedCategory !== 'All'
              ? 'Try adjusting your search criteria or resetting the category filter.'
              : 'Start cataloging clothes you own to build a versatile capsule wardrobe.'
          }
          actionLabel={search || selectedCategory !== 'All' ? 'Reset Filters' : 'Add First Clothing Item'}
          onAction={
            search || selectedCategory !== 'All'
              ? () => {
                  setSearch('');
                  setSelectedCategory('All');
                  setSelectedSeason('All');
                  setSelectedOccasion('All');
                  setSelectedColor('All');
                  setOnlyFavorites(false);
                }
              : handleOpenAdd
          }
        />
      ) : (
        <div className="clothing-grid">
          {items.map((item) => (
            <ClothingCard
              key={item._id}
              item={item}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Clothing Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Clothing Item' : 'Digitize New Piece'}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="clothing-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditModalOpen ? 'Save Changes' : 'Add to Wardrobe'}
            </button>
          </>
        }
      >
        <form id="clothing-form" onSubmit={handleSaveItem}>
          {/* Upload Method Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${uploadType === 'file' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setUploadType('file')}
            >
              <Upload size={14} /> Local File Upload (Multer)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${uploadType === 'url' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setUploadType('url')}
            >
              <LinkIcon size={14} /> Image URL
            </button>
          </div>

          {uploadType === 'file' ? (
            <div className="form-group">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <div className="upload-preview-container">
                  <img src={previewUrl} alt="Preview" className="upload-preview-img" />
                  <button
                    type="button"
                    className="upload-remove-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} color="var(--accent-lavender-dark)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      Click to upload photo
                    </div>
                    <div className="form-hint">JPG, PNG, WebP up to 5MB</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setPreviewUrl(e.target.value);
                }}
              />
              {previewUrl && (
                <div className="upload-preview-container" style={{ marginTop: '0.75rem' }}>
                  <img src={previewUrl} alt="Preview" className="upload-preview-img" />
                </div>
              )}
            </div>
          )}

          {/* Name & Brand */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Piece Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Silk Crepe Blouse"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand / Designer</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Toteme, Prada"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          {/* Category & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Oatmeal, Charcoal, Ivory"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          {/* Season & Occasion */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Season</label>
              <select
                className="form-select"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              >
                {SEASONS.filter((s) => s !== 'All').map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Occasion</label>
              <select
                className="form-select"
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              >
                {OCCASIONS.filter((o) => o !== 'All').map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Care Notes & Styling Tips</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. 100% cashmere, dry clean only. Pairs effortlessly with pleated wool trousers."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          {/* Favorite Toggle Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="isFavorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--text-primary)' }}
            />
            <label htmlFor="isFavorite" style={{ fontSize: '0.88rem', cursor: 'pointer', userSelect: 'none' }}>
              Mark as Wardrobe Hero / Favorite Piece
            </label>
          </div>
        </form>
      </Modal>

      {/* View Item Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={activeItem?.name || 'Piece Details'}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                setIsViewModalOpen(false);
                handleOpenEdit(activeItem);
              }}
            >
              Edit Piece
            </button>
            <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>
              Close
            </button>
          </div>
        }
      >
        {activeItem && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '280px' }}>
                <img
                  src={getFullImageUrl(activeItem.imageUrl)}
                  alt={activeItem.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {activeItem.brand && (
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-lavender-dark)' }}>
                    {activeItem.brand}
                  </div>
                )}
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>
                  {activeItem.name}
                </h3>

                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-dark">{activeItem.category}</span>
                  <span className="badge badge-lavender">{activeItem.season}</span>
                  <span className="badge badge-default">{activeItem.occasion}</span>
                  {activeItem.color && <span className="badge badge-default">{activeItem.color}</span>}
                  {activeItem.isFavorite && <span className="badge badge-gold">★ Favorite</span>}
                </div>

                {activeItem.notes && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <strong>Notes:</strong> {activeItem.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Linked Outfits Section */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                Styled In Outfits ({linkedOutfits.length})
              </h4>
              {linkedOutfits.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  This item has not yet been included in any saved outfits.
                </p>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {linkedOutfits.map((outfit) => (
                    <span key={outfit._id} className="badge badge-default" style={{ padding: '0.4rem 0.75rem' }}>
                      {outfit.name} ({outfit.occasion})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteItem}
        title="Remove Piece from Wardrobe?"
        message={`Are you sure you want to delete "${activeItem?.name}"? It will also be removed from any outfits that include it.`}
        confirmText="Yes, Delete Piece"
        loading={submitting}
      />
    </div>
  );
};

export default WardrobePage;

