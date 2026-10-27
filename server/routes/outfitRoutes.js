const express = require('express');
const router = express.Router();
const {
  getOutfits,
  getOutfitById,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  toggleFavorite,
} = require('../controllers/outfitController');
const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getOutfits)
  .post(createOutfit);

router
  .route('/:id')
  .get(getOutfitById)
  .put(updateOutfit)
  .delete(deleteOutfit);

router.patch('/:id/favorite', toggleFavorite);

module.exports = router;

