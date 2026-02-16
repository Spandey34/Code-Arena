import React, { useState, useEffect } from 'react';
import {authAPI } from '../../shared/services/api';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await authAPI.getLeaderboard();
      setUsers(response.users);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'problemsSolved') {
      return (b.problemsSolved || 0) - (a.problemsSolved || 0);
    } else if (sortBy === 'username') {
      return a.username.localeCompare(b.username);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getRankColor = (index) => {
    if (index === 0) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300';
    if (index === 1) return 'bg-gray-100 dark:bg-gray-800 border-gray-300';
    if (index === 2) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Top performers in Code Arena
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Sort By
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('rating')}
                className={`px-4 py-2 rounded-lg ${sortBy === 'rating' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
              >
                Rating
              </button>
              <button
                onClick={() => setSortBy('problemsSolved')}
                className={`px-4 py-2 rounded-lg ${sortBy === 'problemsSolved' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
              >
                Problems Solved
              </button>
              <button
                onClick={() => setSortBy('username')}
                className={`px-4 py-2 rounded-lg ${sortBy === 'username' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
              >
                Username
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Users
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-2">Solved</div>
            <div className="col-span-2">Admin</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedUsers.map((user, index) => (
            <div 
              key={user._id} 
              className={`px-6 py-4 border-l-4 ${getRankColor(index)}`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Rank */}
                <div className="col-span-1">
                  <div className="flex items-center">
                    <span className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-600 dark:text-gray-400' :
                      index === 2 ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    {index < 3 && (
                      <span className="ml-2 text-sm">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                </div>

                {/* User */}
                <div className="col-span-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="col-span-2">
                  <div className="flex items-center">
                    <span className="font-bold text-gray-800 dark:text-white">
                      {user.rating}
                    </span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      user.rating >= 2000 ? 'bg-red-100 text-red-800' :
                      user.rating >= 1600 ? 'bg-purple-100 text-purple-800' :
                      user.rating >= 1400 ? 'bg-blue-100 text-blue-800' :
                      user.rating >= 1200 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.rating >= 2000 ? 'Grandmaster' :
                       user.rating >= 1600 ? 'Master' :
                       user.rating >= 1400 ? 'Expert' :
                       user.rating >= 1200 ? 'Specialist' : 'Novice'}
                    </span>
                  </div>
                </div>

                {/* Solved */}
                <div className="col-span-2">
                  <div className="font-medium text-gray-800 dark:text-white">
                    {user.problemsSolved || 0}
                  </div>
                </div>

                {/* Admin */}
                <div className="col-span-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.isAdmin 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">1st Place</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">2nd Place</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">3rd Place</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Other Ranks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;