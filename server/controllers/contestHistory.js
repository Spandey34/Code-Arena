const contest = require("../models/Contestmodel/contest");
const contestparticipant = require("../models/Contestmodel/contestparticipant");
const contestsubmission = require("../models/Contestmodel/contestsubmission");

exports.getContestHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all contests
    const contests = await contest
      .find()
      .sort({ startTime: -1 })
      .select("name startTime endTime status");

    // 2. Fetch contests where user is registered
    const registrations = await contestparticipant
      .find({ user: userId })
      .select("contest");

    // 3. Build a Set for fast lookup
    const registeredSet = new Set(
      registrations.map(r => r.contest.toString())
    );

    const now = new Date();

    // 4. Build final response
    const updated = contests.map((c) => {
      const contestObj = c.toObject();
      let status = c.status;

      // 🔹 Dynamic Status Logic
      if (now < new Date(c.startTime) && c.status!=="finished") {
        status = "upcoming";
      } else if (now >= new Date(c.startTime) && now <= new Date(c.endTime) &&  c.status!=="finished") {
        status = "running";
      } else if (now > new Date(c.endTime)) {
        status = c.status === "finished"
          ? "finished"
          : "ended (pending results)";
      }

      return {
        ...contestObj,
        status,
        isRegistered: registeredSet.has(c._id.toString())
      };
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch contest history" });
  }
};


exports.getparticularContests = async (req, res) => {
  try {
    const userId = req.user._id;
    const contestId = req.params.id;

    // 1. Fetch the specific contest
    // Using findById is better for single items than .find({_id: ...})
    const foundContest = await contest.findById(contestId);

    if (!foundContest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // 2. Check if the current user is registered for THIS contest
    const registration = await contestparticipant.findOne({ 
      user: userId, 
      contest: contestId 
    });

    const now = new Date();
    const contestObj = foundContest.toObject();
    let status = foundContest.status;

    // 3. Apply the Dynamic Status Logic
    if (now < new Date(foundContest.startTime)) {
      status = "upcoming";
    } else if (now >= new Date(foundContest.startTime) && now <= new Date(foundContest.endTime)) {
      status = "running";
    } else if (now > new Date(foundContest.endTime)) {
      status = foundContest.status === "finished" 
        ? "finished" 
        : "ended (pending results)";
    }

    // 4. Return the single object with injected status and registration info
    res.json({
      ...contestObj,
      status,
      isRegistered: !!registration // Converts the object/null to a boolean
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching contest details" });
  }
};

exports.deleteContest = async (req, res) => {
  try {
    const Contest = require("../models/Contestmodel/contest");
    const contestId = req.params.id;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Security check: Only allow deleting upcoming contests
    if (contest.status !== "upcoming") {
      return res.status(400).json({
        message:
          "Only upcoming contests can be deleted. Running or finished contests must be archived.",
      });
    }

    await Contest.findByIdAndDelete(contestId);
    res.json({ message: "Contest deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMyContestSubmissions = async (req, res) => {
  const contestId = req.params.id;
  const userId = req.user._id;

  try {
    const submissions = await contestsubmission
      .find({
        contest: contestId,
        user: userId,
      })
      .sort({ submittedAt: -1 })
      .populate("problem", "title");

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

exports.getContestSubmissions = async (req, res) => {
  const contestId = req.params.id;

  try {
    const submissions = await contestsubmission
      .find({ contest: contestId })
      .sort({ submittedAt: -1 })
      .populate("user", "username")
      .populate("problem", "title");

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch contest submissions" });
  }
};
