import React, { useState, useEffect } from 'react';
import { matchAPI } from '../../../shared/services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../shared/utils/helpers';

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [filter, matches]);

  const fetchMatchHistory = async () => {
    try {
      const response = await matchAPI.getAllMatches();
      setMatches(response?.matches);
      setFilteredMatches(response?.matches);
    } catch (error) {
      console.error('Failed to fetch match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;

    if (filter === 'won') {
      filtered = filtered.filter(match => match.winner === user._id);
    } else if (filter === 'lost') {
      filtered = filtered.filter(match => 
        match.winner && match.winner !== user._id
      );
    } else if (filter === 'draw') {
      filtered = filtered.filter(match => !match.winner);
    }

    setFilteredMatches(filtered);
  };

  const getUserResult = (match) => {
    if (!match.winner) return { text: 'Draw', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (match.winner === user._id) return { text: 'Won', color: 'text-green-600', bg: 'bg-green-100' };
    return { text: 'Lost', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getOpponent = (match) => {
    return match.player1?._id === user._id ? match.player2 : match.player1;
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
          Match History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your 1v1 match results and statistics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-green-600">
            {matches.filter(m => m.winner === user._id).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Wins</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-red-600">
            {matches.filter(m => m.winner && m.winner !== user._id).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Losses</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {matches.filter(m => !m.winner).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Draws</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            All Matches
          </button>
          <button
            onClick={() => setFilter('won')}
            className={`px-4 py-2 rounded-lg ${filter === 'won' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Wins
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-4 py-2 rounded-lg ${filter === 'lost' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Losses
          </button>
          <button
            onClick={() => setFilter('draw')}
            className={`px-4 py-2 rounded-lg ${filter === 'draw' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Draws
          </button>
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Opponent</div>
            <div className="col-span-3">Problem</div>
            <div className="col-span-2">Result</div>
            <div className="col-span-2">Rating Change</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMatches.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-5xl mb-4">🤷‍♂️</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No matches found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all' 
                  ? 'You haven\'t played any matches yet' 
                  : `You don't have any ${filter} matches`}
              </p>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const result = getUserResult(match);
              const opponent = getOpponent(match);
              const ratingChange = result.text === 'Won' ? '+25' : result.text === 'Lost' ? '-25' : '±0';
              
              return (
                <div key={match._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Date */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(match.createdAt)}
                      </div>
                    </div>

                    {/* Opponent */}
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                          {opponent?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {opponent?.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Rating: {opponent?.rating || '???'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Problem */}
                    <div className="col-span-3">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {match.problem?.title || 'Unknown Problem'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Rating: {match.problem?.rating || 1200}
                      </div>
                    </div>

                    {/* Result */}
                    <div className="col-span-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${result.bg} ${result.color}`}>
                        {result.text}
                      </span>
                    </div>

                    {/* Rating Change */}
                    <div className="col-span-2">
                      <div className={`font-bold ${
                        ratingChange.startsWith('+') ? 'text-green-600' :
                        ratingChange.startsWith('-') ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {ratingChange}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Match Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
          <div className="text-blue-600 dark:text-blue-400 font-bold mb-2">🎯 Strategy</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Read the problem carefully before coding. A good understanding saves time.
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
          <div className="text-green-600 dark:text-green-400 font-bold mb-2">⚡ Speed</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Practice similar problems to improve your speed in competitive matches.
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
          <div className="text-purple-600 dark:text-purple-400 font-bold mb-2">📈 Progress</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review your match history to identify strengths and areas for improvement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchHistory;