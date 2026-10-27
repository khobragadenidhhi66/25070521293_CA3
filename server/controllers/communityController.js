const CommunityPost = require('../models/CommunityPost');
const Outfit = require('../models/Outfit');

// @desc    Get community feed posts with pagination and filters
// @route   GET /api/community
// @access  Public (or authenticated for user like flags)
exports.getCommunityFeed = async (req, res, next) => {
  try {
    const { occasion, season, sort, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch posts with populated author and outfit
    let posts = await CommunityPost.find()
      .populate('userId', 'name profileImage bio')
      .populate({
        path: 'outfitId',
        populate: {
          path: 'clothingItems',
          select: 'name category imageUrl color brand occasion season',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out posts whose outfit was deleted
    posts = posts.filter((post) => post.outfitId && post.userId);

    // Apply filters on outfit attributes if provided
    if (occasion && occasion !== 'All') {
      posts = posts.filter(
        (p) => p.outfitId && p.outfitId.occasion.toLowerCase() === occasion.toLowerCase()
      );
    }
    if (season && season !== 'All') {
      posts = posts.filter(
        (p) => p.outfitId && p.outfitId.season.toLowerCase() === season.toLowerCase()
      );
    }

    // Sort
    if (sort === 'most-liked') {
      posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (sort === 'oldest') {
      posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    const total = posts.length;
    const paginatedPosts = posts.slice(skip, skip + limitNum);

    // Format post data and mark if current user has liked it
    const currentUserId = req.user ? req.user._id.toString() : null;

    const formattedPosts = paginatedPosts.map((post) => {
      const isLiked = currentUserId
        ? post.likes.some((id) => id.toString() === currentUserId)
        : false;

      return {
        _id: post._id,
        caption: post.caption,
        createdAt: post.createdAt,
        author: {
          _id: post.userId._id,
          name: post.userId.name,
          profileImage: post.userId.profileImage,
          bio: post.userId.bio,
        },
        outfit: {
          _id: post.outfitId._id,
          name: post.outfitId.name,
          description: post.outfitId.description,
          occasion: post.outfitId.occasion,
          season: post.outfitId.season,
          clothingItems: post.outfitId.clothingItems,
        },
        likesCount: post.likes.length,
        isLiked,
        isAuthor: currentUserId === post.userId._id.toString(),
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      posts: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish an outfit to the community
// @route   POST /api/community
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { outfitId, caption } = req.body;

    if (!outfitId) {
      return res.status(400).json({
        success: false,
        message: 'Please select an outfit to share.',
      });
    }

    // Verify outfit ownership
    const outfit = await Outfit.findOne({
      _id: outfitId,
      userId: req.user._id,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found or does not belong to you.',
      });
    }

    const post = await CommunityPost.create({
      userId: req.user._id,
      outfitId: outfit._id,
      caption: caption ? caption.trim() : '',
      likes: [],
    });

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('userId', 'name profileImage bio')
      .populate({
        path: 'outfitId',
        populate: {
          path: 'clothingItems',
          select: 'name category imageUrl color brand occasion season',
        },
      });

    res.status(201).json({
      success: true,
      message: 'Outfit shared to the community!',
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete community post
// @route   DELETE /api/community/:id
// @access  Private (author only)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    // Check ownership
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post.',
      });
    }

    await CommunityPost.deleteOne({ _id: post._id });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / unlike a community post
// @route   POST /api/community/:id/like
// @access  Private
exports.toggleLikePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const userIdStr = req.user._id.toString();
    const alreadyLikedIndex = post.likes.findIndex(
      (id) => id.toString() === userIdStr
    );

    let isLiked = false;
    if (alreadyLikedIndex > -1) {
      // User already liked -> unlike
      post.likes.splice(alreadyLikedIndex, 1);
      isLiked = false;
    } else {
      // User has not liked -> like
      post.likes.push(req.user._id);
      isLiked = true;
    }

    await post.save();

    res.status(200).json({
      success: true,
      isLiked,
      likesCount: post.likes.length,
      message: isLiked ? 'Liked post' : 'Unliked post',
    });
  } catch (error) {
    next(error);
  }
};

