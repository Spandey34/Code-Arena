const mongoose = require("mongoose");

const contestSubmissionSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  language: String,
  code: String,
  verdict: {
    type: String,
    enum: ["AC", "WA", "TLE", "RE", "CE"],
    default: "WA"
  },
  penalty: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ContestSubmission", contestSubmissionSchema);
