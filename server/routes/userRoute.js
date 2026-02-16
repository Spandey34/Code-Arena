const express = require('express');
const { 
  createUser, 
  loginUser, 
  changePassword, 
  getUserDetails, 
  leaderboard, 
  logoutUser, 
  allDetails, 
  userStats
} = require('../controllers/userController');
const { updateUserRole, deleteUser, banUser } = require('../controllers/adminController');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/leaderboard', leaderboard);

// Protected routes
router.get('/', isLoggedIn, allDetails);
router.post('/changePassword', isLoggedIn, changePassword);
router.get('/info/:id', isLoggedIn, getUserDetails);
router.get('/stats', isLoggedIn, userStats);

// Admin only routes
router.post('/update-role/:userId', isLoggedIn, isAdmin, updateUserRole);
router.delete('/:userId', isLoggedIn, isAdmin, deleteUser);
router.post('/ban/:userId', isLoggedIn, isAdmin, banUser);

module.exports = router;