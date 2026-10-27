const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getCommunityFeed,
  createPost,
  deletePost,
  toggleLikePost,
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

// Optional auth middleware so logged-in users get `isLiked` accurate while visitors can still browse
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'closetiq_super_secret_jwt_key_2026_fashion_tech'
      );
      req.user = await User.findById(decoded.id).select('-passwordHash');
    } catch (e) {
      // Continue as guest if token invalid
      req.user = null;
    }
  }
  next();
};

router.get('/', optionalAuth, getCommunityFeed);
router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLikePost);

module.exports = router;

