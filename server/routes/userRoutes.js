const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getUserStats);

module.exports = router;

