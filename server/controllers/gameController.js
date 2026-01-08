const Game = require('../models/Game');
const Problem = require('../models/Problem');
const User = require('../models/User');
const axios = require('axios');

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

const endGame = async (gameId, submissions) => {
    const game = await Game.findById(gameId);
    if (!game || game.status === 'completed') return;

    let winnerId = null;
    const submission1 = submissions.find(s => s.player.toString() === game.player1.toString());
    const submission2 = submissions.find(s => s.player.toString() === game.player2.toString());

    if (submission1 && submission2) {
        const isPlayer1Correct = submission1.testResults.every(r => r.passed);
        const isPlayer2Correct = submission2.testResults.every(r => r.passed);

        if (isPlayer1Correct && isPlayer2Correct) {
            winnerId = submission1.submissionTime < submission2.submissionTime ? game.player1 : game.player2;
        } else if (isPlayer1Correct) {
            winnerId = game.player1;
        } else if (isPlayer2Correct) {
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

    const winner = await User.findById(winnerId);
    const loser = await User.findById(winnerId === game.player1 ? game.player2 : game.player1);

    if (winner && loser) {
        const K = 32;
        const expectedScoreWinner = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
        const expectedScoreLoser = 1 - expectedScoreWinner;
        winner.rating = winner.rating + K * (1 - expectedScoreWinner);
        loser.rating = loser.rating + K * (0 - expectedScoreLoser);
        await winner.save();
        await loser.save();
    }
    const players = [await User.findById(game.player1), await User.findById(game.player2)];
    for (const player of players) {
        player.gameHistory.push({ gameId: game._id, timestamp: Date.now() });
        await player.save();
    }
    
};


const findMatch = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRating = req.user.rating;
        const ratingRange = 200;

        let game = await Game.findOne({
            status: 'waiting',
            'player1': { $ne: userId }
        }).populate('problem');
        
        if (game && game.problem && Math.abs(game.problem.rating - userRating) <= ratingRange) {
            game.player2 = userId;
            game.status = 'in-progress';
            game.startTime = Date.now();
            await game.save();

            res.status(200).json({ message: 'Match found!', gameId: game._id });
        } else {
            const problem = await Problem.findOne({
                rating: { $gte: userRating - 300, $lte: userRating + 300 }
            });
            if (!problem) {
                return res.status(404).json({ message: 'No suitable problem found.' });
            }
            game = new Game({ player1: userId, problem: problem._id });
            await game.save();
            res.status(200).json({ message: 'Waiting for an opponent...', gameId: game._id });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const runCode = async (req, res) => {
    const { gameId, code, language } = req.body;
    const userId = req.user._id;
    try {
        const game = await Game.findById(gameId).populate('problem');
        if (!game || game.status !== 'in-progress') {
            return res.status(404).json({ message: 'Game not found or has ended.' });
        }
        
        const isPlayer1 = game.player1.toString() === userId.toString();
        const isPlayer2 = game.player2 && game.player2.toString() === userId.toString();

        if (!isPlayer1 && !isPlayer2) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const executionResult = await runCodeInSandbox(code, language, game.problem.testCases);
        
        if (executionResult.status === 'error' || executionResult.status === 'compile-error') {
            return res.status(500).json({ message: executionResult.message, results: [] });
        }
        
        res.status(200).json({ message: 'Execution complete.', results: executionResult.testResults });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitSolution = async (req, res) => {
    const { gameId, code, language } = req.body;
    const userId = req.user._id;

    try {
        const game = await Game.findById(gameId).populate('problem');

        if (!game || game.status !== 'in-progress') {
            return res.status(404).json({ message: 'Game not found or has ended.' });
        }
        
        const isPlayer1 = game.player1.toString() === userId.toString();
        const isPlayer2 = game.player2 && game.player2.toString() === userId.toString();

        if (!isPlayer1 && !isPlayer2) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        if (!game.problem) {
            return res.status(404).json({ message: 'Problem not found for this game.' });
        }

        const hasSubmitted = game.submissions.some(s => s.player.toString() === userId.toString());
        if (hasSubmitted) {
            return res.status(400).json({ message: 'Solution already submitted.' });
        }

        const executionResult = await runCodeInSandbox(code, language, game.problem.testCases);

        if (executionResult.status === 'error' || executionResult.status === 'compile-error') {
            return res.status(500).json({ message: executionResult.message, results: [] });
        }

        const allTestsPassed = executionResult.testResults.every(result => result.passed);
        
        const submission = {
            player: userId,
            code,
            language,
            testResults: executionResult.testResults,
            submissionTime: Date.now()
        };
        game.submissions.push(submission);
        await game.save();

        const bothSubmitted = game.submissions.length === 2;
        if (bothSubmitted) {
            await endGame(gameId, game.submissions);
        }

        res.status(200).json({ message: 'Submission received.', results: executionResult.testResults, allTestsPassed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGameDetails = async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await Game.findById(gameId).populate('problem');
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching game details.' });
    }
};

const autoSubmit = async (req, res) => {
    const { gameId, code, language } = req.body;
    const userId = req.user._id;

    try {
        const game = await Game.findById(gameId).populate('problem');

        if (!game || game.status !== 'in-progress') {
            return res.status(404).json({ message: 'Game not found or has ended.' });
        }
        
        const hasSubmitted = game.submissions.some(s => s.player.toString() === userId.toString());
        if (hasSubmitted) {
            return res.status(200).json({ message: 'Already submitted.' });
        }
        
        const executionResult = await runCodeInSandbox(code, language, game.problem.testCases);

        const submission = {
            player: userId,
            code,
            language,
            testResults: executionResult.testResults,
            submissionTime: Date.now()
        };
        game.submissions.push(submission);
        await game.save();

        const bothSubmitted = game.submissions.length === 2;
        if (bothSubmitted) {
            await endGame(gameId, game.submissions);
        }

        res.status(200).json({ message: 'Auto-submission successful.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { findMatch, runCode, submitSolution, getGameDetails, autoSubmit };