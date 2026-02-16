const express = require("express");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const { 
  runCode, 
  submitCode, 
  userSubmissions, 
  getAllSubmissions 
} = require("../controllers/submissionController");
const { 
  getSubmissionById, 
  rejudgeSubmission 
} = require("../controllers/adminController");
const router = express.Router();

// Protected routes
router.post('/run', isLoggedIn, runCode);
router.post('/submit', isLoggedIn, submitCode);
router.get('/', isLoggedIn, userSubmissions);
router.get('/info/:submissionId', isLoggedIn, getSubmissionById);

// Admin only routes
router.get('/all', isLoggedIn,isAdmin, getAllSubmissions);
router.post('/admin/rejudge/:submissionId', isLoggedIn, isAdmin, rejudgeSubmission);

module.exports = router;