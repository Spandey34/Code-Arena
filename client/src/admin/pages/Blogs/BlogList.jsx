import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../../../shared/services/api';
import { formatDate } from '../../../shared/utils/helpers';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [searchTerm, filter, blogs]);

  const fetchBlogs = async () => {
    try {
      const response = await blogAPI.getAll();
      setBlogs(response);
      setFilteredBlogs(response);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs;

    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'recent') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filter === 'popular') {
      filtered = [...filtered].sort((a, b) => 
        ((b.upVotes?.length || 0) - (b.downVotes?.length || 0)) - 
        ((a.upVotes?.length || 0) - (a.downVotes?.length || 0))
      );
    }

    setFilteredBlogs(filtered);
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogAPI.delete(blogId);
        fetchBlogs();
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  const getVoteScore = (blog) => {
    return (blog.upVotes?.length || 0) - (blog.downVotes?.length || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Blog Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and moderate community blogs
          </p>
        </div>
        <Link
          to="/admin/blogs/add"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create Blog
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-blue-600">{blogs.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Blogs</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-green-600">
            {blogs.reduce((acc, blog) => acc + (blog.upVotes?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Upvotes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-red-600">
            {blogs.reduce((acc, blog) => acc + (blog.downVotes?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Downvotes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-purple-600">
            {blogs.length > 0 ? Math.round(blogs.reduce((acc, blog) => acc + getVoteScore(blog), 0) / blogs.length) : 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blogs..."
              className="input-field"
            />
          </div>
          
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Blogs</option>
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-4">Title</div>
            <div className="col-span-3">Author</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Score</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredBlogs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No blogs found. {searchTerm && 'Try a different search term.'}
              </p>
            </div>
          ) : (
            filteredBlogs.map((blog) => (
              <div key={blog._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Title */}
                  <div className="col-span-4">
                    <div className="font-medium text-gray-800 dark:text-white mb-1">
                      {blog.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {blog.content.substring(0, 80)}...
                    </div>
                  </div>

                  {/* Author */}
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                        {blog.userId?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm text-gray-800 dark:text-white">
                          {blog.userId?.username || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(blog.createdAt)}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        getVoteScore(blog) > 0 ? 'bg-green-100 text-green-800' :
                        getVoteScore(blog) < 0 ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getVoteScore(blog)} score
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        ({blog.upVotes?.length || 0}↑/{blog.downVotes?.length || 0}↓)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/blogs/${blog._id}`}
                        className="px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded text-xs"
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogList;