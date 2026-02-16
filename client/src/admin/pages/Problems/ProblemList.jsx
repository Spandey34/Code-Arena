import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemAPI } from '../../../shared/services/api';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProblems, setFilteredProblems] = useState([]);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    const filtered = problems.filter(problem =>
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProblems(filtered);
  }, [searchTerm, problems]);

  const fetchProblems = async () => {
    try {
      const response = await problemAPI.getAll();
      setProblems(response.problems);
      setFilteredProblems(response.problems);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await problemAPI.delete(problemId);
        fetchProblems(); // Refresh list
      } catch (error) {
        console.error('Failed to delete problem:', error);
      }
    }
  };

  const toggleVisibility = async (problemId, currentVisibility) => {
    try {
      await problemAPI.toggleVisibility(problemId);
      fetchProblems(); // Refresh list
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const getDifficultyColor = (rating) => {
    if (rating <= 1200) return 'bg-green-100 text-green-800';
    if (rating <= 1800) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
            Problem Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all coding problems
          </p>
        </div>
        <Link
          to="/problems/add"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Add New Problem
        </Link>
      </div>

      {/* Search and Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{problems.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Problems</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {problems.filter(p => p.isPublic).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Public</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {problems.filter(p => !p.isPublic).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Private</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {problems.filter(p => p.rating >= 1600).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hard+</div>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems..."
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Visibility</div>
            <div className="col-span-3">Actions</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredProblems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No problems found. {searchTerm && 'Try a different search term.'}
              </p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div key={problem._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Title */}
                  <div className="col-span-5">
                    <div className="font-medium text-gray-800 dark:text-white mb-1">
                      {problem.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {problem.description.substring(0, 60)}...
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="col-span-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.rating)}`}>
                      {problem.rating <= 1200 ? 'Easy' : 
                       problem.rating <= 1800 ? 'Medium' : 'Hard'} ({problem.rating})
                    </span>
                  </div>

                  {/* Visibility */}
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        problem.isPublic ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm">
                        {problem.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3">
                    <div className="flex space-x-2">
                      <Link
                        to={`/problems/edit/${problem._id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleVisibility(problem._id, problem.isPublic)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 rounded text-sm"
                      >
                        {problem.isPublic ? 'Hide' : 'Show'}
                      </button>
                      <Link
                        to={`/problems/${problem._id}/submissions`}
                        className="px-3 py-1 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded text-sm"
                      >
                        Submissions
                      </Link>
                      <button
                        onClick={() => handleDelete(problem._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-sm"
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

      {/* Pagination */}
      {filteredProblems.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredProblems.length} of {problems.length} problems
          </div>
          <nav className="flex space-x-2">
            <button className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
              Previous
            </button>
            <button className="px-3 py-2 rounded-lg bg-blue-600 text-white">1</button>
            <button className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProblemList;