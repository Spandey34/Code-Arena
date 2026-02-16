import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../../../shared/services/api';
import { formatDate } from '../../../shared/utils/helpers';
import { useAuth } from '../../../contexts/AuthContext';

const BlogManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [votes, setVotes] = useState({
    upVotes: [],
    downVotes: []
  });

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getById(id);
      setBlog(response);
      setFormData({
        title: response.title,
        content: response.content
      });
      setVotes({
        upVotes: response.upVotes || [],
        downVotes: response.downVotes || []
      });
    } catch (error) {
      console.error('Failed to fetch blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async () => {
    try {
      await blogAPI.update(id, formData);
      setEditing(false);
      fetchBlog();
    } catch (error) {
      console.error('Failed to update blog:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogAPI.delete(id);
        navigate('/blogs');
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  const handleRemoveVote = async (userId, voteType) => {
    try {
      // In a real implementation, you would have an admin endpoint to remove votes
      console.log('Remove vote:', { userId, voteType });
      // For now, just refresh
      fetchBlog();
    } catch (error) {
      console.error('Failed to remove vote:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Blog not found</h1>
        <button
          onClick={() => navigate('/admin/blogs')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Blog Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage blog details and moderation
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/blogs')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Blog Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Blog Details
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editing ? 'Cancel Edit' : 'Edit Blog'}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Blog
                </button>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="15"
                    className="input-field"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {blog.title}
                </h1>
                
                {blog.picture && (
                  <div className="mb-6">
                    <img
                      src={blog.picture}
                      alt={blog.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <div className="whitespace-pre-line">{blog.content}</div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Created: {formatDate(blog.createdAt)}
                    {blog.updatedAt !== blog.createdAt && (
                      <span> • Updated: {formatDate(blog.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Author Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Author Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  {blog.userId?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-bold text-gray-800 dark:text-white">
                    {blog.userId?.username || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {blog.userId?.email || 'No email'}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  User ID: {blog.userId?._id?.slice(0, 8)}...
                </div>
              </div>
            </div>
          </div>

          {/* Vote Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Vote Statistics
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {votes.upVotes.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Upvotes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {votes.downVotes.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Downvotes
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    votes.upVotes.length - votes.downVotes.length > 0 ? 'text-green-600' :
                    votes.upVotes.length - votes.downVotes.length < 0 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {votes.upVotes.length - votes.downVotes.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Score
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Voters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Recent Voters
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {votes.upVotes.slice(0, 5).map((userId, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs mr-2">
                      ↑
                    </div>
                    <span className="text-sm text-gray-800 dark:text-white">
                      User {userId.slice(0, 6)}...
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveVote(userId, 'up')}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {votes.downVotes.slice(0, 5).map((userId, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs mr-2">
                      ↓
                    </div>
                    <span className="text-sm text-gray-800 dark:text-white">
                      User {userId.slice(0, 6)}...
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveVote(userId, 'down')}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {(votes.upVotes.length === 0 && votes.downVotes.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No votes yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogManagement;