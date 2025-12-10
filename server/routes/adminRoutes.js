const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { addProblem, updateProblem, deleteProblem } = require('../controllers/adminController');

router.post('/problems', protect, admin, addProblem);
router.put('/problems/:id', protect, admin, updateProblem);
router.delete('/problems/:id', protect, admin, deleteProblem);

module.exports = router;