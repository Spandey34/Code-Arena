const express = require("express");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const { 
  createContest, 
  getAllContests, 
  getContestById, 
  registerForContest, 
  deleteContest, 
  updateContestStatus, 
  standings, 
  getContestSubmissions, 
  updateContestRatings
} = require("../controllers/contestController");
const { 
  getAllContestsAdmin, 
  getContestStats 
} = require("../controllers/adminController");
const router = express.Router();

// Public routes
router.get('/', getAllContests);

// Protected routes
router.get('/info/:id', isLoggedIn, getContestById);
router.post('/register/:id', isLoggedIn, registerForContest);
router.get('/standings/:id', isLoggedIn, standings);
router.get('/submissions/:id', isLoggedIn, getContestSubmissions);

// Admin only routes
router.post('/add', isLoggedIn, isAdmin, createContest);
router.post('/delete/:id', isLoggedIn, isAdmin, deleteContest);
router.post('/update/:id', isLoggedIn, isAdmin, updateContestStatus);
router.get('/admin/all', isLoggedIn, isAdmin, getAllContestsAdmin);
router.get('/admin/stats/:contestId', isLoggedIn, isAdmin, getContestStats);
router.post('/admin/updateRatings/:contestId', isLoggedIn, isAdmin, updateContestRatings);

module.exports = router;