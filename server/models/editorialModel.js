const mongoose = require('mongoose');

const editorialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['JavaScript', 'Python', 'Java', 'C++'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    upVotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downVotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

const Editorial = mongoose.model('Editorial', editorialSchema);
module.exports = Editorial;