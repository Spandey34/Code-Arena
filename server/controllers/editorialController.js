const Editorial = require('../models/editorialModel');
const Problem = require('../models/problemModel'); 

const createEditorial = async (req, res) => {
    const { title, content, code, language, problemId } = req.body;

    try {
        const problemExists = await Problem.findById(problemId);
        if (!problemExists) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const editorial = await Editorial.create({
            userId: req.user._id,
            problemId,
            title,
            content,
            code,
            language,
            upVotes: [],
            downVotes: []
        });

        return res.status(201).json(editorial);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error creating editorial' });
    }
};

const getEditorialsByProblem = async (req, res) => {
    try {
        const { problemId } = req.params;

        const editorials = await Editorial.find({ problemId })
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });

        const editorialsWithScore = editorials.map(ed => {
            const doc = ed.toObject();
            doc.voteScore = ed.upVotes.length - ed.downVotes.length;
            doc.userVoteStatus = req.user ? getVoteStatus(ed, req.user._id) : 'none';
            return doc;
        });

        return res.status(200).json(editorialsWithScore);

    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching editorials' });
    }
};

const getEditorialById = async (req, res) => {
    try {
        const editorial = await Editorial.findById(req.params.id)
            .populate('userId', 'name')
            .populate('problemId', 'title difficulty');

        if (!editorial) {
            return res.status(404).json({ message: 'Editorial not found' });
        }

        const doc = editorial.toObject();
        doc.voteScore = editorial.upVotes.length - editorial.downVotes.length;
        doc.userVoteStatus = req.user ? getVoteStatus(editorial, req.user._id) : 'none';
        
        return res.status(200).json(doc);

    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching editorial' });
    }
};

const updateEditorial = async (req, res) => {
    const { title, content, code, language } = req.body;

    try {
        const editorial = await Editorial.findById(req.params.id);

        if (!editorial) {
            return res.status(404).json({ message: 'Editorial not found' });
        }

        if (editorial.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this editorial' });
        }

        editorial.title = title || editorial.title;
        editorial.content = content || editorial.content;
        editorial.code = code || editorial.code;
        editorial.language = language || editorial.language;

        const updatedEditorial = await editorial.save();
        return res.status(200).json(updatedEditorial);

    } catch (error) {
        return res.status(500).json({ message: 'Server error updating editorial' });
    }
};

const deleteEditorial = async (req, res) => {
    try {
        const editorial = await Editorial.findById(req.params.id);

        if (!editorial) {
            return res.status(404).json({ message: 'Editorial not found' });
        }

        if (editorial.userId.toString() !== req.user._id.toString() && req.user.isAdmin !== true) {
            return res.status(403).json({ message: 'Not authorized to delete this editorial' });
        }

        await editorial.deleteOne();
        return res.status(200).json({ message: 'Editorial removed' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error deleting editorial' });
    }
};

const voteEditorial = async (req, res) => {
    const { voteType } = req.body;
    const userId = req.user._id;

    if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type. Use 'up' or 'down'." });
    }

    try {
        const editorial = await Editorial.findById(req.params.id);

        if (!editorial) {
            return res.status(404).json({ message: 'Editorial not found' });
        }

        const isUpvoted = editorial.upVotes.includes(userId);
        const isDownvoted = editorial.downVotes.includes(userId);

        if (voteType === 'up') {
            if (isUpvoted) {
                editorial.upVotes.pull(userId);
            } else {
                editorial.upVotes.push(userId);
                if (isDownvoted) editorial.downVotes.pull(userId);
            }
        } else if (voteType === 'down') {
            if (isDownvoted) {
                editorial.downVotes.pull(userId);
            } else {
                editorial.downVotes.push(userId);
                if (isUpvoted) editorial.upVotes.pull(userId);
            }
        }

        await editorial.save();

        return res.status(200).json({
            message: 'Vote registered',
            upVotes: editorial.upVotes.length,
            downVotes: editorial.downVotes.length,
            score: editorial.upVotes.length - editorial.downVotes.length,
            userStatus: getVoteStatus(editorial, userId)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error voting' });
    }
};

const getVoteStatus = (editorial, userId) => {
    if (editorial.upVotes.includes(userId)) return 'up';
    if (editorial.downVotes.includes(userId)) return 'down';
    return 'none';
};

module.exports = {
    createEditorial,
    getEditorialsByProblem,
    getEditorialById,
    updateEditorial,
    deleteEditorial,
    voteEditorial
};