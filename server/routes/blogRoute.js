const express = require('express');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const { 
  createBlog, 
  getAllBlogs, 
  getBlogById, 
  updateBlog, 
  deleteBlog, 
  voteBlog 
} = require('../controllers/blogController');
const { 
  getAllBlogsAdmin, 
  updateBlogVisibility 
} = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

// Public routes
router.get('/', getAllBlogs);

// Protected routes
router.post('/add', isLoggedIn, upload.single('picture'), createBlog);
router.get('/:id', isLoggedIn, getBlogById);
router.post('/update/:id', isLoggedIn, upload.single('picture'), updateBlog);
router.post('/delete/:id', isLoggedIn, deleteBlog);
router.post('/vote/:id', isLoggedIn, voteBlog);

// Admin only routes
router.get('/admin/all', isLoggedIn, isAdmin, getAllBlogsAdmin);
router.post('/admin/visibility/:blogId', isLoggedIn, isAdmin, updateBlogVisibility);

module.exports = router;