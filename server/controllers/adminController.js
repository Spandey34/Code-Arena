const Problem = require('../models/Problem');

const addProblem = async (req, res) => {
    const { title, description, rating, language, testCases, correctSolution } = req.body;
    try {
        const newProblem = await Problem.create({
            title,
            description,
            rating,
            language,
            testCases,
            correctSolution
        });
        res.status(201).json(newProblem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;
    try {
        const problem = await Problem.findByIdAndUpdate(id, req.body, { new: true });
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        const problem = await Problem.findByIdAndDelete(id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json({ message: 'Problem removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addProblem, updateProblem, deleteProblem };