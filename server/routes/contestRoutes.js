const express = require("express");
const router = express.Router();
const {
  createContest,
  getContests,
  registerContest,
  getContestProblems,
  submitContest,
  getScoreboard
} = require("../controllers/contestController");

const { protect, admin } = require('../middleware/authMiddleware');
const { endContest } = require("../controllers/endcontest");
const { getContestHistory, getMyContestSubmissions, getContestSubmissions, deleteContest, getparticularContests } = require("../controllers/contestHistory");

router.post("/create", protect, admin, createContest);
// router.get("/", getContests);
router.post("/:id/register", protect, registerContest);
router.get("/:id/problems", protect, getContestProblems);
router.post("/:id/submit", protect, submitContest);
router.get("/:id/scoreboard", getScoreboard);
router.post("/:id/end", protect, admin, endContest);
router.delete('/:id/delete', protect, admin,deleteContest);

// contest history

router.get("/history", protect,getContestHistory);
router.get("/:id", protect,getparticularContests);
router.get("/:id/my-submissions", protect, getMyContestSubmissions);
router.get("/:id/submissions", protect, admin, getContestSubmissions);





module.exports = router;
