const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    code: String,
    language: {
        type: String,
        enum: ['JavaScript', 'Python', 'Java', 'C++'],
        required: true
    },
    testResults: [{
        testCase: String,
        passed: Boolean
    }],
    submissionTime: {
        type: Date
    }
});

const gameSchema = new mongoose.Schema({
    player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'in-progress', 'completed'],
        default: 'waiting'
    },
    submissions: [submissionSchema],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    startTime: {
        type: Date,
        default: Date.now
    }
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;