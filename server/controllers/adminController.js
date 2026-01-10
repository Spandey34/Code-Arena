const Problem = require('../models/Problem');

/* ---------------- ADD PROBLEM ---------------- */
const addProblem = async (req, res) => {
    const {
        title,
        description,
        input,
        output,
        constraints,
        rating,
        language,
        testCases,
        correctSolution
    } = req.body;

    try {
        // Basic validation (optional but recommended)
        if (
            !title ||
            !description ||
            !input ||
            !output ||
            !constraints ||
            !rating ||
            !language ||
            !testCases ||
            !correctSolution
        ) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const newProblem = await Problem.create({
            title,
            description,
            input,
            output,
            constraints,
            rating,
            language,
            testCases,
            correctSolution
        });

        res.status(201).json(newProblem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/* ---------------- UPDATE PROBLEM ---------------- */
const updateProblem = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            req.body,          // allows partial updates
            {
                new: true,
                runValidators: true, // IMPORTANT: keep schema validation
            }
        );

        if (!updatedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.json(updatedProblem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/* ---------------- DELETE PROBLEM ---------------- */
const deleteProblem = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.json({ message: 'Problem removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addProblem,
    updateProblem,
    deleteProblem
};
