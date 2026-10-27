const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an outfit name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    clothingItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClothingItem',
        required: true,
      },
    ],
    occasion: {
      type: String,
      enum: ['Casual', 'Work', 'Formal', 'Party', 'Sport', 'Loungewear', 'Vacation', 'Special Event'],
      default: 'Casual',
    },
    season: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'],
      default: 'All-Season',
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

outfitSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Outfit', outfitSchema);

