import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemAPI } from '../../../shared/services/api';
import ProblemCard from '../../components/ProblemCard';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [searchTerm, difficultyFilter, problems]);

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

  const filterProblems = () => {
    let filtered = problems;

    if (searchTerm) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      const difficultyMap = {
        easy: [800, 1200],
        medium: [1201, 1800],
        hard: [1801, 3000]
      };
      
      if (difficultyMap[difficultyFilter]) {
        const [min, max] = difficultyMap[difficultyFilter];
        filtered = filtered.filter(problem => 
          problem.rating >= min && problem.rating <= max
        );
      }
    }

    setFilteredProblems(filtered);
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Practice Problems
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Solve problems to improve your coding skills
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy (800-1200)</option>
              <option value="medium">Medium (1201-1800)</option>
              <option value="hard">Hard (1801+)</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setDifficultyFilter('all');
              }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-1">Status</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Acceptance</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredProblems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No problems found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <ProblemCard key={problem._id} problem={problem} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemList;