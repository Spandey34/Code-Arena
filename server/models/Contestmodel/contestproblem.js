const mongoose = require("mongoose");

const contestProblemSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  index: { type: String, required: true }, // A, B, C
  points: { type: Number, default: 100 }
});

module.exports = mongoose.model("ContestProblem", contestProblemSchema);
