const User = require('../models/userModel');
const Problem = require('../models/problemModel');
const Submission = require('../models/submissionModel');
const Contest = require('../models/contestModel');
const Blog = require('../models/blogModel');
const Editorial = require('../models/editorialModel');
const Match = require('../models/matchModel');

// ==================== USER MANAGEMENT ====================

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from removing their own admin status
    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own admin status' });
    }

    user.isAdmin = isAdmin;
    await user.save();

    return res.status(200).json({ 
      message: `User role updated successfully`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        rating: user.rating
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete user's submissions
    await Submission.deleteMany({ userId });
    
    // Delete user's blogs
    await Blog.deleteMany({ userId });
    
    // Delete user's editorials
    await Editorial.deleteMany({ userId });
    
    // Delete user from matches
    await Match.deleteMany({
      $or: [
        { player1: userId },
        { player2: userId }
      ]
    });

    // Delete user from contests registrations
    await Contest.updateMany(
      { registeredUsers: userId },
      { $pull: { registeredUsers: userId } }
    );

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from banning themselves
    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot ban yourself' });
    }

    // Add ban status to user
    user.isBanned = true;
    user.banReason = reason;
    user.bannedAt = new Date();
    await user.save();

    return res.status(200).json({ 
      message: 'User banned successfully',
      user: {
        _id: user._id,
        username: user.username,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error banning user', error: error.message });
  }
};

// ==================== PROBLEM MANAGEMENT ====================

const getAllProblemsAdmin = async (req, res) => {
  try {
    const problems = await Problem.find()
      .sort({ createdAt: -1 });
    
    const problemsWithStats = await Promise.all(
      problems.map(async (problem) => {
        const totalSubmissions = await Submission.countDocuments({ problemId: problem._id });
        const acceptedSubmissions = await Submission.countDocuments({ 
          problemId: problem._id, 
          verdict: 'ACCEPTED' 
        });
        
        return {
          ...problem.toObject(),
          totalSubmissions,
          acceptedSubmissions,
          acceptanceRate: totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : 0
        };
      })
    );

    return res.status(200).json({ problems: problemsWithStats });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching problems', error: error.message });
  }
};

const getProblemStats = async (req, res) => {
  try {
    const { problemId } = req.params;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const totalSubmissions = await Submission.countDocuments({ problemId });
    const acceptedSubmissions = await Submission.countDocuments({ 
      problemId, 
      verdict: 'ACCEPTED' 
    });
    const userAttempts = await Submission.distinct('userId', { problemId });
    const successfulUsers = await Submission.distinct('userId', { 
      problemId, 
      verdict: 'ACCEPTED' 
    });

    // Get verdict distribution
    const verdictDistribution = await Submission.aggregate([
      { $match: { problemId: problem._id } },
      { $group: { 
          _id: '$verdict', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Get language distribution
    const languageDistribution = await Submission.aggregate([
      { $match: { problemId: problem._id } },
      { $group: { 
          _id: '$language', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    return res.status(200).json({
      problem: {
        _id: problem._id,
        title: problem.title,
        rating: problem.rating,
        isPublic: problem.isPublic,
        createdAt: problem.createdAt
      },
      statistics: {
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : 0,
        uniqueAttempts: userAttempts.length,
        uniqueSuccesses: successfulUsers.length,
        verdictDistribution,
        languageDistribution
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching problem stats', error: error.message });
  }
};

// ==================== SUBMISSION MANAGEMENT ====================

const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('userId', 'username email rating')
      .populate('problemId', 'title rating');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is admin or the submission owner
    if (!req.user.isAdmin && submission.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    return res.status(200).json({ submission });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching submission', error: error.message });
  }
};

const rejudgeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submissionQueue = require('../queues/submissionQueue');

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Reset verdict to QUEUED
    submission.verdict = 'QUEUED';
    await submission.save();

    // Re-add to queue
    await submissionQueue.add('submission-queue', {
      type: 'submit',
      submissionId: submission._id.toString(),
      userId: submission.userId.toString(),
      problemId: submission.problemId.toString(),
      code: submission.code,
      language: submission.language
    });

    return res.status(200).json({ 
      message: 'Submission sent for rejudging',
      submissionId: submission._id
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error rejudging submission', error: error.message });
  }
};

const rejudgeProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const submissionQueue = require('../queues/submissionQueue');

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Get all submissions for this problem
    const submissions = await Submission.find({ 
      problemId,
      verdict: { $ne: 'QUEUED' } // Don't rejudge already queued submissions
    });

    // Reset all submissions to QUEUED
    await Submission.updateMany(
      { problemId, verdict: { $ne: 'QUEUED' } },
      { $set: { verdict: 'QUEUED' } }
    );

    // Re-add all submissions to queue
    const rejudgePromises = submissions.map(submission => 
      submissionQueue.add('submission-queue', {
        type: 'submit',
        submissionId: submission._id.toString(),
        userId: submission.userId.toString(),
        problemId: submission.problemId.toString(),
        code: submission.code,
        language: submission.language
      })
    );

    await Promise.all(rejudgePromises);

    return res.status(200).json({ 
      message: `Rejudged ${submissions.length} submissions for problem: ${problem.title}`,
      problemId: problem._id,
      totalRejudged: submissions.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error rejudging problem', error: error.message });
  }
};

// ==================== CONTEST MANAGEMENT ====================

const getAllContestsAdmin = async (req, res) => {
  try {
    const contests = await Contest.find()
      .sort({ startTime: -1 })
      .populate('problems', 'title rating')
      .populate('registeredUsers', 'username');

    const contestsWithStats = await Promise.all(
      contests.map(async (contest) => {
        const submissionCount = await Submission.countDocuments({
          problemId: { $in: contest.problems },
          createdAt: { 
            $gte: contest.startTime,
            $lte: new Date(contest.startTime.getTime() + contest.duration * 60000)
          }
        });

        return {
          ...contest.toObject(),
          submissionCount,
          isActive: contest.status === 'ongoing',
          isUpcoming: contest.status === 'upcoming',
          isCompleted: contest.status === 'completed'
        };
      })
    );

    return res.status(200).json({ contests: contestsWithStats });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching contests', error: error.message });
  }
};

const getContestStats = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId)
      .populate('problems', 'title rating')
      .populate('registeredUsers', 'username email rating');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const contestStart = contest.startTime;
    const contestEnd = new Date(contestStart.getTime() + contest.duration * 60000);

    // Get submissions during contest time
    const submissions = await Submission.find({
      problemId: { $in: contest.problems },
      createdAt: { $gte: contestStart, $lte: contestEnd }
    }).populate('userId', 'username');

    // Calculate problem stats
    const problemStats = await Promise.all(
      contest.problems.map(async (problem) => {
        const problemSubmissions = submissions.filter(sub => 
          sub.problemId.toString() === problem._id.toString()
        );
        
        const acceptedSubmissions = problemSubmissions.filter(sub => 
          sub.verdict === 'ACCEPTED'
        );
        
        const uniqueUsers = [...new Set(problemSubmissions.map(sub => sub.userId._id.toString()))];
        const uniqueAcceptedUsers = [...new Set(acceptedSubmissions.map(sub => sub.userId._id.toString()))];

        return {
          problemId: problem._id,
          title: problem.title,
          rating: problem.rating,
          totalSubmissions: problemSubmissions.length,
          acceptedSubmissions: acceptedSubmissions.length,
          acceptanceRate: problemSubmissions.length > 0 
            ? ((acceptedSubmissions.length / problemSubmissions.length) * 100).toFixed(2) 
            : 0,
          uniqueAttempts: uniqueUsers.length,
          uniqueSolves: uniqueAcceptedUsers.length
        };
      })
    );

    // Calculate participant stats
    const participantStats = contest.registeredUsers.map(user => {
      const userSubmissions = submissions.filter(sub => 
        sub.userId._id.toString() === user._id.toString()
      );
      const solvedProblems = [...new Set(
        userSubmissions
          .filter(sub => sub.verdict === 'ACCEPTED')
          .map(sub => sub.problemId.toString())
      )];

      return {
        userId: user._id,
        username: user.username,
        rating: user.rating,
        totalSubmissions: userSubmissions.length,
        solvedProblems: solvedProblems.length
      };
    });

    return res.status(200).json({
      contest: {
        _id: contest._id,
        name: contest.name,
        startTime: contest.startTime,
        duration: contest.duration,
        status: contest.status,
        totalProblems: contest.problems.length,
        totalParticipants: contest.registeredUsers.length
      },
      statistics: {
        totalSubmissions: submissions.length,
        problemStats,
        participantStats,
        averageProblemsSolved: participantStats.length > 0 
          ? (participantStats.reduce((sum, p) => sum + p.solvedProblems, 0) / participantStats.length).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching contest stats', error: error.message });
  }
};

// ==================== BLOG MANAGEMENT ====================

const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    const blogsWithStats = blogs.map(blog => {
      const voteScore = blog.upVotes.length - blog.downVotes.length;
      return {
        ...blog.toObject(),
        voteScore,
        totalVotes: blog.upVotes.length + blog.downVotes.length
      };
    });

    return res.status(200).json({ blogs: blogsWithStats });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
};

const updateBlogVisibility = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { isPublished } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.isPublished = isPublished;
    await blog.save();

    return res.status(200).json({ 
      message: `Blog ${isPublished ? 'published' : 'unpublished'} successfully`,
      blog: {
        _id: blog._id,
        title: blog.title,
        isPublished: blog.isPublished,
        userId: blog.userId
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating blog visibility', error: error.message });
  }
};

// ==================== EDITORIAL MANAGEMENT ====================

const getAllEditorialsAdmin = async (req, res) => {
  try {
    const editorials = await Editorial.find()
      .populate('userId', 'username email')
      .populate('problemId', 'title rating')
      .sort({ createdAt: -1 });

    const editorialsWithStats = editorials.map(editorial => {
      const voteScore = editorial.upVotes.length - editorial.downVotes.length;
      return {
        ...editorial.toObject(),
        voteScore,
        totalVotes: editorial.upVotes.length + editorial.downVotes.length
      };
    });

    return res.status(200).json({ editorials: editorialsWithStats });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching editorials', error: error.message });
  }
};

const updateEditorialStatus = async (req, res) => {
  try {
    const { editorialId } = req.params;
    const { isApproved } = req.body;

    const editorial = await Editorial.findById(editorialId);
    if (!editorial) {
      return res.status(404).json({ message: 'Editorial not found' });
    }

    editorial.isApproved = isApproved;
    await editorial.save();

    return res.status(200).json({ 
      message: `Editorial ${isApproved ? 'approved' : 'unapproved'} successfully`,
      editorial: {
        _id: editorial._id,
        title: editorial.title,
        isApproved: editorial.isApproved,
        userId: editorial.userId,
        problemId: editorial.problemId
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating editorial status', error: error.message });
  }
};

// ==================== MATCH MANAGEMENT ====================

const cancelMatchAdmin = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Update match status
    match.status = 'cancelled';
    match.winner = null;
    await match.save();

    // Notify players via socket if they are online
    // This would require socket implementation

    return res.status(200).json({ 
      message: 'Match cancelled successfully',
      match: {
        _id: match._id,
        player1: match.player1,
        player2: match.player2,
        status: match.status
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error cancelling match', error: error.message });
  }
};

// ==================== SYSTEM STATS ====================

const getSystemStats = async (req, res) => {
  try {
    // Count all documents
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalContests = await Contest.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalEditorials = await Editorial.countDocuments();
    const totalMatches = await Match.countDocuments();

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const recentSubmissions = await Submission.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const recentBlogs = await Blog.countDocuments({ createdAt: { $gte: oneDayAgo } });

    // Get active contests
    const now = new Date();
    const activeContests = await Contest.countDocuments({
      startTime: { $lte: now },
      $expr: { 
        $lte: [ 
          { $subtract: [now, '$startTime'] }, 
          { $multiply: ['$duration', 60 * 1000] } 
        ] 
      }
    });

    // Get leaderboard top 5
    const topUsers = await User.find()
      .select('username rating')
      .sort({ rating: -1 })
      .limit(5);

    // Get most solved problems
    const mostSolvedProblems = await Submission.aggregate([
      { $match: { verdict: 'ACCEPTED' } },
      { $group: { 
          _id: '$problemId', 
          solvedCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        } 
      },
      { $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      { $project: {
          problemId: '$_id',
          title: '$problem.title',
          rating: '$problem.rating',
          solvedCount: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { solvedCount: -1 } },
      { $limit: 5 }
    ]);

    return res.status(200).json({
      overall: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalContests,
        totalBlogs,
        totalEditorials,
        totalMatches
      },
      recent: {
        recentUsers,
        recentSubmissions,
        recentBlogs,
        activeContests
      },
      leaderboard: {
        topUsers,
        mostSolvedProblems
      },
      uptime: process.uptime()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching system stats', error: error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get recent submissions
    const recentSubmissions = await Submission.find({ createdAt: { $gte: oneDayAgo } })
      .populate('userId', 'username')
      .populate('problemId', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get recent users
    const recentUsers = await User.find({ createdAt: { $gte: oneDayAgo } })
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent blogs
    const recentBlogs = await Blog.find({ createdAt: { $gte: oneDayAgo } })
      .populate('userId', 'username')
      .select('title createdAt voteScore')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent matches
    const recentMatches = await Match.find({ createdAt: { $gte: oneDayAgo } })
      .populate('player1', 'username')
      .populate('player2', 'username')
      .populate('problem', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Format activities
    const activities = [
      ...recentSubmissions.map(sub => ({
        type: 'submission',
        action: 'submitted a solution',
        user: sub.userId?.username || 'Unknown',
        target: sub.problemId?.title || 'Unknown Problem',
        verdict: sub.verdict,
        timestamp: sub.createdAt,
        data: { submissionId: sub._id }
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        action: 'registered',
        user: user.username,
        target: 'Code Arena',
        timestamp: user.createdAt,
        data: { userId: user._id }
      })),
      ...recentBlogs.map(blog => ({
        type: 'blog',
        action: 'created a blog',
        user: blog.userId?.username || 'Unknown',
        target: blog.title,
        timestamp: blog.createdAt,
        data: { blogId: blog._id }
      })),
      ...recentMatches.map(match => ({
        type: 'match',
        action: 'completed a match',
        user: match.player1?.username || 'Unknown',
        target: match.player2?.username || 'Unknown',
        timestamp: match.createdAt,
        data: { 
          matchId: match._id,
          winner: match.winner 
        }
      }))
    ];

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({
      activities: activities.slice(0, 30) // Return top 30 most recent activities
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching recent activity', error: error.message });
  }
};

const getUserDetailedStats = async (req, res) => {
  try {
    const { userId } = req.params;
     
    // Get user details
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);

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
  // User Management
  updateUserRole,
  deleteUser,
  banUser,
  
  // Problem Management
  getAllProblemsAdmin,
  getProblemStats,
  rejudgeProblem,
  
  // Submission Management
  getSubmissionById,
  rejudgeSubmission,
  
  // Contest Management
  getAllContestsAdmin,
  getContestStats,
  
  // Blog Management
  getAllBlogsAdmin,
  updateBlogVisibility,
  
  // Editorial Management
  getAllEditorialsAdmin,
  updateEditorialStatus,
  
  // Match Management
  cancelMatchAdmin,
  
  // System Stats
  getSystemStats,
  getRecentActivity,

  //allAbouAUser
  getUserDetailedStats
};