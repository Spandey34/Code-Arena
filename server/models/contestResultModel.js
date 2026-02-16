// models/ContestResult.js
const mongoose = require('mongoose');

const contestResultSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rank: {
        type: Number,
        required: true
    },
    oldRating: {
        type: Number,
        required: true
    },
    newRating: {
        type: Number,
        required: true
    },
    delta: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Compound index to ensure a user has only one result per contest
contestResultSchema.index({ contestId: 1, userId: 1 }, { unique: true });

const ContestResult = mongoose.model('ContestResult', contestResultSchema);
module.exports = ContestResult;