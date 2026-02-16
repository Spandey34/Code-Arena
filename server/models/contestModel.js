const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    }],
    registeredUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    startTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    isRatingCalculated: {
        type: Boolean,
        default: false 
    }
}, { timestamps: true });

const Contest = mongoose.model('Contest', contestSchema);
module.exports = Contest;