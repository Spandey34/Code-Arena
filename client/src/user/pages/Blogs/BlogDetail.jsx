import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogAPI } from '../../../shared/services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate, timeAgo } from '../../../shared/utils/helpers';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Data States
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interaction States
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]); 
  const [voting, setVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBlog();
    // fetchComments(); 
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getById(id);
      setBlog(response);
      // Initialize edit form data
      setEditTitle(response.title);
      setEditContent(response.content);
    } catch (error) {
      setError('Failed to load blog');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Check Ownership ---
  const isAuthor = () => {
    if (!user || !blog) return false;
    if (user.isAdmin) return true;
    const authorId = blog.userId?._id || blog.userId;
    return authorId === user._id;
  };

  // --- Handlers ---

  const handleDeleteBlog = async () => {
    // Simple native dialog for delete confirmation
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await blogAPI.delete(id);
        navigate('/blogs', { replace: true });
      } catch (error) {
        console.error('Failed to delete blog:', error);
        alert('Failed to delete blog');
        setIsDeleting(false);
      }
    }
  };

  const handleUpdateClick = () => {
    setEditTitle(blog.title);
    setEditContent(blog.content);
    setEditImage(null);
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('content', editContent);
    if (editImage) {
      formData.append('picture', editImage);
    }

    try {
      // Axios automatically handles FormData headers
      const updatedBlog = await blogAPI.update(id, formData);
      setBlog(updatedBlog);
      setShowEditModal(false);
      alert('Blog updated successfully!');
    } catch (error) {
      console.error('Failed to update blog:', error);
      alert('Failed to update blog. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setVoting(true);
    try {
      const response = await blogAPI.vote(id, voteType);
      // Optimistic update or refetch
      fetchBlog(); 
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!comment.trim()) return;
    
    // Mock comment logic
    const newComment = {
      id: Date.now(),
      author: user.username,
      content: comment,
      createdAt: new Date(),
      votes: 0
    };
    setComments([newComment, ...comments]);
    setComment('');
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (error || !blog) return <div className="text-center p-8 text-red-600">{error || 'Blog not found'}</div>;

  const voteScore = (blog.upVotes?.length || 0) - (blog.downVotes?.length || 0);
  const userVoteStatus = blog.userVoteStatus || 'none';

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link to="/blogs" className="text-blue-600 hover:text-blue-800 flex items-center">
            ← Back to Blogs
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{blog.title}</h1>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span className="font-semibold text-blue-600">{blog.userId?.username || 'Anonymous'}</span>
                <span>{formatDate(blog.createdAt)}</span>
                <span>{blog.readTime || '5'} min read</span>
              </div>
            </div>

            {/* ACTION BUTTONS (Edit/Delete) */}
            {isAuthor() && (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteBlog}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {blog.picture && (
          <img 
            src={blog.picture} 
            alt={blog.title} 
            className="w-full h-96 object-cover rounded-xl mb-8 shadow-md"
          />
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 mb-8">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {blog.content}
          </div>
          
          {/* Voting */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center space-x-4">
             <button
                onClick={() => handleVote('up')}
                disabled={voting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  userVoteStatus === 'up' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>▲ Upvote ({blog.upVotes?.length || 0})</span>
              </button>
              <span className={`font-bold text-xl ${voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {voteScore}
              </span>
              <button
                onClick={() => handleVote('down')}
                disabled={voting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  userVoteStatus === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>▼ Downvote ({blog.downVotes?.length || 0})</span>
              </button>
          </div>
        </div>

        {/* Comments Section (Simplified for brevity as requested, logic remains same) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
          <h3 className="text-xl font-bold mb-4">Comments</h3>
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
              rows="3"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Post</button>
          </form>
          <div>
            {comments.map(c => (
              <div key={c.id} className="border-b py-4">
                <div className="font-bold">{c.author}</div>
                <div>{c.content}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Blog</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit}>
                {/* Title Input */}
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Content Input */}
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Content</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="8"
                    className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Image Input */}
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                    Update Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files[0])}
                    className="w-full text-gray-700 dark:text-gray-300"
                  />
                  {/* Preview of current image if no new one selected */}
                  {!editImage && blog.picture && (
                    <div className="mt-2 text-sm text-gray-500">
                      Current image will be kept if no file is chosen.
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BlogDetail;