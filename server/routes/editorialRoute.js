const express = require("express");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const { 
  createEditorial, 
  getEditorialById, 
  getEditorialsByProblem, 
  updateEditorial, 
  deleteEditorial, 
  voteEditorial 
} = require("../controllers/editorialController");
const { 
  getAllEditorialsAdmin, 
  updateEditorialStatus 
} = require("../controllers/adminController");
const router = express.Router();

// Protected routes
router.post('/add', isLoggedIn, createEditorial);
router.get('/problem/:problemId', isLoggedIn, getEditorialsByProblem);
router.get('/:id', isLoggedIn, getEditorialById);
router.post('/update/:id', isLoggedIn, updateEditorial);
router.post('/delete/:id', isLoggedIn, deleteEditorial);
router.post('/vote/:id', isLoggedIn, voteEditorial);

// Admin only routes
router.get('/admin/all', isLoggedIn, isAdmin, getAllEditorialsAdmin);
router.post('/admin/status/:editorialId', isLoggedIn, isAdmin, updateEditorialStatus);

module.exports = router;