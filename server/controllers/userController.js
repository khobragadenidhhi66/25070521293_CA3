const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');
const OutfitPlan = require('../models/OutfitPlan');
const WishlistItem = require('../models/WishlistItem');
const CommunityPost = require('../models/CommunityPost');

// @desc    Get dashboard metrics & stats for current user
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run parallel queries
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalClothing,
      totalOutfits,
      totalWishlist,
      upcomingPlansCount,
      recentItems,
      recentOutfits,
      categoryStats,
      seasonStats,
      userPosts,
    ] = await Promise.all([
      ClothingItem.countDocuments({ userId }),
      Outfit.countDocuments({ userId }),
      WishlistItem.countDocuments({ userId }),
      OutfitPlan.countDocuments({
        userId,
        dateString: { $gte: todayStr },
      }),
      ClothingItem.find({ userId })
        .sort({ createdAt: -1 })
        .limit(6),
      Outfit.find({ userId })
        .sort({ createdAt: -1 })
        .limit(4)
        .populate('clothingItems'),
      ClothingItem.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      ClothingItem.aggregate([
        { $match: { userId } },
        { $group: { _id: '$season', count: { $sum: 1 } } },
      ]),
      CommunityPost.find({ userId }),
    ]);

    const totalLikesReceived = userPosts.reduce(
      (sum, post) => sum + (post.likes ? post.likes.length : 0),
      0
    );

    res.status(200).json({
      success: true,
      stats: {
        totalClothing,
        totalOutfits,
        totalWishlist,
        upcomingPlansCount,
        communityPostsCount: userPosts.length,
        totalLikesReceived,
        categoryBreakdown: categoryStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        seasonBreakdown: seasonStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
      recentItems,
      recentOutfits,
    });
  } catch (error) {
    next(error);
  }
};

