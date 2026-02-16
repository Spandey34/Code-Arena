const express = require('express');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const { getSystemStats, getRecentActivity, getUserDetailedStats } = require('../controllers/adminController');
const router = express.Router();

// Admin system routes
router.get('/stats',isLoggedIn, isAdmin, getSystemStats);
router.get('/activity', isLoggedIn, isAdmin, getRecentActivity);
router.get('/stats/:userId',isLoggedIn, isAdmin, getUserDetailedStats);

module.exports = router;