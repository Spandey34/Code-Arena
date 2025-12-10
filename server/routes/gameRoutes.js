const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { findMatch, submitSolution, getGameDetails, runCode } = require('../controllers/gameController');

router.post('/match', protect, findMatch);
router.post('/submit', protect, submitSolution);
router.get('/:gameId', protect, getGameDetails);
router.post('/run', protect, runCode);

module.exports = router;