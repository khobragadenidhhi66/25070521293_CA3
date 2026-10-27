const express = require('express');
const router = express.Router();
const {
  getClothingItems,
  getClothingItemById,
  createClothingItem,
  updateClothingItem,
  deleteClothingItem,
  toggleFavorite,
} = require('../controllers/clothingController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router
  .route('/')
  .get(getClothingItems)
  .post(upload.single('image'), createClothingItem);

router
  .route('/:id')
  .get(getClothingItemById)
  .put(upload.single('image'), updateClothingItem)
  .delete(deleteClothingItem);

router.patch('/:id/favorite', toggleFavorite);

module.exports = router;

