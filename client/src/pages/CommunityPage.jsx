import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Plus,
  Heart,
  Share2,
  Trash2,
  Sparkles,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { communityService } from '../services/communityService';
import { outfitService } from '../services/outfitService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const OCCASIONS = ['All', 'Casual', 'Work', 'Formal', 'Party', 'Sport', 'Vacation'];

const CommunityPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [sort, setSort] = useState('recent'); // 'recent' or 'most-liked'

  // User outfits for publish modal
  const [userOutfits, setUserOutfits] = useState([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [postToDelete, setPostToDelete] = useState(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const params = {
        occasion: selectedOccasion !== 'All' ? selectedOccasion : undefined,
        sort,
      };
      const data = await communityService.getFeed(params);
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching community feed:', err);
      showError('Could not load community feed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOutfits = async () => {
    try {
      const data = await outfitService.getAll();
      if (data.success) {
        setUserOutfits(data.outfits || []);
        if (data.outfits?.length > 0) {
          setSelectedOutfitId(data.outfits[0]._id);
        }
      }
    } catch (err) {
      console.warn('Could not load user outfits:', err);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [selectedOccasion, sort]);

  const handleOpenPublish = () => {
    fetchUserOutfits();
    setPostCaption('');
    setIsPublishModalOpen(true);
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();

    if (!selectedOutfitId) {
      showError('Please select one of your outfits to share.');
      return;
    }

    try {
      setSubmitting(true);
      await communityService.createPost({
        outfitId: selectedOutfitId,
        caption: postCaption.trim(),
      });
      showSuccess('Outfit published to the Community Lookbook!');
      setIsPublishModalOpen(false);
      fetchFeed();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not publish post.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (post) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === post._id) {
          const nextLiked = !p.isLiked;
          const nextCount = nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
          return { ...p, isLiked: nextLiked, likesCount: nextCount };
        }
        return p;
      })
    );

    try {
      await communityService.toggleLike(post._id);
    } catch (err) {
      // Revert if error
      fetchFeed();
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      setSubmitting(true);
      await communityService.deletePost(postToDelete._id);
      showSuccess('Post deleted from community feed.');
      setPostToDelete(null);
      fetchFeed();
    } catch (err) {
      showError('Failed to delete post.');
    } finally {
      setSubmitting(false);
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

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Title & Publish button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="editorial-tag" style={{ marginBottom: '0.4rem' }}>
            Social Atelier
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 600 }}>
            Community Lookbook
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Discover curated looks shared by fellow stylists while keeping your unshared wardrobe private.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenPublish}>
          <Share2 size={16} /> Publish Look
        </button>
      </div>

      {/* Filter and Sort bar */}
      <div className="wardrobe-toolbar" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {/* Occasion Filter Pills */}
        <div className="category-pills">
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              className={`category-pill ${selectedOccasion === occ ? 'active' : ''}`}
              onClick={() => setSelectedOccasion(occ)}
            >
              {occ}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="most-liked">Most Loved & Liked</option>
          </select>
        </div>
      </div>

      {/* Community Feed Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching community lookbooks..." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Globe2}
          title="No looks found in the community yet"
          description="Be the first stylist to publish a signature look to inspire others!"
          actionLabel="Publish First Look"
          onAction={handleOpenPublish}
        />
      ) : (
        <div className="community-feed-grid">
          {posts.map((post) => {
            const author = post.author || {};
            const outfit = post.outfit || {};
            const pieces = outfit.clothingItems || [];

            return (
              <article key={post._id} className="community-card">
                {/* Author Header */}
                <div className="community-card-author">
                  <div className="author-info-group">
                    <img
                      src={
                        author.profileImage ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={author.name || 'Author'}
                      className="user-avatar"
                      style={{ width: '42px', height: '42px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        {author.name || 'Anonymous Stylist'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  {post.isAuthor && (
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--status-error)' }}
                      onClick={() => setPostToDelete(post)}
                      title="Delete post"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Outfit Visual Mosaic */}
                <div className="community-card-visual">
                  {pieces.slice(0, 4).map((piece, pIdx) => (
                    <img
                      key={pIdx}
                      src={getFullImageUrl(piece.imageUrl)}
                      alt={piece.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                  ))}
                  {pieces.length > 4 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(18, 18, 20, 0.85)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      +{pieces.length - 4} more
                    </div>
                  )}
                </div>

                {/* Post Body */}
                <div className="community-card-body">
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-lavender">{outfit.occasion || 'Look'}</span>
                    <span className="badge badge-default">{outfit.season || 'All-Season'}</span>
                    <span className="badge badge-dark">{pieces.length} items</span>
                  </div>

                  <h3 className="community-card-title">{outfit.name}</h3>

                  {post.caption && (
                    <p className="community-card-caption">{post.caption}</p>
                  )}

                  {/* Included tags */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {pieces.map((p, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer with Like Button */}
                <div className="community-card-footer">
                  <button
                    className={`like-button ${post.isLiked ? 'liked' : ''}`}
                    onClick={() => handleToggleLike(post)}
                  >
                    <Heart size={18} fill={post.isLiked ? '#e53935' : 'none'} color={post.isLiked ? '#e53935' : 'currentColor'} />
                    <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
                  </button>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    Published from private atelier
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Publish Outfit Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Share Curated Look to Community"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsPublishModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="publish-form"
              className="btn btn-primary"
              disabled={submitting || userOutfits.length === 0}
            >
              {submitting ? 'Publishing...' : 'Publish to Lookbook'}
            </button>
          </>
        }
      >
        <form id="publish-form" onSubmit={handlePublishPost}>
          {userOutfits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                You have not created any outfits yet. Go to the Outfit Architect to create an outfit before sharing!
              </p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Select Outfit to Share *</label>
                <select
                  className="form-select"
                  value={selectedOutfitId}
                  onChange={(e) => setSelectedOutfitId(e.target.value)}
                  required
                >
                  {userOutfits.map((outfit) => (
                    <option key={outfit._id} value={outfit._id}>
                      {outfit.name} ({outfit.occasion} • {outfit.clothingItems?.length || 0} pieces)
                    </option>
                  ))}
                </select>
              </div>

              {selectedOutfitId && (
                <div style={{ marginBottom: '1.25rem' }}>
                  {(() => {
                    const sel = userOutfits.find((o) => o._id === selectedOutfitId);
                    if (!sel) return null;
                    return (
                      <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {sel.clothingItems?.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={getFullImageUrl(item.imageUrl)}
                              alt={item.name}
                              style={{ width: '44px', height: '44px', borderRadius: '4px', objectFit: 'cover' }}
                            />
                          ))}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sel.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {sel.clothingItems?.length || 0} wardrobe pieces included
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Styling Notes / Editorial Caption</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share what inspired this look, fabric pairings, or where you wore it..."
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: '1.5' }}>
                Note: Only this specific outfit and its included pieces will be shared publicly. The rest of your wardrobe remains strictly private to your account.
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Delete Post Confirmation */}
      <ConfirmDialog
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDeletePost}
        title="Delete Community Post?"
        message="Are you sure you want to remove this look from the Community Lookbook? Your original outfit will remain in your wardrobe."
        confirmText="Delete Post"
        loading={submitting}
      />
    </div>
  );
};

export default CommunityPage;

