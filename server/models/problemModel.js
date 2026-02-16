const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    inputFormat: {
        type: String,
        required: true,
    },
    outputFormat: {
        type: String,
        required: true,
    },
    constraints: {
        type: String,
        required: true,
    },
    testCases: [{
        input: String,
        output: String,
    }],
    rating: {
        type: Number,
        required: true,
    },
    explanation: {
          type: String,
          default: ""
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    random_score: {
        type: Number,
        default: () => Math.random(),
        index: true,
    },
}, { timestamps: true });

problemSchema.index({ isPublic: 1, random_score: 1 });//For random problem picking faster

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;