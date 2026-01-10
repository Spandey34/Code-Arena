const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    }
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    input:{
        type: String,
        required: true
    },
    output:{
        type: String,
        required: true
    },
    constraints:{
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    language: {
        type: String,
        enum: ['JavaScript', 'Python', 'Java', 'C++'],
        required: true
    },
    testCases: [testCaseSchema],
    correctSolution: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;