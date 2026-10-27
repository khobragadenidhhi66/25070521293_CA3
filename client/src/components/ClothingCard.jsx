import React from 'react';
import { Heart, Edit2, Trash2, Eye } from 'lucide-react';

const ClothingCard = ({
  item,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  selectable = false,
  isSelected = false,
  onSelect,
}) => {
  const getFullImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
    if (url.startsWith('/uploads/')) {
      const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendBase}${url}`;
    }
    return url;
  };

  return (
    <div
      className={`clothing-card ${isSelected ? 'selected' : ''}`}
      onClick={() => {
        if (selectable && onSelect) onSelect(item);
      }}
      style={{ cursor: selectable ? 'pointer' : 'default' }}
    >
      <div className="clothing-card-image-wrapper">
        <img
          src={getFullImageUrl(item.imageUrl)}
          alt={item.name}
          className="clothing-card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80';
          }}
        />
        <span className="clothing-card-category-tag">{item.category}</span>
        
        {onToggleFavorite && (
          <button
            className={`clothing-favorite-btn ${item.isFavorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item);
            }}
            title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={item.isFavorite ? '#e53935' : 'none'} />
          </button>
        )}
      </div>

      <div className="clothing-card-body">
        {item.brand && <div className="clothing-card-brand">{item.brand}</div>}
        <h4 className="clothing-card-name" title={item.name}>
          {item.name}
        </h4>

        <div className="clothing-card-meta">
          {item.color && (
            <span className="badge badge-default" style={{ fontSize: '0.68rem' }}>
              {item.color}
            </span>
          )}
          {item.season && (
            <span className="badge badge-lavender" style={{ fontSize: '0.68rem' }}>
              {item.season}
            </span>
          )}
          {item.occasion && (
            <span className="badge badge-default" style={{ fontSize: '0.68rem' }}>
              {item.occasion}
            </span>
          )}
        </div>
      </div>

      {!selectable && (
        <div className="clothing-card-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onView && onView(item);
            }}
            title="View details"
          >
            <Eye size={15} />
            <span>Details</span>
          </button>
          
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {onEdit && (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                title="Edit item"
              >
                <Edit2 size={15} />
              </button>
            )}
            {onDelete && (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: 'var(--status-error)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                title="Delete item"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClothingCard;

