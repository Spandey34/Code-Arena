import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, contestAPI } from '../../shared/services/api'; // Assuming userAPI handles /user/stats
import { formatDate } from '../../shared/utils/helpers';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Code, Target, Clock, Zap, 
  Activity, Calendar, ChevronRight, BarChart2 
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();
  
  // Dashboard Data State
  const [stats, setStats] = useState({
    submissions: { total: 0, accepted: 0, acceptanceRate: 0, uniqueProblemsSolved: 0, languageDistribution: {}, verdictDistribution: {} },
    matches: { total: 0, won: 0, lost: 0, winRate: 0 },
    contests: { participated: 0, details: [] },
    recentActivity: { submissions: 0, matches: 0, contests: 0 }
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingContests, setUpcomingContests] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
        setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch User Stats and Public Contest Data in parallel
      const [statsRes, contestsRes] = await Promise.all([
        authAPI.getStats(), // Endpoint: /user/stats
        contestAPI.getAll()
      ]);
      // 1. Process User Stats
      if (statsRes) {
        setStats(statsRes.statistics || stats);
        setRecentSubmissions(statsRes.recentSubmissions || []);
        setRecentMatches(statsRes.recentMatches || []);
      }

      // 2. Process Upcoming Contests (Global data)
      const upcoming = contestsRes?.filter(
        contest => new Date(contest.startTime) > new Date()
      ).slice(0, 3) || [];
      setUpcomingContests(upcoming);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED': return 'text-green-400 bg-green-900/30 border-green-800/50';
      case 'WRONG_ANSWER': return 'text-red-400 bg-red-900/30 border-red-800/50';
      case 'TIME_LIMIT_EXCEEDED': return 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50';
      case 'RUNTIME_ERROR': return 'text-orange-400 bg-orange-900/30 border-orange-800/50';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getMatchResult = (match) => {
    console.log(match.result);
    if (match.result==='In Progress') return { text: 'In Progress', color: 'text-gray-400 bg-gray-800' };
    const won = match.result;
    return { 
      text: match.result, 
      color: won==='Won' ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30' 
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- Guest View (Not Logged In) ---
  if (!user) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl font-bold text-white mb-6">Welcome to Code Arena</h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl">
                The ultimate platform to practice coding, compete in contests, and battle developers in real-time 1v1 matches.
            </p>
            <div className="flex gap-4">
                <Link to="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all">
                    Login
                </Link>
                <Link to="/register" className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all">
                    Register
                </Link>
            </div>
        </div>
    );
  }

  // --- Authenticated Dashboard ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* 1. Hero / Welcome Section */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800/30 rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user.username}! 👋
                </h1>
                <p className="text-gray-300 mb-6">
                    Ready to solve some problems today? Check out your latest stats below.
                </p>
                <div className="flex gap-4">
                    <Link to="/practice" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                        <Code size={18} /> Practice
                    </Link>
                    <Link to="/match" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                        <Zap size={18} /> 1v1 Match
                    </Link>
                </div>
            </div>
            
            {/* Quick Profile Summary */}
            <div className="mt-6 md:mt-0 relative z-10 bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm min-w-[200px]">
                <div className="text-sm text-gray-400 mb-1">Current Rating</div>
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                    {user.rating} <Trophy size={20} className="text-yellow-500" />
                </div>
                <div className="text-xs text-green-400 mt-1">Top 15% of players</div>
            </div>
        </div>

        {/* 2. Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Submissions */}
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400"><Code size={20} /></div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Submissions</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.submissions.total}</div>
                <div className="text-sm text-gray-400 mt-1">
                    <span className="text-green-400">{stats.submissions.accepted}</span> Accepted
                </div>
            </div>

            {/* Problems Solved */}
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-green-900/30 rounded-lg text-green-400"><Target size={20} /></div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Solved</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.submissions.uniqueProblemsSolved}</div>
                <div className="text-sm text-gray-400 mt-1">
                    <span className="text-yellow-400">{stats.submissions.acceptanceRate}%</span> Accuracy
                </div>
            </div>

            {/* Matches */}
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400"><Zap size={20} /></div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Matches</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.matches.total}</div>
                <div className="text-sm text-gray-400 mt-1">
                    <span className="text-purple-400">{stats.matches.winRate}%</span> Win Rate
                </div>
            </div>

            {/* Activity */}
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orange-900/30 rounded-lg text-orange-400"><Activity size={20} /></div>
                    <span className="text-xs font-medium text-gray-500 uppercase">7-Day Activity</span>
                </div>
                <div className="text-2xl font-bold text-white">
                    {stats.recentActivity.submissions + stats.recentActivity.matches}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                    Actions this week
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* 3. Recent Submissions (Takes up 2 cols) */}
            <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" /> Recent Submissions
                    </h3>
                    <Link to={`/admin/user/${user._id}/submissions`} className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 text-gray-400">
                            <tr>
                                <th className="px-6 py-3 text-left">Problem</th>
                                <th className="px-6 py-3 text-left">Language</th>
                                <th className="px-6 py-3 text-left">Verdict</th>
                                <th className="px-6 py-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {recentSubmissions.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No submissions yet</td></tr>
                            ) : (
                                recentSubmissions.slice(0, 5).map(sub => (
                                    <tr key={sub._id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{sub.problemTitle || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-gray-400">{sub.language}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getVerdictColor(sub.verdict)}`}>
                                                {sub.verdict}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">{formatDate(sub.createdAt)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Upcoming Contests (Sidebar) */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" /> Upcoming Contests
                    </h3>
                </div>
                <div className="p-4 space-y-4 flex-1">
                    {upcomingContests.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">No upcoming contests</div>
                    ) : (
                        upcomingContests.map(contest => (
                            <div key={contest._id} className="bg-gray-700/30 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
                                <h4 className="font-semibold text-white mb-1">{contest.name}</h4>
                                <div className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                                    <Clock size={12} /> {formatDate(contest.startTime)}
                                </div>
                                <Link to={`/contests/${contest._id}`} className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-center text-sm rounded transition-colors">
                                    Register Now
                                </Link>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-gray-700">
                    <Link to="/contests" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
                        View All Contests <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 5. Recent Matches */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Zap size={18} className="text-yellow-500" /> Recent Matches
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 text-gray-400">
                            <tr>
                                <th className="px-6 py-3 text-left">Opponent</th>
                                <th className="px-6 py-3 text-left">Problem</th>
                                <th className="px-6 py-3 text-center">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {recentMatches.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No matches played</td></tr>
                            ) : (
                                recentMatches.slice(0, 5).map(match => {
                                    const result = getMatchResult(match);
                                    return (
                                        <tr key={match._id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-300">
                                                {match.opponentUsername || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{match.problemTitle || 'Unknown Problem'}</td>
                                            <td className="px-6 py-4 text-center flex flex-row items-center gap-2">
                                              
                                                {result.text!=='In Progress' &&<span className={`px-2 py-1 rounded text-xs font-bold ${result.color}`}>
                                                    {result.text}
                                                </span>}
                                                {result.text==='In Progress' &&<Link to={`/match/${match._id}`} className={`px-1 py-0.5 rounded text-xs font-bold bg-blue-900`}>
                                    Rejoin
                                </Link>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 6. Analytics / Distributions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="font-bold text-white flex items-center gap-2 mb-6">
                    <BarChart2 size={18} className="text-purple-400" /> Language & Verdicts
                </h3>
                
                <div className="space-y-6">
                    {/* Languages */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Languages Used</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.submissions.languageDistribution || {}).map(([lang, count]) => (
                                <div key={lang} className="px-3 py-1.5 bg-gray-700 rounded-md border border-gray-600 flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">{lang}</span>
                                    <span className="bg-gray-600 text-white text-xs px-1.5 py-0.5 rounded">{count}</span>
                                </div>
                            ))}
                            {Object.keys(stats.submissions.languageDistribution || {}).length === 0 && (
                                <span className="text-gray-500 text-sm">No data yet</span>
                            )}
                        </div>
                    </div>

                    {/* Verdicts */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Verdict Distribution</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(stats.submissions.verdictDistribution || {}).map(([verdict, count]) => (
                                <div key={verdict} className="flex justify-between items-center p-2 bg-gray-700/50 rounded border border-gray-700">
                                    <span className={`text-[10px] font-bold truncate mr-2 ${
                                        verdict === 'ACCEPTED' ? 'text-green-400' : 
                                        verdict === 'WRONG_ANSWER' ? 'text-red-400' : 'text-gray-400'
                                    }`}>
                                        {verdict.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-white text-xs font-mono">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Home;