const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema(
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
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'],
        message: '{VALUE} is not a valid category',
      },
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide an image for the clothing item'],
    },
    color: {
      type: String,
      trim: true,
      default: 'Neutral',
    },
    season: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'],
      default: 'All-Season',
    },
    occasion: {
      type: String,
      enum: ['Casual', 'Work', 'Formal', 'Party', 'Sport', 'Loungewear'],
      default: 'Casual',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

clothingItemSchema.index({ userId: 1, category: 1 });
clothingItemSchema.index({ userId: 1, isFavorite: 1 });

module.exports = mongoose.model('ClothingItem', clothingItemSchema);

