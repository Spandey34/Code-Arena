const express = require("express");
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');

const {
  getPracticeProblems,
  getAllProblemsAdmin,
  toggleProblemVisibility,
  getProblem
} = require("../controllers/problemcontroller");

// User
router.get("/practice/me", protect, getPracticeProblems);
router.get("/practice/:id", protect,getProblem);

// Admin
router.get("/admin/problems", protect, admin, getAllProblemsAdmin);
router.patch("/admin/problem/:id/toggle", protect, admin, toggleProblemVisibility);

module.exports = router;
