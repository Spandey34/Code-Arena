const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    type: { type: String, enum: ["ICPC", "CF"], default: "ICPC" },
    isRated: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["upcoming", "running", "finished"],
      default: "upcoming",
    },
    ratingUpdated: {
      type: Boolean,
      default: false,
    },
    //isRegistered:{ type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contest", contestSchema);
