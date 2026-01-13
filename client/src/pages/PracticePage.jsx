import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  Code, 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Zap,
  BarChart3,
  Filter,
  Search,
  ArrowRight,
  Star,
  TrendingUp,
  BookOpen,
  Lock,
  Unlock
} from 'lucide-react';

export default function Practice() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { authFetch } = useContext(AuthContext);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await authFetch.get('/problems/practice/me');
        setProblems(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch problems", error);
        setLoading(false);
      }
    };

    fetchProblems();
  }, [authFetch]);

  // Filter problems based on search and filters
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         problem.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === 'all' || 
                             Math.round(problem.rating / 200).toString() === difficultyFilter;
    
    const matchesStatus = statusFilter === 'all' || problem.status === statusFilter;
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // Get difficulty label and color
  const getDifficultyInfo = (rating) => {
    const level = Math.round(rating / 200);
    switch(level) {
      case 1: return { label: 'Easy', color: 'bg-green-500 text-green-700 dark:text-green-400', bg: 'bg-green-500/10' };
      case 2: return { label: 'Medium', color: 'bg-yellow-500 text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-500/10' };
      case 3: return { label: 'Hard', color: 'bg-orange-500 text-orange-700 dark:text-orange-400', bg: 'bg-orange-500/10' };
      case 4: return { label: 'Expert', color: 'bg-red-500 text-red-700 dark:text-red-400', bg: 'bg-red-500/10' };
      default: return { label: 'Medium', color: 'bg-yellow-500 text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-500/10' };
    }
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch(status) {
      case 'solved':
        return { 
          icon: <CheckCircle size={16} />, 
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-500/10',
          label: 'Solved'
        };
      case 'attempted':
        return { 
          icon: <AlertCircle size={16} />, 
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-500/10',
          label: 'Attempted'
        };
      default:
        return { 
          icon: <Clock size={16} />, 
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-500/10',
          label: 'Not Attempted'
        };
    }
  };

  // Calculate stats
  const stats = {
    total: problems.length,
    solved: problems.filter(p => p.status === 'solved').length,
    attempted: problems.filter(p => p.status === 'attempted').length,
    pending: problems.filter(p => !p.status || p.status === 'not attempted').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <BookOpen size={32} className="text-amber-500" />
                Practice Arena
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Sharpen your skills with curated coding challenges
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progress</div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.solved}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Solved</div>
                </div>
                <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { 
                label: 'Total Problems', 
                value: stats.total, 
                icon: <Code size={20} />, 
                color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
                change: '+5 new' 
              },
              { 
                label: 'Solved', 
                value: stats.solved, 
                icon: <CheckCircle size={20} />, 
                color: 'bg-gradient-to-br from-green-500 to-emerald-600',
                change: `${Math.round((stats.solved / stats.total) * 100) || 0}%` 
              },
              { 
                label: 'Attempted', 
                value: stats.attempted, 
                icon: <AlertCircle size={20} />, 
                color: 'bg-gradient-to-br from-yellow-500 to-amber-600',
                change: 'Keep going!' 
              },
              { 
                label: 'Pending', 
                value: stats.pending, 
                icon: <Target size={20} />, 
                color: 'bg-gradient-to-br from-purple-500 to-pink-600',
                change: `${stats.pending} to go` 
              },
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search problems by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-2">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                >
                  <option value="all">All Difficulties</option>
                  <option value="1">Easy</option>
                  <option value="2">Medium</option>
                  <option value="3">Hard</option>
                  <option value="4">Expert</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="solved">Solved</option>
                  <option value="attempted">Attempted</option>
                  <option value="not attempted">Not Attempted</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProblems.length > 0 ? (
            filteredProblems.map(problem => {
              const difficulty = getDifficultyInfo(problem.rating);
              const status = getStatusInfo(problem.status);
              
              return (
                <div
                  key={problem._id}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Problem Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${difficulty.color} ${difficulty.bg}`}>
                            {difficulty.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Rating: {problem.rating}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {problem.title}
                        </h3>
                      </div>
                      <div className={`p-2 rounded-lg ${status.bg}`}>
                        <div className={status.color}>{status.icon}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <BarChart3 size={14} />
                          {problem.acceptanceRate || "N/A"}% acceptance
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {problem.timeLimit || 30}m
                        </span>
                      </div>
                      {problem.points && (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Star size={14} />
                          <span className="font-semibold">{problem.points} pts</span>
                        </div>
                      )}
                    </div>

                    {/* Solve Button */}
                    <button
                      onClick={() => navigate(`/practice/${problem._id}`)}
                      className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {status.label === 'Solved' ? (
                        <>
                          <CheckCircle size={18} />
                          Review Solution
                        </>
                      ) : status.label === 'Attempted' ? (
                        <>
                          <Zap size={18} />
                          Continue Solving
                        </>
                      ) : (
                        <>
                          <Code size={18} />
                          Start Solving
                        </>
                      )}
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Progress Bar for attempted problems */}
                  {problem.status === 'attempted' && (
                    <div className="px-6 pb-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${problem.progress || 50}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Search size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No problems found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {problems.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
              <Code size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No practice problems available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Check back later for new challenges</p>
            <button
              onClick={() => navigate('/matchmaking')}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
            >
              Try Matchmaking Instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}