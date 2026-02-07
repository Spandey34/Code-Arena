import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { 
  Calendar, 
  Clock, 
  Trophy, 
  Users, 
  Target, 
  Award, 
  Zap,
  Gamepad2,
  CheckCircle,
  BarChart3,
  ChevronRight,
  Crown,
  Medal,
  AlertCircle,
  Loader2
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

export default function UserContests() {
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { theme } = useContext(ThemeContext);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchContests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/contest/history");
      setContests(res.data);
      setFilteredContests(res.data);
    } catch (err) {
      console.error("Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    let filtered = [...contests];
    
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    setFilteredContests(filtered);
  }, [searchQuery, statusFilter, contests]);

  const registerContest = async (contestId) => {
    try {
      const res = await api.post(`/contest/${contestId}/register`);
      alert(res.data.message || "Registered successfully");
      fetchContests();
    } catch (err) {
      alert("Registration failed");
    }
  };

  const getStatusConfig = (status) => {
    const base = "px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ";
    
    switch (status) {
      case "upcoming":
        return {
          class: base + "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
          icon: <Clock size={12} />
        };
      case "running":
        return {
          class: base + "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
          icon: <Zap size={12} className="animate-pulse" />
        };
      case "finished":
        return {
          class: base + "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
          icon: <Award size={12} />
        };
      case "ended (pending results)":
        return {
          class: base + "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
          icon: <Loader2 size={12} className="animate-spin" />
        };
      default:
        return {
          class: base + "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700",
          icon: <AlertCircle size={12} />
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getContestIcon = (status) => {
    switch (status) {
      case "upcoming": return <Target className="text-blue-500" size={20} />;
      case "running": return <Zap className="text-green-500" size={20} />;
      case "finished": return <Trophy className="text-amber-500" size={20} />;
      default: return <Gamepad2 className="text-gray-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading contests...</p>
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl">
              <Trophy size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Contests Arena
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join epic coding battles, compete with the best, and climb the ranks to glory!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 dark:from-purple-500/5 dark:via-indigo-500/5 dark:to-purple-500/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 dark:border-purple-500/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {contests.filter(c => c.status === 'upcoming').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Target size={14} />
                  Upcoming
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {contests.filter(c => c.status === 'running').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Zap size={14} />
                  Live Now
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {contests.filter(c => c.status === 'finished').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Award size={14} />
                  Completed
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {contests.filter(c => c.isRegistered).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <CheckCircle size={14} />
                  Registered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search contests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="running">Live Now</option>
                  <option value="finished">Completed</option>
                  <option value="ended (pending results)">Pending Results</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contests Grid/Table */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="col-span-5 text-sm font-semibold text-gray-500 dark:text-gray-400">CONTEST</div>
              <div className="col-span-3 text-sm font-semibold text-gray-500 dark:text-gray-400">SCHEDULE</div>
              <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-gray-400">STATUS</div>
              <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">ACTION</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContests.length > 0 ? (
                filteredContests.map((c) => {
                  const statusConfig = getStatusConfig(c.status);
                  const start = formatDate(c.startTime);
                  const end = formatDate(c.endTime);
                  
                  return (
                    <div 
                      key={c._id}
                      className="group grid grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                      {/* Contest Info */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                            {getContestIcon(c.status)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              {c.name}
                              {c.isRegistered && (
                                <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full flex items-center gap-1">
                                  <CheckCircle size={10} />
                                  Registered
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {c.description || "Test your skills against the best"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar size={14} />
                          <span className="font-medium">{start.date}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-6">
                          {start.time} - {end.time}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={statusConfig.class}>
                          {statusConfig.icon}
                          {c.status === "ended (pending results)" ? "PENDING" : c.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="col-span-2 text-right">
                        {c.status === "upcoming" && (
                          <button
                            onClick={() => !c.isRegistered && registerContest(c._id)}
                            disabled={c.isRegistered}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm
                              ${c.isRegistered 
                                ? "bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700 cursor-default" 
                                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
                              }`}
                          >
                            {c.isRegistered ? (
                              <span className="flex items-center justify-center gap-2">
                                <CheckCircle size={14} />
                                Registered
                              </span>
                            ) : "Register"}
                          </button>
                        )}

                        {c.status === "running" && (
                          <button 
                            onClick={() => window.location.href = `/contest/${c._id}`}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 transition-all shadow-sm flex items-center gap-2 justify-center"
                          >
                            <Zap size={14} />
                            Enter Now
                          </button>
                        )}

                        {(c.status === "finished" || c.status === "ended (pending results)") && (
                          <button 
                            onClick={() => window.location.href = `/contest/${c._id}/scoreboard`}
                            className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-gray-800/25 hover:-translate-y-0.5 transition-all shadow-sm flex items-center gap-2 justify-center"
                          >
                            <BarChart3 size={14} />
                            Standings
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <Trophy size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No contests found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? "Try a different search" : "Check back later for new contests!"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={16} />
                  <span>{filteredContests.length} contests</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Upcoming</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Live</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-2xl p-8 border border-indigo-500/20 dark:border-indigo-500/10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Ready for your next challenge?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Practice with our extensive problem library and improve your skills!
              </p>
              <button 
                onClick={() => window.location.href = "/practice"}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 transition-all duration-300"
              >
                Start Practicing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}