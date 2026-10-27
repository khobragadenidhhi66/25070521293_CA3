const fs = require('fs');
const path = require('path');
const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');

// @desc    Get all clothing items for logged in user with filtering & sorting
// @route   GET /api/clothing
// @access  Private
exports.getClothingItems = async (req, res, next) => {
  try {
    const { search, category, color, season, occasion, isFavorite, sort } = req.query;

    const query = { userId: req.user._id };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { color: searchRegex },
        { notes: searchRegex },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (color && color !== 'All') {
      query.color = new RegExp(`^${color}$`, 'i');
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

    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name-asc') {
      sortOption = { name: 1 };
    } else if (sort === 'name-desc') {
      sortOption = { name: -1 };
    }

    const items = await ClothingItem.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single clothing item
// @route   GET /api/clothing/:id
// @access  Private
exports.getClothingItemById = async (req, res, next) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found.',
      });
    }

    // Also find which outfits use this item
    const linkedOutfits = await Outfit.find({
      userId: req.user._id,
      clothingItems: item._id,
    }).select('name occasion season createdAt');

    res.status(200).json({
      success: true,
      item,
      linkedOutfits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new clothing item
// @route   POST /api/clothing
// @access  Private
exports.createClothingItem = async (req, res, next) => {
  try {
    const { name, category, color, season, occasion, brand, notes, isFavorite, imageUrl: bodyImageUrl } = req.body;

    let imageUrl = bodyImageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both an item name and category.',
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file or provide an image URL.',
      });
    }

    const item = await ClothingItem.create({
      userId: req.user._id,
      name: name.trim(),
      category,
      imageUrl,
      color: color ? color.trim() : 'Neutral',
      season: season || 'All-Season',
      occasion: occasion || 'Casual',
      brand: brand ? brand.trim() : '',
      notes: notes ? notes.trim() : '',
      isFavorite: isFavorite === 'true' || isFavorite === true,
    });

    res.status(201).json({
      success: true,
      message: 'Clothing item added to your wardrobe successfully.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update clothing item
// @route   PUT /api/clothing/:id
// @access  Private
exports.updateClothingItem = async (req, res, next) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found.',
      });
    }

    const { name, category, color, season, occasion, brand, notes, isFavorite, imageUrl: bodyImageUrl } = req.body;

    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (color !== undefined) item.color = color.trim();
    if (season) item.season = season;
    if (occasion) item.occasion = occasion;
    if (brand !== undefined) item.brand = brand.trim();
    if (notes !== undefined) item.notes = notes.trim();
    if (isFavorite !== undefined) {
      item.isFavorite = isFavorite === 'true' || isFavorite === true;
    }

    if (req.file) {
      // Remove old local file if it was in /uploads/
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', item.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      item.imageUrl = `/uploads/${req.file.filename}`;
    } else if (bodyImageUrl) {
      item.imageUrl = bodyImageUrl;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Clothing item updated successfully.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete clothing item
// @route   DELETE /api/clothing/:id
// @access  Private
exports.deleteClothingItem = async (req, res, next) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found.',
      });
    }

    // Delete local file if present
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', item.imageUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete local file:', e.message);
        }
      }
    }

    // Remove this item from any outfits that contain it
    await Outfit.updateMany(
      { userId: req.user._id, clothingItems: item._id },
      { $pull: { clothingItems: item._id } }
    );

    await ClothingItem.deleteOne({ _id: item._id });

    res.status(200).json({
      success: true,
      message: 'Clothing item deleted from wardrobe.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite status of a clothing item
// @route   PATCH /api/clothing/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found.',
      });
    }

    item.isFavorite = !item.isFavorite;
    await item.save();

    res.status(200).json({
      success: true,
      isFavorite: item.isFavorite,
      message: item.isFavorite ? 'Saved to favorites' : 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

