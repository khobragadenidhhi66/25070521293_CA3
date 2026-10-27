const Outfit = require('../models/Outfit');
const OutfitPlan = require('../models/OutfitPlan');
const CommunityPost = require('../models/CommunityPost');
const ClothingItem = require('../models/ClothingItem');

// @desc    Get all outfits for logged in user
// @route   GET /api/outfits
// @access  Private
exports.getOutfits = async (req, res, next) => {
  try {
    const { search, season, occasion, isFavorite, sort } = req.query;

    const query = { userId: req.user._id };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    if (season && season !== 'All') {
      query.season = season;
    }

    if (occasion && occasion !== 'All') {
      query.occasion = occasion;
    }

    if (isFavorite === 'true') {
      query.isFavorite = true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name-asc') {
      sortOption = { name: 1 };
    } else if (sort === 'name-desc') {
      sortOption = { name: -1 };
    }

    const outfits = await Outfit.find(query)
      .sort(sortOption)
      .populate('clothingItems');

    res.status(200).json({
      success: true,
      count: outfits.length,
      outfits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single outfit by ID
// @route   GET /api/outfits/:id
// @access  Private
exports.getOutfitById = async (req, res, next) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('clothingItems');

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found.',
      });
    }

    // Also get scheduled dates
    const plans = await OutfitPlan.find({
      userId: req.user._id,
      outfitId: outfit._id,
    }).sort({ plannedDate: 1 });

    res.status(200).json({
      success: true,
      outfit,
      plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new outfit
// @route   POST /api/outfits
// @access  Private
exports.createOutfit = async (req, res, next) => {
  try {
    const { name, description, clothingItems, occasion, season, isFavorite, scheduledDate } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name for the outfit.',
      });
    }

    if (!clothingItems || !Array.isArray(clothingItems) || clothingItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one clothing item for this outfit.',
      });
    }

    // Verify all clothing items belong to current user
    const validItems = await ClothingItem.find({
      _id: { $in: clothingItems },
      userId: req.user._id,
    });

    if (validItems.length !== clothingItems.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected clothing items are invalid or do not belong to you.',
      });
    }

    const outfit = await Outfit.create({
      userId: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      clothingItems,
      occasion: occasion || 'Casual',
      season: season || 'All-Season',
      isFavorite: Boolean(isFavorite),
    });

    // If an optional date was provided in builder, schedule it on the calendar
    if (scheduledDate) {
      try {
        const dateObj = new Date(scheduledDate);
        const dateString = dateObj.toISOString().split('T')[0];
        await OutfitPlan.create({
          userId: req.user._id,
          outfitId: outfit._id,
          plannedDate: dateObj,
          dateString,
          notes: `Scheduled during outfit creation`,
        });
      } catch (planErr) {
        console.warn('Could not auto-schedule outfit:', planErr.message);
      }
    }

    const populatedOutfit = await Outfit.findById(outfit._id).populate('clothingItems');

    res.status(201).json({
      success: true,
      message: 'Outfit created successfully.',
      outfit: populatedOutfit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update outfit
// @route   PUT /api/outfits/:id
// @access  Private
exports.updateOutfit = async (req, res, next) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found.',
      });
    }

    const { name, description, clothingItems, occasion, season, isFavorite } = req.body;

    if (name) outfit.name = name.trim();
    if (description !== undefined) outfit.description = description.trim();
    if (occasion) outfit.occasion = occasion;
    if (season) outfit.season = season;
    if (isFavorite !== undefined) outfit.isFavorite = Boolean(isFavorite);

    if (clothingItems) {
      if (!Array.isArray(clothingItems) || clothingItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'An outfit must contain at least one clothing item.',
        });
      }

      const validItems = await ClothingItem.find({
        _id: { $in: clothingItems },
        userId: req.user._id,
      });

      if (validItems.length !== clothingItems.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected clothing items are invalid or do not belong to you.',
        });
      }

      outfit.clothingItems = clothingItems;
    }

    await outfit.save();

    const populatedOutfit = await Outfit.findById(outfit._id).populate('clothingItems');

    res.status(200).json({
      success: true,
      message: 'Outfit updated successfully.',
      outfit: populatedOutfit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete outfit
// @route   DELETE /api/outfits/:id
// @access  Private
exports.deleteOutfit = async (req, res, next) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found.',
      });
    }

    // Clean up calendar plans and community posts linked to this outfit
    await OutfitPlan.deleteMany({ outfitId: outfit._id });
    await CommunityPost.deleteMany({ outfitId: outfit._id });

    await Outfit.deleteOne({ _id: outfit._id });

    res.status(200).json({
      success: true,
      message: 'Outfit deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite on outfit
// @route   PATCH /api/outfits/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found.',
      });
    }

    outfit.isFavorite = !outfit.isFavorite;
    await outfit.save();

    res.status(200).json({
      success: true,
      isFavorite: outfit.isFavorite,
      message: outfit.isFavorite ? 'Outfit favorited' : 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

