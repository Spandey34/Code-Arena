const mongoose = require("mongoose");

const contestParticipantSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ratingBefore: Number,
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ContestParticipant", contestParticipantSchema);
