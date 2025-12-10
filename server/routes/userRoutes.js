const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, getLeaderboard } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.get('/leaderboard', getLeaderboard);

module.exports = router;