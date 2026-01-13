import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Sword, 
  TrendingUp, 
  Clock, 
  Play, 
  Users, 
  Code, 
  Award, 
  Zap, 
  BarChart3,
  ChevronRight,
  Crown,
  Target,
  Activity,
  Gamepad2
} from 'lucide-react';

const HomePage = () => {
  const { user, authFetch, activeUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    winRate: 0,
    problemsSolved: 0,
    streak: 0
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const res = await authFetch.get('/users/profile');
          const profileData = res.data;
          setProfile(profileData);
          
          // Calculate stats
          const totalMatches = profileData.gameHistory?.length || 0;
          const wins = profileData.gameHistory?.filter(g => 
            g.gameId.winner === user._id
          ).length || 0;
          const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
          
          setStats({
            totalMatches,
            winRate,
            problemsSolved: profileData.solvedProblems?.length || 0,
            streak: profileData.currentStreak || 0
          });
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, authFetch]);

  const handleRejoin = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const quickActions = [
    { 
      title: 'Quick Match', 
      desc: 'Start coding instantly', 
      icon: <Zap size={24} />, 
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/matchmaking')
    },
    { 
      title: 'Practice', 
      desc: 'Sharpen your skills', 
      icon: <Target size={24} />, 
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/practice')
    },
    { 
      title: 'Leaderboard', 
      desc: 'See top coders', 
      icon: <Trophy size={24} />, 
      color: 'from-amber-500 to-orange-500',
      action: () => navigate('/leaderboard')
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading your arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && profile ? (
          <>
            {/* Hero Welcome Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                    Welcome back, <span className="bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">{user.username}</span>
                  </h1>
                  <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    Ready for your next coding challenge?
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {activeUsers || 0} coders online
                  </span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Quick Actions */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Action Cards */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <Gamepad2 size={24} className="text-amber-500" />
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${action.color}"></div>
                        <div className="relative z-10">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <div className="text-white">{action.icon}</div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{action.desc}</p>
                          <div className="flex items-center text-amber-600 dark:text-amber-400 font-semibold">
                            <span>Start Now</span>
                            <ChevronRight size={16} className="ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Games Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Clock size={24} className="text-amber-500" />
                        Recent Battles
                      </h2>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Last 24 hours</span>
                    </div>
                  </div>
                  <div className="p-6">
                    {profile.gameHistory && profile.gameHistory.length > 0 ? (
                      <div className="space-y-4">
                        {profile.gameHistory.slice(0, 3).map((history, index) => {
                          const game = history.gameId;
                          const isWinner = game.winner && game.winner === user._id;
                          const gameStatus = game.status;
                          const timeElapsed = (Date.now() - new Date(game.startTime).getTime()) / 1000;
                          const canRejoin = gameStatus === 'in-progress' && timeElapsed < 3600;

                          return (
                            <div 
                              key={index}
                              className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${
                                  isWinner 
                                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20' 
                                    : 'bg-gradient-to-br from-red-500/20 to-rose-600/20'
                                }`}>
                                  {isWinner ? (
                                    <Crown size={20} className="text-green-500" />
                                  ) : (
                                    <Sword size={20} className="text-red-500" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">{game.problem?.title || 'Challenge'}</h3>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                    <span>{Math.round(game.problem?.difficulty || 3)}/5 difficulty</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  isWinner 
                                    ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                                    : gameStatus === 'completed' 
                                    ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                                    : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                }`}>
                                  {gameStatus === 'completed' ? (isWinner ? 'Victory' : 'Defeat') : 'In Progress'}
                                </span>
                                {canRejoin && (
                                  <button
                                    onClick={() => handleRejoin(game._id)}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105"
                                  >
                                    Rejoin
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {profile.gameHistory.length > 3 && (
                          <button
                            onClick={() => navigate('/matchmaking')}
                            className="w-full mt-4 py-3 text-center text-amber-600 dark:text-amber-400 font-semibold rounded-xl border border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-300"
                          >
                            View All Battles
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <Sword size={24} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No battles yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Start your first coding challenge!</p>
                        <button
                          onClick={() => navigate('/matchmaking')}
                          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                        >
                          Start Matchmaking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Leaderboard Preview & Tips */}
              <div className="space-y-8">
                {/* Top Coders Preview */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <Award size={24} className="text-amber-500" />
                      Top Coders
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3].map((rank) => (
                        <div key={rank} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              rank === 1 ? 'bg-gradient-to-br from-amber-500 to-yellow-600' :
                              rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                              'bg-gradient-to-br from-amber-700 to-amber-900'
                            }`}>
                              {rank}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {rank === 1 ? 'CodeMaster' : rank === 2 ? 'ByteKing' : 'LogicLord'}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {rank === 1 ? '2450' : rank === 2 ? '2310' : '2280'} rating
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                              {rank === 1 ? '98%' : rank === 2 ? '95%' : '92%'} WR
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate('/leaderboard')}
                      className="w-full mt-4 py-3 text-center text-amber-600 dark:text-amber-400 font-semibold rounded-xl border border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-300"
                    >
                      View Full Leaderboard
                    </button>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                      <Zap size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pro Tip</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Practice easy problems to build consistency before tackling harder challenges.
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Your accuracy improves with regular practice!
                  </div>
                </div>

                {/* Start Challenge CTA */}
                <button
                  onClick={() => navigate('/matchmaking')}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Play size={24} className="text-white" />
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <ChevronRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Ready for a Challenge?</h3>
                    <p className="text-amber-100 text-sm">
                      Join live coding matches against real opponents
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Guest View - Landing Page */
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center max-w-3xl mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center transform rotate-12">
                  <Code size={48} className="text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 bg-clip-text text-transparent bg-size-200 animate-gradient">
                  Code Arena
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                Battle other developers in real-time programming duels. 
                Sharpen your skills, climb the leaderboards, and become a coding champion.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-amber-500/30 transform hover:-translate-y-1 transition-all duration-300"
                >
                  Start Coding Free
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-bold rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Sign In
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  { icon: <Sword />, title: 'Live Battles', desc: 'Real-time coding competitions' },
                  { icon: <Target />, title: 'Skill Rating', desc: 'Elo-based ranking system' },
                  { icon: <Trophy />, title: 'Leaderboards', desc: 'Compete for top positions' },
                ].map((feature, index) => (
                  <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;