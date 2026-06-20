import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../../../shared/services/api';
import { formatDate, timeAgo } from '../../../shared/utils/helpers';
import { useRef } from 'react';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  //const [filteredBlogs, setFilteredBlogs] = useState([]);
 // const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  
const [loading, setLoading] = useState(true);
const [loadingMore, setLoadingMore] = useState(false);
const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);

const observerRef = useRef();

  useEffect(() => {
    fetchBlogs(true);
  }, []);

  // useEffect(() => {
  //   filterAndSortBlogs();
  // }, [searchTerm, sortBy, blogs]);

  useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      if (
        entries[0].isIntersecting &&
        hasMore &&
        !loadingMore
      ) {
        fetchBlogs(false);
      }
    },
    {
      threshold: 1
    }
  );

  if (observerRef.current) {
    observer.observe(observerRef.current);
  }

  return () => observer.disconnect();

}, [cursor, hasMore, loadingMore]);

 const fetchBlogs = async (initial = false) => {
  try {
    if (initial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const response = await blogAPI.getAll(initial ? null : cursor,4);
    //console.log("Response:", response);

    if (initial) {
      setBlogs(response.blogs);
    } else {
      setBlogs(prev => [...prev, ...response.blogs]);
    }

    setCursor(response.nextCursor);
    setHasMore(response.hasMore);

  } catch (error) {
    console.error(error);
    console.log(error.response?.data);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};

 const displayedBlogs = [...blogs]
  .filter(blog => {
    if (!searchTerm) return true;

    return (
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })
  .sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);

      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);

      case "popular":
        return b.voteScore - a.voteScore;

      case "most-votes":
        return (
          (b.upVotes?.length + b.downVotes?.length) -
          (a.upVotes?.length + a.downVotes?.length)
        );

      default:
        return 0;
    }
  });

const handleVote = async (blogId, voteType) => {
  try {

    await blogAPI.vote(blogId, voteType);

    setBlogs(prev =>
      prev.map(blog => {
        if (blog._id !== blogId) return blog;

        return {
          ...blog,
          userVoteStatus: voteType
        };
      })
    );

  } catch (error) {
    console.error(error);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Community Blogs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share and learn from the developer community
            </p>
          </div>
          <Link
            to="/blogs/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Write a Blog
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blogs..."
              className="input-field"
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="most-votes">Most Votes</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setSortBy('newest');
              }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedBlogs?.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No blogs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try a different search term' : 'Be the first to write a blog!'}
            </p>
            <Link
              to="/blogs/new"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Write Your First Blog
            </Link>
          </div>
        ) : (
          displayedBlogs?.map((blog) => (
            <div
              key={blog._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Blog Image */}
              {blog.picture && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={blog.picture}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Blog Title */}
                <Link to={`/blogs/${blog._id}`}>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400">
                    {blog.title}
                  </h2>
                </Link>

                {/* Blog Excerpt */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {blog.content.substring(0, 150)}...
                </p>

                {/* Author and Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                      {blog.userId?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {blog.userId?.username || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {timeAgo(blog.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Votes and Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVote(blog._id, 'up')}
                      className={`flex items-center space-x-1 ${
                        blog.userVoteStatus === 'up'
                          ? 'text-green-600'
                          : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      <span>{blog.upVotes?.length || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleVote(blog._id, 'down')}
                      className={`flex items-center space-x-1 ${
                        blog.userVoteStatus === 'down'
                          ? 'text-red-600'
                          : 'text-gray-600 dark:text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>{blog.downVotes?.length || 0}</span>
                    </button>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Score: {(blog.upVotes?.length || 0) - (blog.downVotes?.length || 0)}
                    </div>
                  </div>

                  <Link
                    to={`/blogs/${blog._id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div ref={observerRef} className="flex justify-center py-8">

  {loadingMore && (
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
  )}

</div>

      {/* Popular Tags */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Popular Topics
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {['Algorithms', 'Data Structures', 'Web Development', 'Competitive Programming', 
            'JavaScript', 'Python', 'Interview Tips', 'System Design'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Writing Tips */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">✍️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Share Your Knowledge
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Writing blogs helps you solidify your understanding and helps others learn. 
            Share your experiences, tutorials, or insights with the community.
          </p>
          <Link
            to="/blogs/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Start Writing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogList;