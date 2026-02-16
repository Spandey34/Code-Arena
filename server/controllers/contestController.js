const Contest = require('../models/contestModel');
const Submission = require('../models/submissionModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const ContestResult = require('../models/contestResultModel');

const createContest = async (req, res) => {
    try {
        const { name, problems, startTime, duration } = req.body;

        const existingContest = await Contest.findOne({ name });
        if (existingContest) {
            return res.status(400).json({ message: 'Contest with this name already exists' });
        }

        const contest = await Contest.create({
            name,
            problems,
            startTime,
            duration,
            registeredUsers: [],
            status: 'upcoming'
        });

        return res.status(201).json(contest);
    } catch (error) {
        return res.status(500).json({ message: 'Server error creating contest', error: error.message });
    }
};

const getAllContests = async (req, res) => {
    try {
        const contests = await Contest.aggregate([
            // 1. Sort first
            { $sort: { startTime: -1 } },

            // 2. Add counts for BOTH registeredUsers and problems
            {
                $addFields: {
                    registeredUsersCount: { $size: { $ifNull: ["$registeredUsers", []] } },
                    problemsCount: { $size: { $ifNull: ["$problems", []] } } // Added this line
                }
            },

            // 3. Exclude the heavy arrays
            {
                $project: {
                    problems: 0,
                    registeredUsers: 0,
                    __v: 0
                }
            }
        ]);

        return res.status(200).json(contests);
    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching contests' });
    }
};

const getContestById = async (req, res) => {
    try {
        let contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const now = new Date();
        const start = new Date(contest.startTime);

        if (now < start && (!req.user || !req.user.isAdmin)) {
            contest = await Contest.findById(req.params.id)
                .select('-problems');
        } else {
            contest = await Contest.findById(req.params.id)
                .populate('problems', 'title difficulty slug')
                .populate('registeredUsers', 'name');
        }

        return res.status(200).json(contest);
    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching contest' });
    }
};

const registerForContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(start.getTime() + contest.duration * 60000);

        if (now > end) {
            return res.status(400).json({ message: 'Contest has already ended' });
        }

        if (contest.registeredUsers.includes(req.user._id)) {
            return res.status(400).json({ message: 'User already registered' });
        }

        contest.registeredUsers.push(req.user._id);
        await contest.save();

        return res.status(200).json({ message: 'Registered successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error registering for contest' });
    }
};

const deleteContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        await contest.deleteOne();
        return res.status(200).json({ message: 'Contest removed' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error deleting contest' });
    }
};

const updateContestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const contest = await Contest.findByIdAndUpdate(
            req.params.id,
            { status: status.status },
        );
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        return res.status(200).json(contest);
    } catch (error) {
        return res.status(500).json({ message: 'Server error updating status' });
    }
};

const standings = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id).populate('registeredUsers', 'username email');

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const contestStart = new Date(contest.startTime);
        const contestEnd = new Date(contestStart.getTime() + contest.duration * 60 * 1000);

        const submissions = await Submission.find({
            problemId: { $in: contest.problems },
            createdAt: { $gte: contestStart, $lte: contestEnd }
        }).sort('createdAt');

        const leaderboard = {};

        contest.registeredUsers.forEach(user => {
            leaderboard[user._id] = {
                userId: user._id,
                username: user.username,
                email: user.email,
                solvedCount: 0,
                totalPenalty: 0,
                problems: {}
            };

            contest.problems.forEach(pid => {
                leaderboard[user._id].problems[pid] = {
                    solved: false,
                    penalty: 0,
                    wrongAttempts: 0
                };
            });
        });

        submissions.forEach(sub => {
            const userId = sub.userId.toString();
            const problemId = sub.problemId.toString();

            if (!leaderboard[userId]) return;

            const userStats = leaderboard[userId];
            const problemStats = userStats.problems[problemId];

            if (problemStats.solved) return;

            if (sub.verdict === 'ACCEPTED') {
                problemStats.solved = true;

                const timeTakenMs = new Date(sub.createdAt) - contestStart;
                const timeTakenMinutes = Math.floor(timeTakenMs / 1000 / 60);

                const penaltyForProblem = timeTakenMinutes + (problemStats.wrongAttempts * 5);

                userStats.totalPenalty += penaltyForProblem;
                userStats.solvedCount += 1;
            } else {
                problemStats.wrongAttempts += 1;
            }
        });

        const sortedLeaderboard = Object.values(leaderboard).sort((a, b) => {
            if (b.solvedCount !== a.solvedCount) {
                return b.solvedCount - a.solvedCount;
            }
            return a.totalPenalty - b.totalPenalty;
        });

        const rankedResults = sortedLeaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        return res.status(200).json(rankedResults);

    } catch (error) {
        return res.status(500).json({ message: 'Server error calculating leaderboard', error: error.message });
    }
};

const getContestSubmissions = async (req, res) => {
    const { id } = req.params;
    const isAdmin = req.user.isAdmin;
    if (isAdmin === false) {
        try {
            const contest = await Contest.findById(id);
            if (!contest) {
                return res.status(404).json({ message: 'Contest not found' });
            }
            const submissions = await Submission.find({
                problemId: { $in: contest.problems },
                userId: req.user._id
            }).populate('problemId', 'title');
            return res.status(200).json(submissions);
        } catch (error) {
            return res.status(500).json({ message: 'Server error fetching submissions', error: error.message });
        }
    }
    try {
        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        const contestStart = new Date(contest.startTime);
        const contestEnd = new Date(contestStart.getTime() + contest.duration * 60 * 1000);
        const submissions = await Submission.find({
            problemId: { $in: contest.problems },
            createdAt: { $gte: contestStart, $lte: contestEnd }
        }).populate('userId', 'username').populate('problemId', 'title');
        return res.status(200).json(submissions);
    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching submissions', error: error.message });
    }
}

const getEloWinProbability = (ratingA, ratingB) => {
    return 1.0 / (1.0 + Math.pow(10, (ratingB - ratingA) / 400.0));
};

const getSeed = (rating, allParticipants, excludeId) => {
    let seed = 1;
    for (const opponent of allParticipants) {
        if (opponent.id !== excludeId) {
            seed += getEloWinProbability(opponent.rating, rating);
        }
    }
    return seed;
};

const getRatingForRank = (targetRank, allParticipants, excludeId) => {
    let left = 1;
    let right = 100000; // INCREASED CAP to prevent "Rank 1 rating drop" bug for high rated users
    
    for (let i = 0; i < 100; i++) {
        const mid = (left + right) / 2;
        const seed = getSeed(mid, allParticipants, excludeId);
        if (seed > targetRank) {
            left = mid; 
        } else {
            right = mid;
        }
    }
    return left;
};

// ==========================================
// 2. MAIN CONTROLLER LOGIC
// ==========================================

const updateContestRatings = async (req, res) => {
    const { contestId } = req.params;
    
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        // --- Step 1: Validation ---
        const contest = await Contest.findById(contestId).session(session);
        if (!contest) throw new Error('Contest not found');
        if (contest.isRatingCalculated) throw new Error('Ratings already calculated for this contest');
        if (contest.status !== 'completed') throw new Error('Contest is not completed yet');

        // --- Step 2: Calculate Standings (Score & Penalty) ---
        
        // Fetch all submissions, sorted by TIME (oldest first)
        // This is crucial to count "previous" wrong submissions correctly
        const submissions = await Submission.find({ 
            problemId: { $in: contest.problems },
            createdAt: { 
                $gte: contest.startTime, 
                $lte: new Date(contest.startTime.getTime() + contest.duration * 60000) 
            } 
        })
        .sort({ createdAt: 1 }) // Process chronologically
        .populate('userId', 'rating')
        .lean();

        const participantsMap = new Map(); 
        // Structure: userId -> { id, rating, solvedSet, totalPenalty, problemStats: { probId: { wrongCount: 0, solved: false } } }

        submissions.forEach(sub => {
            if (!sub.userId) return;
            const uId = sub.userId._id.toString();
            const pId = sub.problemId.toString();

            // Initialize user
            if (!participantsMap.has(uId)) {
                participantsMap.set(uId, { 
                    id: uId, 
                    rating: sub.userId.rating || 0, // Default to 0
                    solvedCount: 0,
                    totalPenalty: 0,
                    problemStats: {} // Track wrong tries per problem
                });
            }

            const userStat = participantsMap.get(uId);

            // Initialize problem stats for this user
            if (!userStat.problemStats[pId]) {
                userStat.problemStats[pId] = { wrongCount: 0, solved: false };
            }

            const pStat = userStat.problemStats[pId];

            // If already solved, ignore further submissions for this problem
            if (pStat.solved) return;

            const verdict = sub.verdict ? sub.verdict.toUpperCase() : '';

            if (verdict === 'ACCEPTED' || verdict === 'AC') {
                // MARK AS SOLVED
                pStat.solved = true;
                userStat.solvedCount += 1;

                // Calculate Penalty for this problem
                // 1. Time Penalty: Minutes since start
                const timeInMinutes = (new Date(sub.createdAt) - new Date(contest.startTime)) / 60000;
                
                // 2. Wrong Submission Penalty: 5 mins per wrong try
                const wrongPenalty = pStat.wrongCount * 5;

                userStat.totalPenalty += (timeInMinutes + wrongPenalty);
            } else {
                // MARK AS WRONG (Only counts if eventually solved)
                // Note: Compilation Errors usually don't count, but here we count everything that isn't AC
                pStat.wrongCount += 1;
            }
        });

        // Convert Map to Array
        let participants = Array.from(participantsMap.values()).map(p => ({
            id: p.id,
            rating: p.rating,
            score: p.solvedCount,
            penalty: p.totalPenalty
        }));

        if (participants.length === 0) {
            contest.isRatingCalculated = true;
            await contest.save({ session });
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ success: true, message: 'No participants to rate.' });
        }

        // --- Step 3: Sort & Rank ---
        // Priority 1: High Score
        // Priority 2: Low Penalty
        participants.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.penalty - b.penalty;
        });

        // Assign Ranks (Handling Ties)
        participants.forEach((p, index) => {
            if (index > 0) {
                const prev = participants[index - 1];
                // If Score AND Penalty are basically identical (within 0.1 float margin)
                if (p.score === prev.score && Math.abs(p.penalty - prev.penalty) < 0.1) {
                    p.rank = prev.rank;
                } else {
                    p.rank = index + 1;
                }
            } else {
                p.rank = 1;
            }
        });

        // --- Step 4: Calculate Rating Changes ---
        const updates = [];
        const VOLATILITY_FACTOR = 0.25; 
        const MAX_DELTA = 200;
        const PARTICIPATION_BONUS = 5;

        for (const p of participants) {
            const seed = getSeed(p.rating, participants, p.id);
            const geometricMeanRank = Math.sqrt(seed * p.rank);
            const performanceRating = getRatingForRank(geometricMeanRank, participants, p.id);
            
            let rawDelta = (performanceRating - p.rating) * VOLATILITY_FACTOR;
            
            // SAFETY: If Rank 1, never lose rating.
            if (p.rank === 1 && rawDelta < 0) {
                rawDelta = 0;
            }

            // Cap Changes
            if (rawDelta > MAX_DELTA) rawDelta = MAX_DELTA;
            if (rawDelta < -MAX_DELTA) rawDelta = -MAX_DELTA;
            
            // Apply Bonus (Optional: don't give bonus to high rated players)
            let bonus = PARTICIPATION_BONUS;
            if (p.rating > 2000) bonus = 0; 

            let finalDelta = Math.round(rawDelta + bonus);
            let newRating = p.rating + finalDelta;
            if (newRating < 0) newRating = 0;

            updates.push({
                userId: p.id,
                contestId: contest._id,
                rank: p.rank,
                oldRating: p.rating,
                newRating: newRating,
                delta: finalDelta
            });
        }

        // --- Step 5: Database Commit ---
        
        // 1. Update Users
        const userBulkOps = updates.map(u => ({
            updateOne: {
                filter: { _id: u.userId },
                update: { $set: { rating: u.newRating } }
            }
        }));

        if (userBulkOps.length > 0) {
            await User.bulkWrite(userBulkOps, { session });
        }

        // 2. Save History
        if (updates.length > 0) {
            await ContestResult.insertMany(updates, { session });
        }

        // 3. Close Contest
        contest.isRatingCalculated = true;
        await contest.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ 
            success: true, 
            message: 'Ratings updated successfully', 
            count: updates.length,
            updates 
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Rating Update Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createContest,
    getAllContests,
    getContestById,
    registerForContest,
    deleteContest,
    updateContestStatus,
    standings,
    getContestSubmissions,
    updateContestRatings
};