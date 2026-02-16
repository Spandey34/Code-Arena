const express = require("express");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const { 
  addProblem, 
  updateProblem, 
  toggleProblemVisibility, 
  deleteProblem, 
  getProblemById, 
  getAllProblems, 
  getProblemSubmissions 
} = require("../controllers/problemController");
const { 
  getAllProblemsAdmin, 
  getProblemStats, 
  rejudgeProblem 
} = require("../controllers/adminController");
const router = express.Router();

// Public routes (authenticated)
router.get('/', isLoggedIn, getAllProblems);
router.get('/info/:problemId', isLoggedIn, getProblemById);
router.get('/submissions/:problemId', isLoggedIn, getProblemSubmissions);

// Admin only routes
router.post('/add', isLoggedIn, isAdmin, addProblem);
router.post('/update/:problemId', isLoggedIn, isAdmin, updateProblem);
router.post('/toggle/:problemId', isLoggedIn, isAdmin, toggleProblemVisibility);
router.post('/delete/:problemId', isLoggedIn, isAdmin, deleteProblem);

// Admin management routes
router.get('/admin/all', isLoggedIn, isAdmin, getAllProblemsAdmin);
router.get('/admin/stats/:problemId', isLoggedIn, isAdmin, getProblemStats);
router.post('/admin/rejudge/:problemId', isLoggedIn, isAdmin, rejudgeProblem);

module.exports = router;