import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Lock,
  Trophy,
  BarChart3,
  AlertTriangle,
  ChevronRight,
  Zap,
  Users,
  Award,
  Target,
  PlayCircle,
  Calendar,
  Timer,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Crown,
  Medal,
  FileText,
  ArrowLeft,
  BookOpen,
  Hash,
  Cpu,
  ChevronDown,
  ChevronUp,
  Terminal,
  ArrowRight
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

export default function ContestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00", ended: false });
  const [loading, setLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contestRes, problemsRes] = await Promise.all([
        api.get(`/contest/${id}`),
        api.get(`/contest/${id}/problems`)
      ]);
      setContest(contestRes.data);
      setProblems(problemsRes.data);
      
      // Fetch participant count if available
      try {
        const scoreboardRes = await api.get(`/contest/${id}/scoreboard`);
        setParticipantCount(scoreboardRes.data.length || 0);
      } catch {
        // If scoreboard endpoint doesn't exist, use fallback
        setParticipantCount(contestRes.data.participants?.length || 0);
      }
    } catch (err) {
      console.error("Error loading contest details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!contest || contest.status === "upcoming") return;

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

  const getTimeUntilStart = () => {
    if (!contest || contest.status !== "upcoming") return null;
    const now = new Date();
    const start = new Date(contest.startTime);
    const diff = start - now;
    
    if (diff <= 0) return { h: "00", m: "00", s: "00" };
    
    return {
      h: String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0"),
      m: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0"),
      s: String(Math.floor((diff / 1000) % 60)).padStart(2, "0")
    };
  };

  const isLocked = contest?.status === "running" && !contest?.isRegistered;
  const startTime = getTimeUntilStart();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading contest environment...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <AlertTriangle size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Contest not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The contest you're looking for doesn't exist or you don't have access.
          </p>
          <button
            onClick={() => navigate("/contests")}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transform hover:-translate-y-1 transition-all duration-300"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500 dark:text-green-400';
      case 'medium': return 'text-yellow-500 dark:text-yellow-400';
      case 'hard': return 'text-red-500 dark:text-red-400';
      default: return 'text-blue-500 dark:text-blue-400';
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': 
        return theme === 'dark' 
          ? 'bg-green-900/30 text-green-400' 
          : 'bg-green-100 text-green-800';
      case 'medium':
        return theme === 'dark'
          ? 'bg-yellow-900/30 text-yellow-400'
          : 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return theme === 'dark'
          ? 'bg-red-900/30 text-red-400'
          : 'bg-red-100 text-red-800';
      default:
        return theme === 'dark'
          ? 'bg-blue-900/30 text-blue-400'
          : 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/contests")}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contest.name}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(contest.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {participantCount} participants
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="rounded-xl p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3">
                  <Timer size={20} className="text-amber-500" />
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      {contest.status === "upcoming" ? "Starts In" : timeLeft.ended ? "Contest Ended" : "Time Remaining"}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {(contest.status === "running" || timeLeft.ended) ? (
                        [timeLeft.h, timeLeft.m, timeLeft.s].map((unit, i) => (
                          <div key={i} className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono font-bold ${
                              timeLeft.ended 
                                ? theme === 'dark' 
                                  ? 'bg-gray-800 text-gray-400' 
                                  : 'bg-gray-200 text-gray-600'
                                : 'bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-lg'
                            }`}>
                              {unit}
                            </div>
                            {i < 2 && <span className="text-lg font-bold px-0.5 text-amber-500">:</span>}
                          </div>
                        ))
                      ) : (
                        startTime && [startTime.h, startTime.m, startTime.s].map((unit, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-mono font-bold text-white shadow-lg">
                              {unit}
                            </div>
                            {i < 2 && <span className="text-lg font-bold px-0.5 text-blue-400">:</span>}
                          </div>
                        ))
                      )}
                    </div>
                    <div className={`text-xs mt-1 ${timeLeft.ended ? 'text-red-400' : 'text-amber-500'}`}>
                      {contest.status === "running" && timeLeft.ended ? "FINISHED" : contest.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/contest/${id}/scoreboard`)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
              >
                <Trophy size={16} className="inline mr-2" />
                Scoreboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Registration Warning */}
        {isLocked && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 dark:from-amber-500/5 dark:to-red-500/5 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 dark:border-amber-500/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <Lock size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Restricted Access
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You are not registered for this contest. You can view problem titles, but solving is disabled.
                    Register before the contest starts to participate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Problems List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <Target className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                Problem Set
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {problems.length} problems • {problems.reduce((sum, p) => sum + (p.points || 0), 0)} total points
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-1 text-sm font-semibold text-gray-500 dark:text-gray-400">#</div>
                  <div className="col-span-7 text-sm font-semibold text-gray-500 dark:text-gray-400">PROBLEM</div>
                  <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-gray-400">POINTS</div>
                  <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">ACTION</div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {problems.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <Target size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No problems available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Problems will be added to this contest soon.
                    </p>
                  </div>
                ) : (
                  problems.map((p) => (
                    <div 
                      key={p._id} 
                      className="group grid grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <div className="col-span-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {p.index}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-7">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {p.problem.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                          <span>ID: {p.problem._id.slice(0, 8)}...</span>
                          {p.problem.difficulty && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyBg(p.problem.difficulty)}`}>
                              {p.problem.difficulty.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {p.points || 100}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                      </div>

                      <div className="col-span-2 text-right">
                        {isLocked ? (
                          <div className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                            <Lock size={14} />
                            <span className="text-sm font-semibold">Locked</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/contest/${id}/problem/${p.problem._id}`)}
                            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all shadow-sm flex items-center gap-2 justify-center"
                          >
                            <PlayCircle size={14} />
                            Solve
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participation Status */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <h4 className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield size={14} />
                Participation Status
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center">
                  {contest.isRegistered ? (
                    <CheckCircle size={24} className="text-green-300" />
                  ) : (
                    <XCircle size={24} className="text-red-300" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {contest.isRegistered ? "Officially Registered" : "Spectator Mode"}
                  </div>
                  <div className="text-indigo-200 text-sm">
                    {contest.isRegistered 
                      ? "Your score will affect your rating" 
                      : "Register for future contests to participate"
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Contest Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                Contest Statistics
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Users size={14} />
                    Participants
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {participantCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Target size={14} />
                    Problems
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {problems.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Timer size={14} />
                    Duration
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60))} mins
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Trophy size={14} />
                    Total Points
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {problems.reduce((sum, p) => sum + (p.points || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                Quick Actions
              </h4>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/contest/${id}/scoreboard`)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 size={16} />
                    Live Standings
                  </span>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
                
                <button 
                  onClick={() => navigate(`/contest/${id}/submissions`)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <span className="flex items-center gap-2">
                    <Eye size={16} />
                    My Submissions
                  </span>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>

                <button 
                  onClick={() => window.open(`/contest/${id}/clarifications`, '_blank')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} />
                    Clarifications
                  </span>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Contest Status Badge */}
            <div className={`rounded-2xl p-6 border ${
              contest.status === "running"
                ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 dark:border-green-500/10"
                : contest.status === "upcoming"
                ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20 dark:border-blue-500/10"
                : "bg-gradient-to-r from-amber-500/10 to-red-500/10 border-amber-500/20 dark:border-amber-500/10"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  contest.status === "running"
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : contest.status === "upcoming"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-gradient-to-br from-amber-500 to-red-600"
                }`}>
                  {contest.status === "running" ? (
                    <Zap size={20} className="text-white" />
                  ) : contest.status === "upcoming" ? (
                    <Clock size={20} className="text-white" />
                  ) : (
                    <Award size={20} className="text-white" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {contest.status === "running" ? "Contest Active" 
                     : contest.status === "upcoming" ? "Starting Soon"
                     : "Contest Ended"}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {contest.status === "running" ? "Submit solutions now!" 
                     : contest.status === "upcoming" ? "Get ready to compete"
                     : "View final standings"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}