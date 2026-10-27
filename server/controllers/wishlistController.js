const WishlistItem = require('../models/WishlistItem');
const ClothingItem = require('../models/ClothingItem');

// @desc    Get all wishlist items for logged in user
// @route   GET /api/wishlist
// @access  Private
exports.getWishlistItems = async (req, res, next) => {
  try {
    const { category, sort, search } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { notes: searchRegex }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'name-asc') {
      sortOption = { name: 1 };
    }

    const items = await WishlistItem.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.createWishlistItem = async (req, res, next) => {
  try {
    const { name, imageUrl, price, productUrl, category, notes } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide an item name.',
      });
    }

    const item = await WishlistItem.create({
      userId: req.user._id,
      name: name.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80',
      price: Number(price) || 0,
      productUrl: productUrl ? productUrl.trim() : '',
      category: category || 'Other',
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update wishlist item
// @route   PUT /api/wishlist/:id
// @access  Private
exports.updateWishlistItem = async (req, res, next) => {
  try {
    const item = await WishlistItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found.',
      });
    }

    const { name, imageUrl, price, productUrl, category, notes } = req.body;

    if (name) item.name = name.trim();
    if (imageUrl !== undefined) item.imageUrl = imageUrl.trim();
    if (price !== undefined) item.price = Number(price) || 0;
    if (productUrl !== undefined) item.productUrl = productUrl.trim();
    if (category) item.category = category;
    if (notes !== undefined) item.notes = notes.trim();

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist item updated successfully.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete wishlist item
// @route   DELETE /api/wishlist/:id
// @access  Private
exports.deleteWishlistItem = async (req, res, next) => {
  try {
    const item = await WishlistItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found.',
      });
    }

    await WishlistItem.deleteOne({ _id: item._id });

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert wishlist item to wardrobe clothing item
// @route   POST /api/wishlist/:id/convert
// @access  Private
exports.convertToWardrobe = async (req, res, next) => {
  try {
    const item = await WishlistItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found.',
      });
    }

    const { category, color, season, occasion, brand } = req.body;

    // Create clothing item
    const clothingItem = await ClothingItem.create({
      userId: req.user._id,
      name: item.name,
      category: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'].includes(category || item.category)
        ? (category || item.category)
        : 'Tops',
      imageUrl: item.imageUrl,
      color: color || 'Neutral',
      season: season || 'All-Season',
      occasion: occasion || 'Casual',
      brand: brand || '',
      notes: `Acquired from wishlist! ${item.notes || ''}`.trim(),
      isFavorite: false,
    });

    // Remove from wishlist
    await WishlistItem.deleteOne({ _id: item._id });

    res.status(201).json({
      success: true,
      message: `"${item.name}" moved to your Wardrobe!`,
      clothingItem,
    });
  } catch (error) {
    next(error);
  }
};

