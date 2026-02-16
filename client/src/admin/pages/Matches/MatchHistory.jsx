import React, { useState, useEffect } from 'react';
import { matchAPI } from '../../../shared/services/api';
import { formatDate } from '../../../shared/utils/helpers';

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [filters, matches]);

  const fetchMatches = async () => {
    try {
      const response = await matchAPI.getAllMatches();
      setMatches(response.matches);
      setFilteredMatches(response.matches);
      
      // Calculate statistics
      const completed = response.matches.filter(m => m.status === 'completed').length;
      const inProgress = response.matches.filter(m => m.status === 'in-progress').length;
      const totalPlayers = new Set(
        response.matches.flatMap(m => [m.player1?._id, m.player2?._id])
      ).size;
      
      setStats({
        totalMatches: response.matches.length,
        completedMatches: completed,
        inProgressMatches: inProgress,
        totalPlayers,
        avgMatchDuration: 15 // This would come from backend
      });
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;

    if (filters.status !== 'all') {
      filtered = filtered.filter(match => match.status === filters.status);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      
      if (startDate) {
        filtered = filtered.filter(match => new Date(match.createdAt) >= startDate);
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(match =>
        match.player1?.username?.toLowerCase().includes(searchLower) ||
        match.player2?.username?.toLowerCase().includes(searchLower) ||
        match.problem?.title?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredMatches(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      search: ''
    });
  };

  const getMatchResult = (match) => {
    if (!match.winner) return { text: 'Draw', color: 'text-gray-600', bg: 'bg-gray-100' };
    return {
      text: `${match.winner?.playerId || 'Unknown'} won`,
      color: 'text-green-600',
      bg: 'bg-green-100'
    };
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Match History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and analyze all 1v1 matches
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-blue-600">
            {stats?.totalMatches || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-green-600">
            {stats?.completedMatches || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {stats?.inProgressMatches || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-purple-600">
            {stats?.totalPlayers || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Unique Players</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-red-600">
            {stats?.avgMatchDuration || 0}m
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Filter Matches
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="input-field"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field"
              placeholder="Player name or problem..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredMatches.length} of {matches.length} matches
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Players</div>
            <div className="col-span-3">Problem</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Result</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
          {filteredMatches.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No matches found matching your filters
              </p>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const result = getMatchResult(match);
              
              return (
                <div key={match._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Date */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(match.createdAt)}
                      </div>
                    </div>

                    {/* Players */}
                    <div className="col-span-3">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
                            P1
                          </div>
                          <div className="text-sm text-gray-800 dark:text-white">
                            {match.player1?.username || 'Unknown'}
                            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                              ({match.player1?.rating || '???'})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
                            P2
                          </div>
                          <div className="text-sm text-gray-800 dark:text-white">
                            {match.player2?.username || 'Unknown'}
                            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                              ({match.player2?.rating || '???'})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Problem */}
                    <div className="col-span-3">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {match.problem?.title || 'Unknown Problem'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Rating: {match.problem?.rating || '???'}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        match.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {match.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    {/* Result */}
                    <div className="col-span-2">
                      <div className="text-sm font-medium">
                        {match.status === 'completed' ? (
                          <span className={result.color}>
                            {result.text}
                          </span>
                        ) : (
                          <span className="text-yellow-600">Ongoing</span>
                        )}
                      </div>
                      {match.submissions?.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {match.submissions.length} submissions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Match Details Modal (conceptual) */}
      <div className="mt-6 text-right">
        <button
          onClick={() => {
            // Export matches functionality
            console.log('Export matches');
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export to CSV
        </button>
      </div>

      {/* Analysis */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Match Activity
          </h2>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Match activity chart would go here
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Top Players
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    rank === 1 ? 'bg-yellow-500' :
                    rank === 2 ? 'bg-gray-400' :
                    'bg-orange-500'
                  }`}>
                    <span className="text-white font-bold">{rank}</span>
                  </div>
                  <span className="text-gray-800 dark:text-white">Player {rank}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800 dark:text-white">
                    {10 - rank} wins
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {(11 - rank) * 75}% win rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchHistory;