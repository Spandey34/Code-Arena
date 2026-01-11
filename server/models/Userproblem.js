const mongoose = require("mongoose");

const userProblemSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    status: {
        type: String,
        enum: ["unsolved", "attempted", "solved"],
        default: "unsolved",
    },
    lastSubmitted: Date,
});

module.exports = mongoose.model("UserProblem", userProblemSchema);
