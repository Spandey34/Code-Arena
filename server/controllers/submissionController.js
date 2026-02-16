const Submission = require('../models/submissionModel');
const Problem = require('../models/problemModel');
const Contest = require('../models/contestModel');
const submissionQueue = require('../queues/submissionQueue');

// ---------------------------------------------------------
// RUN CODE (Temporary execution, No DB save)
// ---------------------------------------------------------
const runCode = async (req, res) => {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    try {
        // 1. Validate Problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // 2. Access Control (Public or Contest)
        const contest = await Contest.findOne({ problems: problemId });
        if (!contest && problem.isPublic === false) {
            return res.status(403).json({ message: "Problem is not public and not part of any contest" });
        }

        // 3. Add to Queue with type 'run'
        // We pass 'code' and 'language' directly because we aren't saving to DB
        await submissionQueue.add('submission-queue', {
            type: 'run',
            userId: userId.toString(),
            problemId,
            code,
            language
        });

        // 4. Respond immediately
        return res.status(200).json({ 
            message: "Queued", 
            status: "QUEUED" 
        });

    } catch (error) {
        console.error("Run Code Error:", error);
        return res.status(500).json({ message: "Error running code", error: error.message });
    }
};

// ---------------------------------------------------------
// SUBMIT CODE (Saved to DB for verdicts/stats)
// ---------------------------------------------------------
const submitCode = async (req, res) => {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    try {
        // 1. Validate Problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // 2. Access Control
        const contest = await Contest.findOne({ problems: problemId });
        if (!contest && problem.isPublic === false) {
            return res.status(403).json({ message: "Problem is not public and not part of any contest" });
        }

        // 3. Create Submission Document (QUEUED)
        const submission = await Submission.create({
            userId,
            problemId,
            code,
            language,
            verdict: 'QUEUED',
            createdAt: new Date()
        });

        // 4. Add to Queue with type 'submit'
        // We only need the ID because the worker will fetch the rest from DB
        await submissionQueue.add('submission-queue', {
            type: 'submit',
            submissionId: submission._id.toString(),
            userId: userId.toString(),
            problemId, 
            code,       
            language    
        });

        return res.status(201).json({
            verdict: 'QUEUED',
            submissionId: submission._id
        });

    } catch (error) {
        return res.status(500).json({ message: "Error creating submission", error: error.message });
    }
};

const userSubmissions = async (req, res) => {
    const userId = req.user._id;
    try {
        const submissions = await Submission.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ submissions });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching submissions", error: error.message });
    }
};

const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find()
            .sort({ createdAt: -1 })
            .populate('problemId', 'title')   // Populates the 'title' field from the Problem model
            .populate('userId', 'username');  // Populates the 'username' field from the User model

        return res.status(200).json({ submissions });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching submissions", error: error.message });
    }
};

module.exports = { runCode, submitCode , userSubmissions, getAllSubmissions };