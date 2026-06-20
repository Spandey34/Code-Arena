const Blog = require('../models/blogModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        let pathPart = parts[1];
        if (pathPart.startsWith('v')) {
            const slashIndex = pathPart.indexOf('/');
            if (slashIndex !== -1) {
                pathPart = pathPart.substring(slashIndex + 1);
            }
        }
        const dotIndex = pathPart.lastIndexOf('.');
        if (dotIndex !== -1) {
            pathPart = pathPart.substring(0, dotIndex);
        }
        return pathPart;
    } catch (error) {
        return null;
    }
};

const createBlog = async (req, res) => {
    let pictureUrl = "";
    console.log("Ok");
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Please provide title and content' });
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "blogs"
            });
            pictureUrl = result.secure_url;
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {}
        }

        const blog = await Blog.create({
            title,
            content,
            picture: pictureUrl,
            userId: req.user._id,
            upVotes: [],
            downVotes: []
        });

        return res.status(201).json(blog);
    } catch (error) {
        if (pictureUrl) {
            const pubId = getPublicIdFromUrl(pictureUrl);
            if (pubId) await cloudinary.uploader.destroy(pubId);
        }
        return res.status(500).json({ message: 'Server error creating blog' });
    }
};

// const getAllBlogs = async (req, res) => {
//     try {
//         const blogs = await Blog.find({})
//             .populate('userId', 'username')
//             .sort({ createdAt: -1 });

//         const blogsWithStats = blogs.map(blog => {
//             const doc = blog.toObject();
//             doc.voteScore = blog.upVotes.length - blog.downVotes.length;
//             doc.userVoteStatus = req.user ? getVoteStatus(blog, req.user._id) : 'none';
//             return doc;
//         });

//         return res.status(200).json(blogsWithStats);
//     } catch (error) {
//         return res.status(500).json({ message: 'Server error fetching blogs' });
//     }
// };

const getAllBlogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        // const limit=16;
        const cursor = req.query.cursor;
       // console.log("limit:",limit)

        let query = {};

        if (cursor) {
            query._id = { $lt: cursor };
        }

        const blogs = await Blog.find(query)
            .populate("userId", "username")
            .sort({ createdAt: -1 })
            .limit(limit);

        const blogsWithStats = blogs.map(blog => {
            const doc = blog.toObject();

            doc.voteScore =
                blog.upVotes.length - blog.downVotes.length;

            doc.userVoteStatus = req.user
                ? getVoteStatus(blog, req.user._id)
                : "none";

            return doc;
        });

        const nextCursor =
            blogs.length > 0
                ? blogs[blogs.length - 1]._id
                : null;

        return res.status(200).json({
            blogs: blogsWithStats,
            nextCursor,
            hasMore: blogs.length === limit
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error fetching blogs"
        });
    }
};

const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('userId', 'username');

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const doc = blog.toObject();
        doc.voteScore = blog.upVotes.length - blog.downVotes.length;
        doc.userVoteStatus = req.user ? getVoteStatus(blog, req.user._id) : 'none';

        return res.status(200).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Server error fetching blog' });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this blog' });
        }

        if (req.file) {
            if (blog.picture) {
                const publicId = getPublicIdFromUrl(blog.picture);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "blogs"
            });
            blog.picture = result.secure_url;
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {}
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;

        const updatedBlog = await blog.save();
        return res.status(200).json(updatedBlog);
    } catch (error) {
        return res.status(500).json({ message: 'Server error updating blog' });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this blog' });
        }

        if (blog.picture) {
            const publicId = getPublicIdFromUrl(blog.picture);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await blog.deleteOne();
        return res.status(200).json({ message: 'Blog removed' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error deleting blog' });
    }
};

const voteBlog = async (req, res) => {
    const { voteType } = req.body;
    const userId = req.user._id;

    if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
    }

    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const isUpvoted = blog.upVotes.includes(userId);
        const isDownvoted = blog.downVotes.includes(userId);

        if (voteType === 'up') {
            if (isUpvoted) {
                blog.upVotes.pull(userId);
            } else {
                blog.upVotes.push(userId);
                if (isDownvoted) blog.downVotes.pull(userId);
            }
        } else if (voteType === 'down') {
            if (isDownvoted) {
                blog.downVotes.pull(userId);
            } else {
                blog.downVotes.push(userId);
                if (isUpvoted) blog.upVotes.pull(userId);
            }
        }

        await blog.save();

        return res.status(200).json({
            message: 'Vote registered',
            upVotes: blog.upVotes.length,
            downVotes: blog.downVotes.length,
            score: blog.upVotes.length - blog.downVotes.length,
            userStatus: getVoteStatus(blog, userId)
        });

    } catch (error) {
        return res.status(500).json({ message: 'Server error voting on blog' });
    }
};

const getVoteStatus = (blog, userId) => {
    if (blog.upVotes.includes(userId)) return 'up';
    if (blog.downVotes.includes(userId)) return 'down';
    return 'none';
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    voteBlog
};