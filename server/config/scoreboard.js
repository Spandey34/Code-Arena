const contestsubmission = require("../models/Contestmodel/contestsubmission");


const PENALTY_MINUTES = 20;

async function buildScoreboard(contestId) {
  const submissions = await contestsubmission.find({ contest: contestId })
    .sort({ submittedAt: 1 }) // important
    .populate("user", "username");

  const scoreboard = {};

  for (const sub of submissions) {
    const userId = sub.user._id.toString();
    const problemId = sub.problem.toString();

    if (!scoreboard[userId]) {
      scoreboard[userId] = {
        userId,
        username: sub.user.username,
        solved: 0,
        penalty: 0,
        wrongattempts:0,
        problems: {} // problemId → { solved, wrongCount }
      };
    }

    const userEntry = scoreboard[userId];

    if (!userEntry.problems[problemId]) {
      userEntry.problems[problemId] = {
        solved: false,
        wrongCount: 0
      };
    }

    const problemEntry = userEntry.problems[problemId];

    // Ignore submissions after AC
    if (problemEntry.solved) continue;

    if (sub.verdict === "AC") {
      problemEntry.solved = true;
      userEntry.solved += 1;
      userEntry.penalty += problemEntry.wrongCount * PENALTY_MINUTES;
    } else if (["WA", "TLE", "RE"].includes(sub.verdict)) {
      problemEntry.wrongCount += 1;
      userEntry.wrongattempts += 1;
    }
    // CE, SE → ignored
  }

  // Convert to array and sort
  // 🔹 Sort first
  const sorted = Object.values(scoreboard)
    .map(u => ({
      userId: u.userId,
      username: u.username,
      solved: u.solved,
      penalty: u.penalty,
      wrongattempts: u.wrongattempts
    }))
    .sort((a, b) =>
      b.solved !== a.solved
        ? b.solved - a.solved
        : a.penalty - b.penalty
    );

  // 🔹 Assign ranks
  let rank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (
      i > 0 &&
      sorted[i].solved === sorted[i - 1].solved &&
      sorted[i].penalty === sorted[i - 1].penalty
    ) {
      sorted[i].rank = sorted[i - 1].rank; // same rank
    } else {
      sorted[i].rank = rank;
    }
    rank++;
  }

  return sorted;
}

module.exports = { buildScoreboard };
