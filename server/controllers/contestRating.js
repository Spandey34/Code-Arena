const User = require('../models/User');


const contestparticipant = require("../models/Contestmodel/contestparticipant");
const { buildScoreboard } = require("../config/scoreboard");

const K = 40;
const MIN_RATING = 800;

async function updateRatingsAfterContest(contestId) {
  const scoreboard = await buildScoreboard(contestId);

  const participants = await contestparticipant.find({ contest: contestId })
    .populate("user");

  const total = scoreboard.length;
  if (total < 2) return; // no rating change for solo contest

  // Average rating
  const avgRating =
    participants.reduce((sum, p) => sum + p.user.rating, 0) / total;

  for (let i = 0; i < scoreboard.length; i++) {
    const row = scoreboard[i];
    const user = participants.find(
      p => p.user._id.toString() === row.userId
    )?.user;

    if (!user) continue;

    const rank = row.rank;

    // Performance score (0 to 1)
    const performance = 1 - (rank - 1) / (total - 1);

    // Expected score
    const expected =
      1 / (1 + Math.pow(10, (avgRating - user.rating) / 400));

    // Rating change
    const delta = Math.round(K * (performance - expected));

    user.rating = Math.max(MIN_RATING, user.rating + delta);
    await user.save();
  }
}



module.exports = { updateRatingsAfterContest };
