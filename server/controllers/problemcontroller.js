const Problem = require("../models/problemModel");
const Submission = require("../models/submissionModel");


const addProblem = async (req,res) => {
    const { title, description, inputFormat, outputFormat, constraints, testCases, rating, explanation, isPublic } = req.body;
    try {
        const problem = await Problem.create({ title, description, inputFormat, outputFormat, constraints, testCases, rating, explanation, isPublic});
        return res.status(201).json({ message: "Problem created successfully", problem });
    } catch (error) {
        return res.status(500).json({ message: "Error creating problem", error: error.message });
    }
};

const updateProblem = async (req,res) => {
    const { problemId } = req.params;
    const { title, description, inputFormat, outputFormat, constraints, testCases, rating, explanation } = req.body;

    try {
        const problem = await Problem.findByIdAndUpdate(problemId, { title, description, inputFormat, outputFormat, constraints, testCases, rating, explanation }, { new: true });
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        return res.status(200).json({ message: "Problem updated successfully", problem });
    } catch (error) {
        return res.status(500).json({ message: "Error updating problem", error: error.message });
    }
};

const toggleProblemVisibility = async (req,res) => {
    const { problemId } = req.params;
    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        problem.isPublic = !problem.isPublic;
        await problem.save();
        const visibilityStatus = problem.isPublic ? "public" : "private";
        return res.status(200).json({ message: `Problem visibility toggled to ${visibilityStatus}`, problem });
    } catch (error) {
        return res.status(500).json({ message: "Error toggling problem visibility", error: error.message});
    }
};

const deleteProblem = async (req,res) => {
    const { problemId } = req.params;
    try {
        const problem = await Problem.findByIdAndDelete(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        return res.status(200).json({ message: "Problem deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting problem", error: error.message});
    }
};

const getProblemById = async (req,res) => {
    const { problemId } = req.params;
    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            console.log("Here")
            return res.status(404).json({ message: "Problem not found" });
        }
        return res.status(200).json({ problem });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching problem", error: error.message });
    }
};

const getAllProblems = async (req,res) => {
    const isAdmin = req.user.isAdmin;
    try {
        if(isAdmin)
        {
            const problems = await Problem.find();
            return res.status(200).json({ problems });
        }
        const problems = await Problem.find({ isPublic: { $ne: false}}).select("-testCases");
        return res.status(200).json({ problems });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching problems", error: error.message });
    }
};

const getProblemSubmissions = async (req, res) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    try {
         const submissions = await Submission.find({ problemId, userId }).sort({ createdAt: -1 });
         return res.status(200).json({ submissions });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching submissions for problem", error: error.message });
    }
};

module.exports = {
    addProblem,
    updateProblem,
    toggleProblemVisibility,
    deleteProblem,
    getProblemById,
    getAllProblems,
    getProblemSubmissions
};