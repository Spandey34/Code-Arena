const Game = require('../models/Game');
const Problem = require('../models/Problem');
const User = require('../models/User');
const axios = require('axios');

/* ---------------- SANDBOX ---------------- */
const runCodeInSandbox = async (code, language, testCases) => {
    try {
        const response = await axios.post(process.env.CODE_EXECUTION_SERVICE_URL, {
            code,
            language,
            testCases
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            return {
                status: 'error',
                message: error.response.data.message || 'Code execution service error.',
                testResults: []
            };
        } else {
            console.error('Code execution service failed:', error.message);
            return {
                status: 'error',
                message: 'Code execution service is unavailable.',
                testResults: []
            };
        }
    }
};

/* ---------------- END GAME ---------------- */
const endGame = async (gameId, submissions) => {
    const game = await Game.findById(gameId);
    if (!game || game.status === 'completed') return;

    let winnerId = null;

    const submission1 = submissions.find(
        s => s.player.toString() === game.player1.toString()
    );
    const submission2 = submissions.find(
        s => s.player.toString() === game.player2.toString()
    );

    if (submission1 && submission2) {
        const p1ok = submission1.testResults.every(r => r.passed);
        const p2ok = submission2.testResults.every(r => r.passed);

        if (p1ok && p2ok) {
            winnerId =
                submission1.submissionTime < submission2.submissionTime
                    ? game.player1
                    : game.player2;
        } else if (p1ok) {
            winnerId = game.player1;
        } else if (p2ok) {
            winnerId = game.player2;
        }
    } else if (submission1 && submission1.testResults.every(r => r.passed)) {
        winnerId = game.player1;
    } else if (submission2 && submission2.testResults.every(r => r.passed)) {
        winnerId = game.player2;
    }

    game.status = 'completed';
    game.winner = winnerId;
    await game.save();

    /* ----- RATING UPDATE (unchanged) ----- */
    const winner = await User.findById(winnerId);
    const loser = await User.findById(
        winnerId === game.player1 ? game.player2 : game.player1
    );

    if (winner && loser) {
        const K = 32;
        const expectedWinner =
            1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));

        winner.rating += K * (1 - expectedWinner);
        loser.rating -= K * (expectedWinner);

        await winner.save();
        await loser.save();
    }
};

/* ---------------- FIND MATCH ---------------- */
const findMatch = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRating = req.user.rating;

        /* ---- Check if user already waiting ---- */
        let existingGame = await Game.findOne({
            status: 'waiting',
            player1: userId
        });

        if (existingGame) {
            return res.status(200).json({
                message: 'Waiting for an opponent...',
                gameId: existingGame._id
            });
        }

        /* ---- Try to join another waiting game ---- */
        let game = await Game.findOne({
            status: 'waiting',
            player1: { $ne: userId }
        }).populate('problem');

        if (game && game.problem) {
            game.player2 = userId;
            game.status = 'in-progress';
            game.startTime = Date.now();
            await game.save();

            /* ✅ ADD GAME TO BOTH PLAYERS' HISTORY */
            await User.findByIdAndUpdate(game.player1, {
                $addToSet: { gameHistory: { gameId: game._id } }
            });
            await User.findByIdAndUpdate(userId, {
                $addToSet: { gameHistory: { gameId: game._id } }
            });

            return res.status(200).json({
                message: 'Match found!',
                gameId: game._id
            });
        }

        /* ---- Create new game ---- */
        const problem = await Problem.aggregate([
            {
                $match: {
                    rating: {
                        $gte: userRating - 200,
                        $lte: userRating + 200
                    }
                }
            },
            { $sample: { size: 1 } }
        ]);

        if (!problem.length) {
            return res.status(404).json({
                message: 'No suitable problem found.'
            });
        }

        const selectedProblem = problem[0];

        const newGame = new Game({
            player1: userId,
            problem: selectedProblem._id,
            status: 'waiting'
        });

        await newGame.save();

        return res.status(200).json({
            message: 'Waiting for an opponent...',
            gameId: newGame._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/* ---------------- RUN CODE ---------------- */
const runCode = async (req, res) => {
    const { gameId, code, language } = req.body;
    const userId = req.user._id;

    try {
        const game = await Game.findById(gameId).populate('problem');

        if (!game || game.status !== 'in-progress') {
            return res.status(404).json({
                message: 'Game not found or has ended.'
            });
        }

        if (
            game.player1.toString() !== userId.toString() &&
            game.player2?.toString() !== userId.toString()
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const executionResult = await runCodeInSandbox(
            code,
            language,
            game.problem.testCases
        );

        if (executionResult.status !== 'success') {
            return res.status(500).json({
                message: executionResult.message,
                results: []
            });
        }

        res.status(200).json({
            message: 'Execution complete.',
            results: executionResult.testResults
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ---------------- SUBMIT SOLUTION ---------------- */
const submitSolution = async (req, res) => {
    const { gameId, code, language } = req.body;
    const userId = req.user._id;

    try {
        const game = await Game.findById(gameId).populate('problem');

        if (!game || game.status !== 'in-progress') {
            return res.status(404).json({
                message: 'Game not found or has ended.'
            });
        }

        if (
            game.player1.toString() !== userId.toString() &&
            game.player2?.toString() !== userId.toString()
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (
            game.submissions.some(
                s => s.player.toString() === userId.toString()
            )
        ) {
            return res.status(400).json({
                message: 'Solution already submitted.'
            });
        }

        const executionResult = await runCodeInSandbox(
            code,
            language,
            game.problem.testCases
        );

        if (executionResult.status !== 'success') {
            return res.status(500).json({
                message: executionResult.message,
                results: []
            });
        }

        game.submissions.push({
            player: userId,
            code,
            language,
            testResults: executionResult.testResults,
            submissionTime: Date.now()
        });

        await game.save();

        if (game.submissions.length === 2) {
            await endGame(gameId, game.submissions);
        }

        res.status(200).json({
            message: 'Submission received.',
            results: executionResult.testResults
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ---------------- GET GAME ---------------- */
const getGameDetails = async (req, res) => {
    try {
        const game = await Game.findById(req.params.gameId).populate('problem');
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching game details.' });
    }
};

/* ---------------- AUTO SUBMIT ---------------- */
const autoSubmit = async (req, res) => {
    const { gameId, code, language } = req.body;
    const userId = req.user._id;

    try {
        const game = await Game.findById(gameId).populate('problem');

        if (!game || game.status !== 'in-progress') {
            return res.status(404).json({
                message: 'Game not found or has ended.'
            });
        }

        if (
            game.submissions.some(
                s => s.player.toString() === userId.toString()
            )
        ) {
            return res.status(200).json({ message: 'Already submitted.' });
        }

        const executionResult = await runCodeInSandbox(
            code,
            language,
            game.problem.testCases
        );

        game.submissions.push({
            player: userId,
            code,
            language,
            testResults: executionResult.testResults,
            submissionTime: Date.now()
        });

        await game.save();

        if (game.submissions.length === 2) {
            await endGame(gameId, game.submissions);
        }

        res.status(200).json({ message: 'Auto-submission successful.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    findMatch,
    runCode,
    submitSolution,
    getGameDetails,
    autoSubmit
};
