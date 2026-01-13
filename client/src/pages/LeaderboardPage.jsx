import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Trophy, 
  Crown, 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Star, 
  Medal,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Calendar,
  Zap,
  Gamepad2,
  BarChart3
} from 'lucide-react';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [userRank, setUserRank] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const { authFetch, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await authFetch.get('/users/leaderboard');
        const data = res.data;
        setLeaderboard(data);
        setFilteredLeaderboard(data);
        
        // Find current user's rank and stats
        if (user) {
          const userIndex = data.findIndex(u => u._id === user._id);
          if (userIndex !== -1) {
            setUserRank(userIndex + 1);
            setUserStats(data[userIndex]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [authFetch, user]);

  // Filter leaderboard based on search
  useEffect(() => {
    let filtered = [...leaderboard];
    
    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // In a real app, you would filter by time period here
    // For now, we'll just show all-time
    
    setFilteredLeaderboard(filtered);
  }, [searchQuery, timeFilter, leaderboard]);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return { 
        icon: <Crown size={20} className="text-yellow-500" />, 
        bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        border: 'border-yellow-500/30'
      };
    }
    if (rank === 2) {
      return { 
        icon: <Medal size={20} className="text-gray-400" />, 
        bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
        border: 'border-gray-500/30'
      };
    }
    if (rank === 3) {
      return { 
        icon: <Medal size={20} className="text-amber-700" />, 
        bg: 'bg-gradient-to-br from-amber-700 to-amber-900',
        border: 'border-amber-800/30'
      };
    }
    return { 
      icon: <span className="font-bold">{rank}</span>, 
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-300 dark:border-gray-700'
    };
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-600 dark:text-yellow-400';
    if (rank === 2) return 'text-gray-600 dark:text-gray-400';
    if (rank === 3) return 'text-amber-700 dark:text-amber-600';
    return 'text-gray-900 dark:text-gray-300';
  };

  const getRatingColor = (rating) => {
    if (rating >= 2000) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 1800) return 'text-red-600 dark:text-red-400';
    if (rating >= 1600) return 'text-orange-600 dark:text-orange-400';
    if (rating >= 1400) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getRankTitle = (rating) => {
    if (rating >= 2000) return 'Grandmaster';
    if (rating >= 1800) return 'Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1400) return 'Advanced';
    if (rating >= 1200) return 'Intermediate';
    return 'Novice';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-2xl">
              <Trophy size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Global Leaderboard
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Compete with the best coders from around the world. Every victory counts!
          </p>
        </div>

        {/* User Stats Card (if logged in) */}
        {user && userStats && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 dark:from-amber-500/5 dark:via-purple-500/5 dark:to-amber-500/5 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 dark:border-amber-500/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getRankBadge(userRank).bg} border ${getRankBadge(userRank).border}`}>
                    <div className="text-white font-bold text-xl">{userRank}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Position</h3>
                    <p className="text-gray-600 dark:text-gray-400">Global Rank #{userRank}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(userStats.rating)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {getRankTitle(userStats.rating)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Title</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      Top {Math.round((userRank / leaderboard.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Percentile</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                >
                  <option value="all-time">All Time</option>
                  <option value="monthly">This Month</option>
                  <option value="weekly">This Week</option>
                  <option value="daily">Today</option>
                </select>
                <button className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                  <Filter size={18} />
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="col-span-1 text-sm font-semibold text-gray-500 dark:text-gray-400">RANK</div>
              <div className="col-span-5 text-sm font-semibold text-gray-500 dark:text-gray-400">CODER</div>
              <div className="col-span-3 text-sm font-semibold text-gray-500 dark:text-gray-400">RATING</div>
              <div className="col-span-3 text-sm font-semibold text-gray-500 dark:text-gray-400">STATUS</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeaderboard.length > 0 ? (
                filteredLeaderboard.slice(0, 50).map((player, index) => {
                  const rank = index + 1;
                  const rankBadge = getRankBadge(rank);
                  const rating = Math.round(player.rating);
                  
                  return (
                    <div 
                      key={player._id}
                      className={`group grid grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                        user && player._id === user._id ? 'bg-gradient-to-r from-amber-500/5 to-amber-500/10' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="col-span-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rankBadge.bg} border ${rankBadge.border}`}>
                          <div className="text-white font-bold">
                            {rankBadge.icon}
                          </div>
                        </div>
                      </div>

                      {/* Player Info */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                            <Users size={18} className="text-white" />
                          </div>
                          <div>
                            <div className={`font-bold ${getRankColor(rank)}`}>
                              {player.username}
                              {user && player._id === user._id && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-amber-500 text-white rounded-full">YOU</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {getRankTitle(player.rating)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className={`text-xl font-bold ${getRatingColor(rating)}`}>
                            {rating}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {player.ratingChange > 0 ? (
                              <span className="text-green-500 flex items-center">
                                <ChevronUp size={12} />
                                +{player.ratingChange}
                              </span>
                            ) : player.ratingChange < 0 ? (
                              <span className="text-red-500 flex items-center">
                                <ChevronDown size={12} />
                                {player.ratingChange}
                              </span>
                            ) : (
                              '—'
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status/Stats */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Target size={14} />
                            <span>{player.wins || 0}W</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Gamepad2 size={14} />
                            <span>{player.totalMatches || 0}G</span>
                          </div>
                          {player.winRate && (
                            <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {player.winRate}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <Search size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No players found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search</p>
                </div>
              )}
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{filteredLeaderboard.length} players</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>#1</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span>#2</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-700"></div>
                    <span>#3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          {!user && (
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 dark:from-amber-500/5 dark:to-purple-500/5 rounded-2xl p-8 border border-amber-500/20 dark:border-amber-500/10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Want to join the competition?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Sign up today and start climbing the leaderboard!
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transform hover:-translate-y-1 transition-all duration-300">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;