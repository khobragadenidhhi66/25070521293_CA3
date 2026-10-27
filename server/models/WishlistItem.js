const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    productUrl: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories', 'Other'],
      default: 'Other',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

wishlistItemSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);

