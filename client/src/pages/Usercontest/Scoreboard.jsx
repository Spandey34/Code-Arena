import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy,
  RefreshCcw,
  ArrowLeft,
  Medal,
  Crown,
  Users,
  Target,
  Clock,
  BarChart3,
  Search,
  AlertCircle,
  Loader2,
  Timer,
  CheckCircle,
  XCircle
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

const ContestScoreboard = () => {
  const { contestId } = useParams();
  const { authFetch } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [scoreboard, setScoreboard] = useState([]);
  const [filteredScoreboard, setFilteredScoreboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00", ended: false });

  /* ===== Fetch scoreboard ===== */
  const fetchScoreboard = async () => {
    try {
      setLoading(true);
      const [contestRes, scoreboardRes] = await Promise.all([
        authFetch.get(`/contest/${contestId}`),
        authFetch.get(`/contest/${contestId}/scoreboard`)
      ]);
      
      setContest(contestRes.data);
      
      // Process scoreboard data
      const processedData = scoreboardRes.data.map(row => ({
        ...row,
        calculatedPenalty: calculatePenalty(row)
      }));
      
      setScoreboard(processedData);
      setFilteredScoreboard(processedData);
    } catch (err) {
      console.error("Failed to load scoreboard", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===== Calculate Penalty ===== */
  const calculatePenalty = (row) => {
    if (!contest || !contest.startTime) return 0;
    
    // Penalty = last submitted time (in minutes) + wrong attempts * 20 minutes
    const lastSubmitted = row.lastSubmissionTime ? 
      Math.floor((new Date(row.lastSubmissionTime) - new Date(contest.startTime)) / (1000 * 60)) : 0;
    const wrongAttempts = row.wrongattempts || 0;
    return lastSubmitted + (wrongAttempts * 20);
  };

  /* ===== Timer Effect ===== */
  useEffect(() => {
    if (!contest || contest.status !== "running") return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(contest.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ h: "00", m: "00", s: "00", ended: true });
        return;
      }

      setTimeLeft({
        h: String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0"),
        m: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0"),
        s: String(Math.floor((diff / 1000) % 60)).padStart(2, "0"),
        ended: false
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  useEffect(() => {
    fetchScoreboard();
  }, [contestId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = scoreboard.filter(row => 
        row.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredScoreboard(filtered);
    } else {
      setFilteredScoreboard(scoreboard);
    }
  }, [searchQuery, scoreboard]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return { 
        icon: <Crown size={20} className="text-yellow-400" />, 
        bg: 'bg-gradient-to-br from-yellow-900/80 to-yellow-800/60',
        border: 'border-yellow-700/50',
        text: 'text-yellow-300'
      };
    }
    if (rank === 2) {
      return { 
        icon: <Medal size={20} className="text-gray-300" />, 
        bg: 'bg-gradient-to-br from-gray-800 to-gray-900/80',
        border: 'border-gray-700/50',
        text: 'text-gray-300'
      };
    }
    if (rank === 3) {
      return { 
        icon: <Medal size={20} className="text-amber-500" />, 
        bg: 'bg-gradient-to-br from-amber-900/70 to-amber-800/50',
        border: 'border-amber-800/40',
        text: 'text-amber-400'
      };
    }
    return { 
      icon: <span className="font-bold text-gray-300">{rank}</span>, 
      bg: 'bg-gray-900/60',
      border: 'border-gray-800',
      text: 'text-gray-300'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Loading scoreboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/contest/${contestId}`)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trophy className="text-amber-500" />
                  {contest?.name || 'Contest'} Scoreboard
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Users size={14} />
                    {scoreboard.length} participants
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    {timeLeft.ended ? 'Contest Ended' : `${timeLeft.h}:${timeLeft.m}:${timeLeft.s} remaining`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl p-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Timer size={16} className="text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    Penalty: +20 min per wrong
                  </span>
                </div>
              </div>
              <button
                onClick={fetchScoreboard}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {scoreboard.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 dark:from-amber-500/5 dark:via-purple-500/5 dark:to-amber-500/5 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 dark:border-amber-500/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {scoreboard[0]?.username || '--'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                    <Crown size={14} className="text-yellow-500" />
                    Leader
                  </div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {scoreboard.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                    <Users size={14} />
                    Participants
                  </div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {Math.max(...scoreboard.map(s => s.solved || 0))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                    <Target size={14} />
                    Max Solved
                  </div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatTime(Math.max(...scoreboard.map(s => s.calculatedPenalty || 0)))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                    <Clock size={14} />
                    Highest Penalty
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="container mx-auto px-4 pb-6">
        <div className="max-w-6xl mx-auto mb-8">
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
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoreboard Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {filteredScoreboard.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <AlertCircle size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? "No matching participants" : "No submissions yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? "Try a different search" : "Be the first to submit a solution!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="col-span-1 text-sm font-semibold text-gray-500 dark:text-gray-400">RANK</div>
                <div className="col-span-4 text-sm font-semibold text-gray-500 dark:text-gray-400">CODER</div>
                <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">SOLVED</div>
                <div className="col-span-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">PENALTY</div>
                <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">WRONG ATTEMPTS</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredScoreboard.map((row, index) => {
                  const rankBadge = getRankBadge(row.rank || index + 1);
                  const penaltyDetails = calculatePenalty(row);
                  
                  return (
                    <div 
                      key={row.userId || row._id || index} 
                      className="group grid grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                      {/* Rank */}
                      <div className="col-span-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rankBadge.bg} border ${rankBadge.border}`}>
                          <div className="text-white">
                            {rankBadge.icon}
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                            <Users size={18} className="text-white" />
                          </div>
                          <div>
                            <div className={`font-bold ${rankBadge.text}`}>
                              {row.username}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Score: {row.totalScore || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Solved */}
                      <div className="col-span-2 text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {row.solved || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          problems
                        </div>
                      </div>

                      {/* Penalty */}
                      <div className="col-span-3 text-center">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatTime(penaltyDetails)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Clock size={10} />
                            <span>Last: {row.lastSubmissionTime ? 
                              Math.floor((new Date(row.lastSubmissionTime) - new Date(contest?.startTime)) / (1000 * 60)) : 0} min
                            </span>
                            <span>+</span>
                            <span>{(row.wrongattempts || 0) * 20} min penalty</span>
                          </div>
                        </div>
                      </div>

                      {/* Wrong Attempts */}
                      <div className="col-span-2 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${row.wrongattempts > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                          {row.wrongattempts > 0 ? (
                            <XCircle size={14} />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          <span className="font-bold">{row.wrongattempts || 0}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {row.wrongattempts > 0 ? `× 20 min = +${row.wrongattempts * 20} min` : 'No penalties'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} />
                    <span>{filteredScoreboard.length} participants • Updated just now</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>#1</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span>#2</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-amber-700"></div>
                      <span>#3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Penalty Explanation */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-2xl p-6 border border-blue-500/20 dark:border-blue-500/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Timer size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Penalty Calculation
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-bold text-amber-500 dark:text-amber-400">Total Penalty = Last Submission Time + (Wrong Attempts × 20 minutes)</span>
                    </p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span><strong>Last Submission Time:</strong> Time from contest start to last correct submission (minutes)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span><strong>Wrong Attempts Penalty:</strong> Each wrong submission adds 20 minutes to total penalty</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span><strong>Strategy:</strong> Solve quickly with fewer wrong attempts for better ranking</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestScoreboard;