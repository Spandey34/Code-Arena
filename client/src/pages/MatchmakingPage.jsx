import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Swords, 
  Search, 
  X, 
  Users, 
  Target, 
  Zap, 
  Clock,
  Trophy,
  Crown,
  Activity,
  Gamepad2,
  Sword,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const MatchmakingPage = () => {
  const { user, authFetch, socket, activeUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const [status, setStatus] = useState('Ready to battle? Tap the button to find a match.');
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('~30 sec');
  const [playerStats, setPlayerStats] = useState({
    rating: 1500,
    rank: 'Bronze',
    winRate: 0,
    matches: 0
  });

  // Update search timer
  useEffect(() => {
    let interval;
    if (isSearching && !matchFound) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
        // Update estimated time based on search duration
        if (searchTime > 30) setEstimatedTime('~1 min');
        if (searchTime > 60) setEstimatedTime('~2 min');
        if (searchTime > 90) setEstimatedTime('Finding...');
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(interval);
  }, [isSearching, matchFound, searchTime]);

  // Socket listeners
  useEffect(() => {
    if (!user || !socket || !isSearching) return;

    socket.on('matchFound', ({ gameId }) => {
      setMatchFound(true);
      setStatus('🎉 Match found! Redirecting to game...');
      setTimeout(() => navigate(`/game/${gameId}`), 1500);
    });

    socket.on('waitingForOpponent', (data) => {
      setStatus(`🔍 ${data.message}`);
    });

    socket.on('disconnect', () => {
      setStatus('🔌 Connection lost. Please try again.');
      setIsSearching(false);
      setMatchFound(false);
    });

    socket.on('playersInQueue', (data) => {
      setStatus(`🕹️ ${data.count} players searching... Finding best match`);
    });

    return () => {
      socket.off('matchFound');
      socket.off('waitingForOpponent');
      socket.off('disconnect');
      socket.off('playersInQueue');
    };
  }, [user, navigate, socket, isSearching]);

  // Fetch player stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch.get('/users/profile');
        const profile = res.data;
        const totalMatches = profile.gameHistory?.length || 0;
        const wins = profile.gameHistory?.filter(g => 
          g.gameId.winner === user?._id
        ).length || 0;
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
        
        // Determine rank based on rating
        const rating = Math.round(profile.rating);
        let rank = 'Bronze';
        if (rating >= 1800) rank = 'Platinum';
        else if (rating >= 1600) rank = 'Gold';
        else if (rating >= 1400) rank = 'Silver';

        setPlayerStats({
          rating,
          rank,
          winRate,
          matches: totalMatches
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    if (user) fetchStats();
  }, [user, authFetch]);

  const startMatchmaking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsSearching(true);
    setMatchFound(false);
    setStatus('🎯 Searching for worthy opponent...');
    
    try {
      const res = await authFetch.post('/game/match');
      const gameId = res.data.gameId;
      setStatus(`⚡ Challenge created! Looking for opponent...`);
      
      if (socket) {
        socket.emit('joinQueue', { 
          userId: user._id, 
          rating: user.rating, 
          gameId: gameId 
        });
      }
    } catch (error) {
      console.error('Matchmaking failed:', error);
      setStatus('❌ Matchmaking failed. Please try again.');
      setIsSearching(false);
    }
  };

  const cancelMatchmaking = () => {
    if (socket) {
      socket.emit('leaveQueue', { userId: user._id });
    }
    setIsSearching(false);
    setStatus('⏹️ Matchmaking canceled.');
    setSearchTime(0);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
                <Swords size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Battle Arena
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Challenge coders from around the world in real-time duels
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Player Stats */}
            <div className="lg:col-span-2">
              {/* Matchmaking Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <Gamepad2 className="text-amber-500" size={24} />
                      Quick Match
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Users size={16} />
                      <span>{activeUsers || 0} online</span>
                    </div>
                  </div>

                  {/* Status Display */}
                  <div className="mb-8">
                    <div className={`text-center py-6 rounded-xl mb-4 ${
                      isSearching 
                        ? 'bg-gradient-to-r from-amber-500/10 to-purple-600/10 border border-amber-500/20' 
                        : 'bg-gray-100 dark:bg-gray-700/50'
                    }`}>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isSearching ? '🎮 Searching for Match' : '⚔️ Ready to Battle'}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">{status}</div>
                      
                      {/* Search Timer */}
                      {isSearching && !matchFound && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <Clock size={16} className="text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            {formatTime(searchTime)}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            • Est: {estimatedTime}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Loading Animation */}
                    {isSearching && !matchFound && (
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full border-4 border-amber-500/20"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Search size={24} className="text-amber-500" />
                          </div>
                        </div>
                        
                        {/* Searching Dots */}
                        <div className="flex items-center gap-2 mt-6">
                          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-150"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-300"></div>
                        </div>
                      </div>
                    )}

                    {/* Match Found Animation */}
                    {matchFound && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative mb-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                            <Sparkles size={32} className="text-white" />
                          </div>
                          <div className="absolute -inset-4 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        </div>
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          Opponent Found! 🎉
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          Preparing battlefield...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {!isSearching ? (
                      <button
                        onClick={startMatchmaking}
                        className="group relative overflow-hidden flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <Sword size={22} />
                          Find Match
                          <Zap size={22} className="group-hover:scale-110 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    ) : (
                      <button
                        onClick={cancelMatchmaking}
                        className="group relative overflow-hidden flex-1 bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-gray-500/25 transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <X size={22} />
                          Cancel Search
                          <Clock size={22} />
                        </span>
                      </button>
                    )}
                  </div>
                  
                  
                </div>
              </div>
            </div>

            {/* Right Column - Info & Tips */}
            <div className="space-y-6">
              {/* Player Rank Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-900 dark:text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Crown size={20} className="text-amber-400" />
                    Your Rank
                  </h3>
                  <span className="text-amber-400 font-bold">{playerStats.rank}</span>
                </div>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold mb-2">{playerStats.rating}</div>
                  <div >Elo Rating</div>
                </div>
              </div>

              {/* Match Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target size={20} className="text-amber-500" />
                  Match Details
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">Real-time coding duel</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">30 minutes time limit</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">Rating points at stake</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">Random difficulty problem</span>
                  </li>
                </ul>
              </div>

              {/* Practice Button */}
              <button
                onClick={() => navigate('/practice')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 relative z-10 text-gray-800 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl dark:text-white transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Swords size={20} />
                <span>Practice Mode</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingPage;