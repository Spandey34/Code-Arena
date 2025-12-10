const User = require('../models/User');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate({
                path: 'gameHistory.gameId',
                select: 'winner problem startTime status',
                populate: {
                    path: 'problem',
                    select: 'title'
                }
            });

        if (user) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            user.gameHistory = user.gameHistory.filter(
                (history) => history.gameId.startTime > twentyFourHoursAgo
            );

            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find().sort({ rating: -1 }).select('username rating');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, getLeaderboard };