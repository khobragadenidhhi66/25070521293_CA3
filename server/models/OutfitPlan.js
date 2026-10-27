const mongoose = require('mongoose');

const outfitPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    outfitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit',
      required: [true, 'Please select an outfit to plan'],
    },
    plannedDate: {
      type: Date,
      required: [true, 'Please provide a planned date'],
    },
    dateString: {
      type: String, // 'YYYY-MM-DD' for accurate day matching and duplicate detection
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent accidental duplicate plans for the same user, outfit and date
outfitPlanSchema.index({ userId: 1, outfitId: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('OutfitPlan', outfitPlanSchema);

