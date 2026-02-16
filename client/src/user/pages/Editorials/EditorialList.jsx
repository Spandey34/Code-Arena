import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { editorialAPI, problemAPI } from '../../../shared/services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../shared/utils/helpers';

const EditorialList = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [problem, setProblem] = useState(null);
  const [editorials, setEditorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterLanguage, setFilterLanguage] = useState('all');

  useEffect(() => {
    fetchData();
  }, [problemId]);

  const fetchData = async () => {
    try {
      const [problemRes, editorialsRes] = await Promise.all([
        problemAPI.getById(problemId),
        editorialAPI.getByProblem(problemId)
      ]);
      
      setProblem(problemRes.problem);
      setEditorials(editorialsRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (editorialId, voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await editorialAPI.vote(editorialId, voteType);
      fetchData(); // Refresh editorials
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const sortedEditorials = [...editorials].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'votes') {
      const aScore = (a.upVotes?.length || 0) - (a.downVotes?.length || 0);
      const bScore = (b.upVotes?.length || 0) - (b.downVotes?.length || 0);
      return bScore - aScore;
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0;
  });

  const filteredEditorials = filterLanguage === 'all' 
    ? sortedEditorials
    : sortedEditorials.filter(e => e.language === filterLanguage);

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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Editorials for: {problem?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View community solutions and explanations
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/practice/problem/${problemId}`}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Back to Problem
            </Link>
            <Link
              to={`/editorials/${problemId}/new`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Write Editorial
            </Link>
          </div>
        </div>
      </div>

      {/* Problem Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {problem?.title}
            </h2>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                problem?.rating <= 1200 ? 'bg-green-100 text-green-800' :
                problem?.rating <= 1800 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem?.rating <= 1200 ? 'Easy' : 
                 problem?.rating <= 1800 ? 'Medium' : 'Hard'} ({problem?.rating})
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {editorials.length} editorial(s) available
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Solved by
            </div>
            <div className="text-2xl font-bold text-green-600">
              1,234 users
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="newest">Newest First</option>
              <option value="votes">Most Votes</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Language
            </label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="input-field"
            >
              <option value="all">All Languages</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSortBy('newest');
                setFilterLanguage('all');
              }}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Editorials List */}
      <div className="space-y-6">
        {filteredEditorials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No editorials found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filterLanguage !== 'all' 
                ? 'No editorials available in this language' 
                : 'Be the first to write an editorial!'}
            </p>
            <Link
              to={`/editorials/${problemId}/new`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Write First Editorial
            </Link>
          </div>
        ) : (
          filteredEditorials.map((editorial) => {
            const voteScore = (editorial.upVotes?.length || 0) - (editorial.downVotes?.length || 0);
            const userVoteStatus = editorial.userVoteStatus || 'none';
            
            return (
              <div key={editorial._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {editorial.title}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                            {editorial.userId?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {editorial.userId?.username || 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(editorial.createdAt)}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                          {editorial.language}
                        </span>
                      </div>
                    </div>
                    
                    {/* Vote Section */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(editorial._id, 'up')}
                        className={`p-2 rounded ${
                          userVoteStatus === 'up'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <div className={`font-bold text-lg min-w-8 text-center ${
                        voteScore > 0 ? 'text-green-600' :
                        voteScore < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {voteScore}
                      </div>
                      
                      <button
                        onClick={() => handleVote(editorial._id, 'down')}
                        className={`p-2 rounded ${
                          userVoteStatus === 'down'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Editorial Excerpt */}
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                      {editorial.content}
                    </p>
                  </div>
                  
                  {/* Code Preview */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code Solution:
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                      <code>
                        {editorial.code.substring(0, 200)}...
                      </code>
                    </pre>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {(editorial.upVotes?.length || 0) + (editorial.downVotes?.length || 0)} votes • 
                      {editorial.comments?.length || 0} comments
                    </div>
                    <Link
                      to={`/editorials/view/${editorial._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Read Full Editorial
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Guidelines */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 dark:text-white mb-3">
          Editorial Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• Explain your approach clearly and concisely</li>
          <li>• Include time and space complexity analysis</li>
          <li>• Provide well-commented code</li>
          <li>• Mention alternative solutions if applicable</li>
          <li>• Be respectful and helpful to other learners</li>
          <li>• Upvote helpful editorials and downvote incorrect ones</li>
        </ul>
      </div>
    </div>
  );
};

export default EditorialList;