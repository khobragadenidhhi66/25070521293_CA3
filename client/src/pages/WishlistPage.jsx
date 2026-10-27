import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle,
  Heart,
  Shirt,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { wishlistService } from '../services/wishlistService';
import { clothingService } from '../services/clothingService';
import { outfitService } from '../services/outfitService';
import { useToast } from '../context/ToastContext';
import ClothingCard from '../components/ClothingCard';
import OutfitCard from '../components/OutfitCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories', 'Other'];

const WishlistPage = () => {
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('wishlist'); // 'wishlist' or 'favorites'
  const [loading, setLoading] = useState(true);

  // Wishlist items
  const [wishlistItems, setWishlistItems] = useState([]);
  const [favoriteClothes, setFavoriteClothes] = useState([]);
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);

  // Wishlist Add/Edit Modal
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [editingWishlistId, setEditingWishlistId] = useState(null);
  const [wishlistForm, setWishlistForm] = useState({
    name: '',
    imageUrl: '',
    price: '',
    productUrl: '',
    category: 'Tops',
    notes: '',
  });

  // Convert to Wardrobe Modal
  const [convertingItem, setConvertingItem] = useState(null);
  const [convertForm, setConvertForm] = useState({
    category: 'Tops',
    color: 'Neutral',
    season: 'All-Season',
    occasion: 'Casual',
    brand: '',
  });

  // Delete Dialog
  const [itemToDelete, setItemToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWishlistAndFavorites = async () => {
    try {
      setLoading(true);
      const [wishlistRes, clothesRes, outfitsRes] = await Promise.all([
        wishlistService.getAll(),
        clothingService.getAll({ isFavorite: 'true' }),
        outfitService.getAll({ isFavorite: 'true' }),
      ]);

      if (wishlistRes.success) setWishlistItems(wishlistRes.items);
      if (clothesRes.success) setFavoriteClothes(clothesRes.items);
      if (outfitsRes.success) setFavoriteOutfits(outfitsRes.outfits);
    } catch (err) {
      console.error('Error fetching wishlist & favorites:', err);
      showError('Failed to load wishlist items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistAndFavorites();
  }, []);

  const handleOpenAddWishlist = () => {
    setEditingWishlistId(null);
    setWishlistForm({
      name: '',
      imageUrl: '',
      price: '',
      productUrl: '',
      category: 'Tops',
      notes: '',
    });
    setIsWishlistModalOpen(true);
  };

  const handleOpenEditWishlist = (item) => {
    setEditingWishlistId(item._id);
    setWishlistForm({
      name: item.name,
      imageUrl: item.imageUrl || '',
      price: item.price ? String(item.price) : '',
      productUrl: item.productUrl || '',
      category: item.category || 'Tops',
      notes: item.notes || '',
    });
    setIsWishlistModalOpen(true);
  };

  const handleSaveWishlist = async (e) => {
    e.preventDefault();
    if (!wishlistForm.name.trim()) {
      showError('Please enter an item name.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: wishlistForm.name.trim(),
        imageUrl: wishlistForm.imageUrl.trim() || undefined,
        price: wishlistForm.price ? parseFloat(wishlistForm.price) : 0,
        productUrl: wishlistForm.productUrl.trim(),
        category: wishlistForm.category,
        notes: wishlistForm.notes.trim(),
      };

      if (editingWishlistId) {
        await wishlistService.update(editingWishlistId, payload);
        showSuccess('Wishlist item updated.');
      } else {
        await wishlistService.create(payload);
        showSuccess('Item added to your shopping wishlist!');
      }

      setIsWishlistModalOpen(false);
      fetchWishlistAndFavorites();
    } catch (err) {
      showError('Could not save wishlist item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWishlistItem = async () => {
    if (!itemToDelete) return;
    try {
      setSubmitting(true);
      await wishlistService.delete(itemToDelete._id);
      showSuccess(`"${itemToDelete.name}" removed from wishlist.`);
      setItemToDelete(null);
      fetchWishlistAndFavorites();
    } catch (err) {
      showError('Failed to delete wishlist item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConvert = (item) => {
    setConvertingItem(item);
    setConvertForm({
      category: item.category !== 'Other' ? item.category : 'Tops',
      color: 'Neutral',
      season: 'All-Season',
      occasion: 'Casual',
      brand: '',
    });
  };

  const handleConfirmConvert = async (e) => {
    e.preventDefault();
    if (!convertingItem) return;

    try {
      setSubmitting(true);
      await wishlistService.convertToWardrobe(convertingItem._id, convertForm);
      showSuccess(`🎉 "${convertingItem.name}" acquired and added to your wardrobe!`);
      setConvertingItem(null);
      fetchWishlistAndFavorites();
    } catch (err) {
      showError('Could not convert item to wardrobe.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="editorial-tag" style={{ marginBottom: '0.4rem' }}>
            Curation & Acquired Pieces
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600 }}>
            Wishlist & Favorites
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Keep track of aspirational designer pieces and quickly access your favorite wardrobe looks.
          </p>
        </div>

        {activeTab === 'wishlist' && (
          <button className="btn btn-primary" onClick={handleOpenAddWishlist}>
            <Plus size={16} /> Add Wishlist Piece
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Shopping Wishlist ({wishlistItems.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Signature Favorites ({favoriteClothes.length + favoriteOutfits.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your curated list..." />
      ) : activeTab === 'wishlist' ? (
        /* ================= TAB 1: SHOPPING WISHLIST ================= */
        <div>
          {wishlistItems.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Your wishlist is empty"
              description="Save dream items, investment bags, and upcoming seasonal buys with prices and links."
              actionLabel="Add Wishlist Piece"
              onAction={handleOpenAddWishlist}
            />
          ) : (
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item._id} className="wishlist-card">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80'
                    }
                    alt={item.name}
                    className="wishlist-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  <div className="wishlist-body">
                    <span className="badge badge-lavender" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                      {item.category}
                    </span>

                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600 }}>
                      {item.name}
                    </h3>

                    {item.price > 0 && (
                      <div className="wishlist-price">
                        ${item.price.toLocaleString()}
                      </div>
                    )}

                    {item.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontStyle: 'italic', lineHeight: '1.5' }}>
                        "{item.notes}"
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      {/* Move to Wardrobe button */}
                      <button
                        className="btn btn-secondary btn-sm w-full"
                        onClick={() => handleOpenConvert(item)}
                        title="Acquired this item? Move to your active wardrobe!"
                      >
                        <CheckCircle size={15} /> Moved to Wardrobe!
                      </button>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {item.productUrl ? (
                          <a
                            href={item.productUrl.startsWith('http') ? item.productUrl : `https://${item.productUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            <ExternalLink size={13} /> View Store
                          </a>
                        ) : (
                          <span />
                        )}

                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleOpenEditWishlist(item)}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--status-error)' }}
                            onClick={() => setItemToDelete(item)}
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= TAB 2: FAVORITES ================= */
        <div>
          {/* Favorite Outfits */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, marginBottom: '1rem' }}>
              Signature Curated Outfits ({favoriteOutfits.length})
            </h3>
            {favoriteOutfits.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No favorite outfits yet. Click the heart icon on any outfit in the builder to add it here.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
                {favoriteOutfits.map((outfit) => (
                  <OutfitCard
                    key={outfit._id}
                    outfit={outfit}
                    onToggleFavorite={async () => {
                      await outfitService.toggleFavorite(outfit._id);
                      fetchWishlistAndFavorites();
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Favorite Wardrobe Clothes */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, marginBottom: '1rem' }}>
              Wardrobe Hero Pieces ({favoriteClothes.length})
            </h3>
            {favoriteClothes.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No favorite clothing items marked yet. Heart items in your wardrobe to bookmark them.
              </p>
            ) : (
              <div className="clothing-grid">
                {favoriteClothes.map((item) => (
                  <ClothingCard
                    key={item._id}
                    item={item}
                    onToggleFavorite={async () => {
                      await clothingService.toggleFavorite(item._id);
                      fetchWishlistAndFavorites();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Wishlist Item Modal */}
      <Modal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        title={editingWishlistId ? 'Edit Wishlist Piece' : 'Add Piece to Wishlist'}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsWishlistModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="wishlist-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingWishlistId ? 'Save Changes' : 'Add to Wishlist'}
            </button>
          </>
        }
      >
        <form id="wishlist-form" onSubmit={handleSaveWishlist}>
          <div className="form-group">
            <label className="form-label">Piece Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. The Row Bourgeoise Knee Boots"
              value={wishlistForm.name}
              onChange={(e) => setWishlistForm({ ...wishlistForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Estimated Price ($)</label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input"
                placeholder="e.g. 1250"
                value={wishlistForm.price}
                onChange={(e) => setWishlistForm({ ...wishlistForm, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={wishlistForm.category}
                onChange={(e) => setWishlistForm({ ...wishlistForm, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={wishlistForm.imageUrl}
              onChange={(e) => setWishlistForm({ ...wishlistForm, imageUrl: e.target.value })}
            />
            {wishlistForm.imageUrl && (
              <div style={{ height: '140px', overflow: 'hidden', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
                <img src={wishlistForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Product / Store URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. https://therow.com/shop/..."
              value={wishlistForm.productUrl}
              onChange={(e) => setWishlistForm({ ...wishlistForm, productUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Curation Notes</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Investment piece for next season, look out for Black Friday private sale."
              value={wishlistForm.notes}
              onChange={(e) => setWishlistForm({ ...wishlistForm, notes: e.target.value })}
              rows={2}
            />
          </div>
        </form>
      </Modal>

      {/* "Moved to Wardrobe!" Conversion Modal */}
      <Modal
        isOpen={!!convertingItem}
        onClose={() => setConvertingItem(null)}
        title="Move Acquired Piece to Wardrobe"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setConvertingItem(null)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="convert-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Converting...' : 'Confirm & Add to Wardrobe'}
            </button>
          </>
        }
      >
        <form id="convert-form" onSubmit={handleConfirmConvert}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            Congratulations on acquiring <strong>"{convertingItem?.name}"</strong>! Fill in any additional details to catalog it inside your digital wardrobe.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Toteme"
                value={convertForm.brand}
                onChange={(e) => setConvertForm({ ...convertForm, brand: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cream, Charcoal"
                value={convertForm.color}
                onChange={(e) => setConvertForm({ ...convertForm, color: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Season</label>
              <select
                className="form-select"
                value={convertForm.season}
                onChange={(e) => setConvertForm({ ...convertForm, season: e.target.value })}
              >
                {['All-Season', 'Spring', 'Summer', 'Fall', 'Winter'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Occasion</label>
              <select
                className="form-select"
                value={convertForm.occasion}
                onChange={(e) => setConvertForm({ ...convertForm, occasion: e.target.value })}
              >
                {['Casual', 'Work', 'Formal', 'Party', 'Sport', 'Loungewear'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteWishlistItem}
        title="Remove Wishlist Item?"
        message={`Are you sure you want to remove "${itemToDelete?.name}" from your wishlist?`}
        confirmText="Remove Item"
        loading={submitting}
      />
    </div>
  );
};

export default WishlistPage;
