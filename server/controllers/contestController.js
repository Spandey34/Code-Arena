const Contest = require("../models/Contestmodel/contest");
const ContestProblem = require("../models/Contestmodel/contestproblem");
const ContestParticipant = require("../models/Contestmodel/contestparticipant");
const ContestSubmission = require("../models//Contestmodel/contestsubmission");
const User = require('../models/User');
const { getContestVerdict }=require('../config/contestverdict');
const { runCodeInSandbox } = require("./gameController");
const Problem = require("../models/Problem");
const { buildScoreboard } = require("../config/scoreboard");

const PENALTY_VERDICTS = ["WA", "TLE", "RE"];

/* ================= CREATE CONTEST (ADMIN) ================= */
exports.createContest = async (req, res) => {
  const { name, startTime, duration, problems } = req.body;

  const endTime = new Date(
    new Date(startTime).getTime() + duration * 60000
  );

  const contest = await Contest.create({
    name,
    startTime,
    endTime,
    duration,
    createdBy: req.user._id
  });

  // problems = [{ problemId, index, points }]
  for (let p of problems) {
    await ContestProblem.create({
      contest: contest._id,
      problem: p.problemId,
      index: p.index,
      points: p.points
    });
  }

  res.status(201).json(contest);
};




/* ================= REGISTER ================= */
exports.registerContest = async (req, res) => {
  const contestId = req.params.id;

  const already = await ContestParticipant.findOne({
    contest: contestId,
    user: req.user._id
  });

  if (already) {
    return res.status(400).json({ message: "Already registered" });
  }

  await ContestParticipant.create({
    contest: contestId,
    user: req.user._id,
    ratingBefore: req.user.rating
  });

  res.json({ message: "Registered successfully" });
};

/* ================= GET CONTEST PROBLEMS ================= */
exports.getContestProblems = async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  const now = new Date();
 

  if (now < contest.startTime) {
    return res.status(403).json({ message: "Contest not started" });
  }

  const problems = await ContestProblem.find({
    contest: contest._id
  }).populate("problem");
   
  
  res.json(problems);
};

/* ================= SUBMIT SOLUTION ================= */
exports.submitContest = async (req, res) => {
  const { problemId, code, language } = req.body;
  const contestId = req.params.id;
  const userId = req.user._id;

  /* ===== Rule 1: contest time check ===== */
  const contest = await Contest.findById(contestId);
  const now = new Date();

  if (now < contest.startTime || now > contest.endTime) {
    return res.status(403).json({ message: "Contest is not running" });
  }

  /* ===== Rule 2: registration check ===== */
  const registered = await ContestParticipant.findOne({
    contest: contestId,
    user: userId
  });

  if (!registered) {
    return res.status(403).json({ message: "User not registered for contest" });
  }

  /* ===== Rule 3: check if already solved ===== */
  const alreadySolved = await ContestSubmission.findOne({
    contest: contestId,
    user: userId,
    problem: problemId,
    verdict: "AC"
  });

  if (alreadySolved) {
    return res.json({ verdict: "IGNORED" });
  }

  /* ===== Get problem testcases ===== */
  const problem = await Problem.findById(problemId);
  if (!problem) {
    return res.status(404).json({ message: "Problem not found" });
  }

  /* ===== Run judge ===== */
  const judgeResult = await runCodeInSandbox(
    code,
    language,
    problem.testCases
  );

  const verdict = getContestVerdict(judgeResult);

  /* ===== Rule 4 & 5: penalty calculation ===== */
  let penalty = 0;
  if (PENALTY_VERDICTS.includes(verdict)) {
    penalty = 20;
  }

  /* ===== Save submission ===== */
  await ContestSubmission.create({
    contest: contestId,
    problem: problemId,
    user: userId,
    language,
    code,
    verdict,
    penalty
  });

  return res.json({ verdict });
};

/* ================= SCOREBOARD ================= */
exports.getScoreboard = async (req, res) => {
  const contestId = req.params.id;
  const scoreboard = await buildScoreboard(contestId);
  res.json(scoreboard);
};