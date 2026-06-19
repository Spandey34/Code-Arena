
const { waitingQueue, onlineUsers } = require('../services/store');
const { io } = require('../services/socketService');
const Match = require('../models/matchModel');
const Problem = require('../models/problemModel');
const Contest = require('../models/contestModel');
const Submission = require('../models/submissionModel');
const submissionQueue = require('../queues/submissionQueue');
const { tryCatch } = require('bullmq');

const findMatch = async (req, res) => {
    const userId = req.user._id.toString();
    const userRating = req.user.rating;
    const socketId = onlineUsers.get(userId);
    try {
        if(waitingQueue.has(socketId))

        {
            
            return res.status(500).json({ message: "Already In Queue" });
        }
        if (waitingQueue.size > 0) {
            
            const results = Array.from(waitingQueue.values()).filter(player =>
                player.rating >= (userRating - 300) && player.rating <= (userRating + 300)
            );
            const socket = io.sockets.sockets.get(socketId);

            if (results.length === 0) {
                waitingQueue.set(socketId, { rating: userRating, userId: userId });
                if(socket)
                {
                    socket.emit('waitingForOpponent', { message: "Searching"});
                }
                return res.status(200).json({ message: "Waiting For Opponent" });
            }

            const randomPlayer = results[Math.floor(Math.random() * results.length)];
            const opponentId = randomPlayer.userId;
            const opponentSocketId = onlineUsers.get(opponentId);
            waitingQueue.delete(opponentSocketId);
            const r = Math.random();
            let problem = await Problem.findOne({
                isPublic: true,
                random_score: { $gte: r }
            }).sort({ random_score: 1 });

            if (!problem) {
                problem = await Problem.findOne({
                    isPublic: true
                }).sort({ random_score: 1 });
            }
            const match = await Match.create({ player1: userId, player2: opponentId, problem: problem._id });
            const opponentSocket = io.sockets.sockets.get(opponentSocketId);
            if (socket) {
                socket.emit('matchFound', { matchId: match._id });
            }
            if (opponentSocket) {
                opponentSocket.emit('matchFound', { matchId: match._id });
            }
            return res.status(200).json({ message: "Match found", matchId: match._id });
        }
        else {
            waitingQueue.set(socketId, { rating: userRating, userId: userId });
            return res.status(200).json({ message: "Waiting For Opponent" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error finding match", error: error.message });
    }
};

const cancelMatch = async(req,res) => {
    const socketId = onlineUsers.get(req.user._id.toString());
    if(waitingQueue.has(socketId)){
        waitingQueue.delete(socketId);
        return res.status(200).json({ message: "Matchmaking cancelled" });
    } else {
        return res.status(400).json({ message: "You are not in the matchmaking queue" });
    }
}

const submitMatchCode = async (req, res) => {
    const { matchId } = req.params;
    const { code, language } = req.body;
    const userId = req.user._id.toString();
    try {
        const match = await Match.findById(matchId).populate('problem');
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }
        if (match.player1.toString() !== userId && match.player2.toString() !== userId) {
            return res.status(403).json({ message: "You are not a participant of this match" });
        }

        if(match.status === 'completed') {
            return res.status(400).json({ message: "Match already completed" });
        }
        const problemId = match.problem._id;

        try {
            // 1. Validate Problem
            const problem = await Problem.findById(problemId);
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }

            // 3. Create Submission Document (QUEUED)
            const submission = await Submission.create({
                userId,
                problemId,
                code,
                language,
                verdict: 'QUEUED',
                createdAt: new Date()
            });

            // 4. Add to Queue with type 'submit'
            // We only need the ID because the worker will fetch the rest from DB
            await submissionQueue.add('submission-queue', {
                type: 'submit',
                submissionId: submission._id.toString(),
                userId: userId.toString(),
                problemId,
                code,
                language
            });

            return res.status(201).json({
                verdict: 'QUEUED',
                submissionId: submission._id
            });

        } catch (error) {
            return res.status(500).json({ message: "Error creating submission", error: error.message });
        }
    } catch (error) {

    }
};

const matchById = async (req, res) => {
    const { matchId } = req.params;
    const userId = req.user._id.toString();
    try{
        const match = await Match.findById(matchId)
        .populate('player1', 'username')
        .populate('player2', 'username')
        .populate('problem', 'title');
        if(!match){
            return res.status(404).json({ message: "Match not found" });
        }
        if(match.player1._id.toString() !== userId && match.player2._id.toString() !== userId){
            return res.status(403).json({ message: "You are not a participant of this match" });
        }
        return res.status(200).json({ match });
    }
    catch (error)
    {
        return res.status(500).json({ message: "Error fetching match", error: error.message });
    }
}

const allMatches = async(req,res) => {
    const userId = req.user._id.toString();
    const isAdmin = req.user.isAdmin;
    try {
        let matches = [];
        if(isAdmin){
            matches = await Match.find({})
            .populate('player1', 'username')
            .populate('player2', 'username')
            .populate('problem', 'title');
        } else {
            matches = await Match.find({ $or: [{ player1: userId }, { player2: userId }] })
            .populate('player1', 'username')
            .populate('player2', 'username')
            .populate('problem', 'title');
        }
        return res.status(200).json({ matches });
    }
    catch (error)
    {
        return res.status(500).json({ message: "Error fetching matches", error: error.message });
    }
}

module.exports = {
    waitingQueue,
    findMatch,
    cancelMatch,
    submitMatchCode,
    matchById,
    allMatches
};