const express = require('express');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const { 
  findMatch, 
  submitMatchCode, 
  cancelMatch, 
  allMatches, 
  matchById
} = require('../controllers/matchController');
const { 
  cancelMatchAdmin 
} = require('../controllers/adminController');
const router = express.Router();

// Protected routes
router.post('/findMatch', isLoggedIn, findMatch);
router.post('/cancelMatch', isLoggedIn, cancelMatch);
router.post('/submit/:matchId', isLoggedIn, submitMatchCode);
router.get('/all', isLoggedIn, allMatches);
router.get('/info/:matchId', isLoggedIn, matchById);

// Admin only routes
router.post('/admin/cancel/:matchId', isLoggedIn, isAdmin, cancelMatchAdmin);

module.exports = router;