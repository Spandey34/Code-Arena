// 1. Capitalize the Model name
const Contest = require("../models/Contestmodel/contest");
const { updateRatingsAfterContest } = require("./contestRating");

exports.endContest = async (req, res) => {
  try {
    const contestId = req.params.id;

    // 2. Use the Capitalized Model to find the lowercase instance
    const foundContest = await Contest.findById(contestId);
    
    if (!foundContest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (foundContest.ratingUpdated) {
      return res.json({ message: "Ratings already updated" });
    }

    // Mark contest finished
    foundContest.status = "finished";
    await foundContest.save();

    // Update ratings
    await updateRatingsAfterContest(contestId);

    foundContest.ratingUpdated = true;
    await foundContest.save();

    res.json({ message: "Contest ended and ratings updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};