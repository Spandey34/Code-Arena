import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI } from '../../../shared/services/api';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';

const FindMatch = () => {
  const [searching, setSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const [waitingTime, setWaitingTime] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatchStats();

    if (socket) {
      socket.on('matchFound', (data) => {
        setMatchFound(true);
        setMatchId(data.matchId);
        setSearching(false);
        setTimeout(() => {
          navigate(`/match/${data.matchId}`);
        }, 2000);
      });

      socket.on('waitingForOpponent', (data) => {
        setSearching(true);
        setMatchFound(false);
      });

      return () => {
        socket.off('matchFound');
        socket.off('waitingForOpponent');
      };
    }
  }, [socket, navigate]);

  useEffect(() => {
    let interval;
    if (searching) {
      interval = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
    } else {
      setWaitingTime(0);
    }
    return () => clearInterval(interval);
  }, [searching]);

  const fetchMatchStats = async () => {
    try {
      const response = await matchAPI.getAllMatches();
      const userMatches = response?.matches.filter(
        match => match.player1?._id === user._id || match.player2?._id === user._id
      );
      
      const wins = userMatches.filter(match => match.winner === user._id).length;
      const losses = userMatches.filter(match => 
        match.winner && match.winner !== user._id
      ).length;
      
      setStats({
        totalMatches: userMatches.length,
        wins,
        losses,
        winRate: userMatches.length > 0 ? ((wins / userMatches.length) * 100).toFixed(1) : '0.0'
      });
    } catch (error) {
      console.error('Failed to fetch match stats:', error);
    }
  };

  const handleFindMatch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await matchAPI.findMatch();
      if (response.message === "Waiting For Opponent") {
        setSearching(true);
      }
    } catch (error) {
      setError(error.response?.message || 'Failed to find match');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMatch = async () => {
    try {
      await matchAPI.cancelMatch();
      setSearching(false);
      setMatchFound(false);
    } catch (error) {
      console.error('Failed to cancel match:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          1v1 Match
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Challenge other developers in real-time coding battles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Match Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Your Match Statistics
            </h2>
            
            {stats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Matches</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {stats.totalMatches}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Wins</span>
                  <span className="font-bold text-green-600">{stats.wins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Losses</span>
                  <span className="font-bold text-red-600">{stats.losses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                  <span className="font-bold text-blue-600">{stats.winRate}%</span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Current Rating</span>
                    <span className="font-bold text-yellow-600">{user.rating}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              How It Works
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  1
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Click "Find Match" to search for an opponent
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  2
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  You'll be matched with someone of similar skill level
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  3
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Solve the problem faster than your opponent to win
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  4
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Earn rating points for wins, lose points for losses
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column - Match Finder */}
        <div className="lg:col-span-2">
          <div className="bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚔️</div>
              <h2 className="text-2xl font-bold mb-2">Ready for Battle?</h2>
              <p className="text-blue-100 mb-6">
                Test your skills against other developers in real-time
              </p>
              
              {searching ? (
                <div className="space-y-4">
                  <div className="text-3xl font-bold animate-pulse">
                    Searching for opponent...
                  </div>
                  <div className="text-xl">
                    Time elapsed: {formatTime(waitingTime)}
                  </div>
                  <div className="w-full bg-blue-500/30 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(waitingTime * 2, 100)}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={handleCancelMatch}
                    disabled={loading}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                  >
                    Cancel Search
                  </button>
                </div>
              ) : matchFound ? (
                <div className="space-y-4">
                  <div className="text-3xl font-bold animate-bounce">
                    🎉 Match Found!
                  </div>
                  <div className="text-xl">
                    Redirecting to match room...
                  </div>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-5xl mb-2">👑</div>
                  <div className="text-xl font-medium">
                    Your Rating: <span className="font-bold">{user.rating}</span>
                  </div>
                  <div className="text-sm text-blue-200">
                    You'll be matched with players within ±300 rating
                  </div>
                  <button
                    onClick={handleFindMatch}
                    disabled={loading}
                    className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? 'Finding Match...' : 'FIND MATCH'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Recent Matches */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Recent Matches
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        Player {i}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        5 minutes ago
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {i % 2 === 0 ? 'WIN' : 'LOSS'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ±{i * 15} rating
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/match-history')}
              className="w-full mt-4 py-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Match History →
            </button>
          </div>

          {/* Rules */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 font-bold mb-2">🎯 Objective</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Solve the given problem correctly and faster than your opponent.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-bold mb-2">⚡ Time</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Each match has a 30-minute time limit. Faster solutions earn bonus points.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindMatch;