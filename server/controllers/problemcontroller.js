const Problem = require("../models/Problem");
const UserProblem=require("../models/Userproblem")

/* -----------------------------------
   USER PRACTICE
----------------------------------- */

exports.getPracticeProblems = async (req, res) => {
  try {
    const userId = req.user._id;

    // Only active problems
    const problems = await Problem.find({ isActive: true })
      .select("title rating language");

    const progress = await UserProblem.find({ user: userId });

    const map = {};
    progress.forEach(p => {
      map[p.problem.toString()] = p.status;
    });

    const result = problems.map(p => ({
      ...p.toObject(),
      status: map[p._id] || "unsolved"
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -----------------------------------
   ADMIN
----------------------------------- */

exports.getAllProblemsAdmin = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleProblemVisibility = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem)
      return res.status(404).json({ message: "Problem not found" });

    problem.isActive = !problem.isActive;
    await problem.save();

    res.json({ isActive: problem.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
