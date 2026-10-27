import React from 'react';
import { Heart, Calendar, Share2, Edit2, Trash2, Eye } from 'lucide-react';

const OutfitCard = ({
  outfit,
  onView,
  onEdit,
  onDelete,
  onSchedule,
  onShare,
  onToggleFavorite,
}) => {
  const getFullImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
    if (url.startsWith('/uploads/')) {
      const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendBase}${url}`;
    }
    return url;
  };

  const items = outfit.clothingItems || [];
  const previewItems = items.slice(0, 3);

  return (
    <div className="outfit-card">
      <div className="outfit-card-mosaic">
        {previewItems.map((item, idx) => (
          <img
            key={item._id || idx}
            src={getFullImageUrl(item.imageUrl)}
            alt={item.name}
            className="outfit-mosaic-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
            }}
          />
        ))}
        {items.length > 3 && (
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
            +{items.length - 3} more
          </div>
        )}

        {onToggleFavorite && (
          <button
            className={`clothing-favorite-btn ${outfit.isFavorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(outfit);
            }}
            title={outfit.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={outfit.isFavorite ? '#e53935' : 'none'} />
          </button>
        )}
      </div>

      <div className="outfit-card-body">
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-lavender">{outfit.occasion}</span>
          <span className="badge badge-default">{outfit.season}</span>
          <span className="badge badge-dark">{items.length} items</span>
        </div>

        <h3 className="outfit-card-name">{outfit.name}</h3>
        {outfit.description && (
          <p className="outfit-card-desc">{outfit.description}</p>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ flex: 1 }}
            onClick={() => onView && onView(outfit)}
          >
            <Eye size={14} />
            <span>Lookbook</span>
          </button>

          {onSchedule && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onSchedule(outfit)}
              title="Schedule on calendar"
            >
              <Calendar size={15} />
            </button>
          )}

          {onShare && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onShare(outfit)}
              title="Publish to community"
            >
              <Share2 size={15} />
            </button>
          )}

          {onEdit && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onEdit(outfit)}
              title="Edit outfit"
            >
              <Edit2 size={15} />
            </button>
          )}

          {onDelete && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              style={{ color: 'var(--status-error)' }}
              onClick={() => onDelete(outfit)}
              title="Delete outfit"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;

