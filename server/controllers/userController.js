const User = require('../models/userModel');
const Problem = require('../models/problemModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { onlineUsers } = require('../services/socketService');
const Contest = require('../models/contestModel');
const Submission = require('../models/submissionModel');
const Match = require('../models/matchModel');

const createUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ username, email, password: hashedPassword });
        return res.status(201).json({ message: "User created successfully", user: user });
    } catch (error) {
        return res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send Token in HTTP-Only Cookie
        res.cookie('code_arena', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7200000 // 2 hour
        });

        return res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                rating: user.rating
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

const logoutUser = async (req, res) => {
    res.clearCookie('code_arena', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    return res.status(200).json({ message: "Logout successful" });
};

const changePassword = async (req, res) => {
    const id = req.user._id;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error changing password", error: error.message });
    }
};

const allDetails = async (req, res) => {
    const id = req.user._id;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const uniqueProblemIds = await Problem.distinct('problemId', {
            userId: id,
            status: 'ACCEPTED'
        });
        const totalUniqueSolved = uniqueProblemIds.length;
        user.problemsSolved = totalUniqueSolved;
        return res.status(200).json({ user: user });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
};

const getUserDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const uniqueProblemIds = await Problem.distinct('problemId', {
            userId: id,
            status: 'ACCEPTED'
        });
        const totalUniqueSolved = uniqueProblemIds.length;
        user.problemsSolved = totalUniqueSolved;

        return res.status(200).json({ user: user });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching user details", error: error.message });
    }
};

const leaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ rating: -1 }); //descending order by rating
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

const userStats = async (req, res) => {
  try {
    const userId = req.user._id;
    // Get user details
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all submissions by user
    const submissions = await Submission.find({ userId })
      .populate('problemId', 'title rating')
      .sort({ createdAt: -1 });

    // Get all matches involving the user
    const matches = await Match.find({
      $or: [{ player1: userId }, { player2: userId }]
    })
      .populate('player1', 'username rating')
      .populate('player2', 'username rating')
      .populate('problem', 'title rating')
      .populate('winner', 'username')
      .sort({ createdAt: -1 });

    // Get contests the user is registered in
    const contests = await Contest.find({ 
      registeredUsers: userId 
    })
      .sort({ startTime: -1 });

    // Calculate submission statistics
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.verdict === 'ACCEPTED').length;
    const uniqueProblemsSolved = [...new Set(
      submissions.filter(s => s.verdict === 'ACCEPTED').map(s => s.problemId?._id?.toString())
    )].length;

    // Language distribution
    const languageDistribution = {};
    submissions.forEach(sub => {
      languageDistribution[sub.language] = (languageDistribution[sub.language] || 0) + 1;
    });

    // Verdict distribution
    const verdictDistribution = {};
    submissions.forEach(sub => {
      verdictDistribution[sub.verdict] = (verdictDistribution[sub.verdict] || 0) + 1;
    });

    // Match statistics
    const totalMatches = matches.length;
    const matchesWon = matches.filter(m => 
      m.winner && (m.winner._id.toString() === userId || m.winner.toString() === userId)
    ).length;
    const matchesLost = totalMatches - matchesWon;
    // Calculate contest statistics
    const contestStats = await Promise.all(
      contests.map(async (contest) => {
        const contestStart = new Date(contest.startTime);
        const contestEnd = new Date(contestStart.getTime() + contest.duration * 60000);
        
        const contestSubmissions = await Submission.find({
          userId,
          problemId: { $in: contest.problems },
          createdAt: { $gte: contestStart, $lte: contestEnd }
        });

        const solvedInContest = [...new Set(
          contestSubmissions
            .filter(s => s.verdict === 'ACCEPTED')
            .map(s => s.problemId?.toString())
        )].length;

        return {
          contestId: contest._id,
          contestName: contest.name,
          status: contest.status,
          solvedProblems: solvedInContest,
          totalProblems: contest.problems.length,
          participatedAt: contest.startTime
        };
      })
    );

    // Get recent activity (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSubmissions = submissions.filter(s => 
      new Date(s.createdAt) > oneWeekAgo
    ).length;

    const recentMatches = matches.filter(m => 
      new Date(m.createdAt) > oneWeekAgo
    ).length;

    // Calculate rating history (if you store rating changes)
    const ratingHistory = []; // You might need a separate Rating model for this
    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      },
      statistics: {
        submissions: {
          total: totalSubmissions,
          accepted: acceptedSubmissions,
          acceptanceRate: totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0,
          uniqueProblemsSolved,
          languageDistribution,
          verdictDistribution
        },
        matches: {
          total: totalMatches,
          won: matchesWon,
          lost: matchesLost,
          winRate: totalMatches > 0 ? (matchesWon / totalMatches * 100).toFixed(2) : 0
        },
        contests: {
          participated: contests.length,
          details: contestStats
        },
        recentActivity: {
          submissions: recentSubmissions,
          matches: recentMatches,
          contests: contests.filter(c => c.status === 'ongoing').length
        }
      },
      recentSubmissions: submissions.slice(0, 10).map(s => ({
        _id: s._id,
        problemId: s.problemId?._id,
        problemTitle: s.problemId?.title,
        language: s.language,
        verdict: s.verdict,
        createdAt: s.createdAt
      })),
      recentMatches: matches.slice(0, 10).map(m => ({
        _id: m._id,
        opponent: m.player1._id.toString() === userId ? m.player2 : m.player1,
        opponentUsername: m.player1._id.toString() === userId ? m.player2.username : m.player1.username,
        problemTitle: m.problem?.title,
        result: m.winner ? 
          (m.winner._id.toString() === userId ? 'Won' : 'Lost') : 
          m.status === 'completed' ? 'Draw' : 'In Progress',
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error fetching user statistics', 
      error: error.message 
    });
  }
};

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    changePassword,
    allDetails,
    getUserDetails,
    leaderboard,
    userStats
};
