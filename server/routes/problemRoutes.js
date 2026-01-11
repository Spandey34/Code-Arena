const express = require("express");
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');

const {
    getPracticeProblems,
    getAllProblemsAdmin,
    toggleProblemVisibility,
    getProblem
} = require("../controllers/problemcontroller");
const { practicesubmitSolution, practiceRunCode } = require("../controllers/submission");

// User
router.get("/practice/me", protect, getPracticeProblems);
router.get("/practice/:id", protect, getProblem);

// Admin
router.get("/admin/problems", protect, admin, getAllProblemsAdmin);
router.patch("/admin/problem/:id/toggle", protect, admin, toggleProblemVisibility);
// submit

router.post("/submit", protect, practicesubmitSolution);

router.post("/run", protect, practiceRunCode);

module.exports = router;





