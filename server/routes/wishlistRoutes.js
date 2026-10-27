const express = require('express');
const router = express.Router();
const {
  getWishlistItems,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  convertToWardrobe,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getWishlistItems)
  .post(createWishlistItem);

router
  .route('/:id')
  .put(updateWishlistItem)
  .delete(deleteWishlistItem);

router.post('/:id/convert', convertToWardrobe);

module.exports = router;

