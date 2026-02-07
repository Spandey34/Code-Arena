import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Settings,
  AlertTriangle,
  Trash2,
  Trophy,
  Calendar,
  Clock,
  Users,
  Zap,
  Award,
  Eye,
  BarChart3,
  Shield,
  MoreVertical,
  Edit,
  PlayCircle,
  StopCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { ThemeContext } from ".././context/ThemeContext";

export default function AdminContestshistory() {
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const { theme } = useContext(ThemeContext);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchContests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/contest/history");
      setContests(res.data);
      setFilteredContests(res.data);
    } catch (err) {
      console.error(err);
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
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c._id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    setFilteredContests(filtered);
  }, [searchQuery, statusFilter, contests]);

  const endContest = async (contestId) => {
    const confirmEnd = window.confirm(
      "Are you sure? This will end the contest and update ratings permanently.",
    );
    if (!confirmEnd) return;

    try {
      setActionLoading(contestId);
      const res = await api.post(`/contest/${contestId}/end`);
      alert(res.data.message || "Contest ended");
      fetchContests();
    } catch (err) {
      alert("Failed to end contest");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteContest = async (contestId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contest? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    try {
      setActionLoading(contestId);
      await api.delete(`/contest/${contestId}/delete`);
      alert("Contest deleted");
      fetchContests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete contest");
    } finally {
      setActionLoading(null);
    }
  };

  const startContest = async (contestId) => {
    try {
      setActionLoading(contestId);
      const res = await api.post(`/contest/${contestId}/start`);
      alert(res.data.message || "Contest started");
      fetchContests();
    } catch (err) {
      alert("Failed to start contest");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status) => {
    const base = "px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ";
    
    switch (status) {
      case "running":
        return {
          class: base + "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
          icon: <Zap size={12} className="animate-pulse" />
        };
      case "finished":
        return {
          class: base + "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
          icon: <Award size={12} />
        };
      case "upcoming":
        return {
          class: base + "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
          icon: <Clock size={12} />
        };
      case "ended (pending results)":
        return {
          class: base + "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
          icon: <Loader2 size={12} className="animate-spin" />
        };
      default:
        return {
          class: base + "bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700",
          icon: <AlertCircle size={12} />
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContestStats = () => {
    return {
      total: contests.length,
      running: contests.filter(c => c.status === 'running').length,
      upcoming: contests.filter(c => c.status === 'upcoming').length,
      finished: contests.filter(c => c.status === 'finished').length,
      pending: contests.filter(c => c.status === 'ended (pending results)').length
    };
  };

  const stats = getContestStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading contest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center shadow-2xl">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                Contest Administration
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Monitor, manage, and control all competitive events
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 dark:from-red-500/5 dark:via-amber-500/5 dark:to-red-500/5 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 dark:border-red-500/10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Trophy size={14} />
                  Total
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats.running}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Zap size={14} />
                  Live
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stats.upcoming}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Clock size={14} />
                  Upcoming
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                  {stats.pending}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 size={14} />
                  Pending
                </div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                  {stats.finished}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Award size={14} />
                  Completed
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by contest name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ended (pending results)">Pending Results</option>
                  <option value="finished">Finished</option>
                </select>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contests Table */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="col-span-4 text-sm font-semibold text-gray-500 dark:text-gray-400">CONTEST DETAILS</div>
              <div className="col-span-3 text-sm font-semibold text-gray-500 dark:text-gray-400">TIMELINE</div>
              <div className="col-span-2 text-sm font-semibold text-gray-500 dark:text-gray-400">STATUS</div>
              <div className="col-span-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">ADMIN ACTIONS</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContests.length > 0 ? (
                filteredContests.map((c) => {
                  const statusConfig = getStatusConfig(c.status);
                  const isActionLoading = actionLoading === c._id;
                  
                  return (
                    <div 
                      key={c._id}
                      className="group grid grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                      {/* Contest Info */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-amber-100 dark:from-red-900/30 dark:to-amber-900/30 flex items-center justify-center">
                            <Trophy size={18} className="text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 dark:text-white truncate">
                              {c.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate mt-1">
                              ID: {c._id}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Users size={12} />
                                <span>{c.participants?.length || 0} participants</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="col-span-3">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Starts:</span> {formatDate(c.startTime)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Ends:</span> {formatDate(c.endTime)}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className="flex flex-col gap-1">
                          <span className={statusConfig.class}>
                            {statusConfig.icon}
                            {c.status === "ended (pending results)" ? "PENDING" : c.status.toUpperCase()}
                          </span>
                          {c.status === "running" && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Zap size={10} />
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="col-span-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => window.location.href = `/contest/${c._id}`}
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="View Contest"
                          >
                            <Eye size={16} />
                          </button>

                          {/* End/Delete/Start Buttons */}
                          {c.status === "running" || c.status === "ended (pending results)" ? (
                            <button
                              onClick={() => endContest(c._id)}
                              disabled={isActionLoading}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-red-500/25 flex items-center gap-2 disabled:opacity-50"
                            >
                              {isActionLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <StopCircle size={14} />
                              )}
                              End
                            </button>
                          ) : c.status === "upcoming" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startContest(c._id)}
                                disabled={isActionLoading}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-green-500/25 flex items-center gap-2 disabled:opacity-50"
                              >
                                {isActionLoading ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <PlayCircle size={14} />
                                )}
                                Start
                              </button>
                              <button
                                onClick={() => deleteContest(c._id)}
                                disabled={isActionLoading}
                                className="p-2 bg-gray-100 dark:bg-gray-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Contest"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : c.status === "finished" ? (
                            <button
                              onClick={() => window.location.href = `/contest/${c._id}/scoreboard`}
                              className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-gray-800/25 flex items-center gap-2"
                            >
                              <BarChart3 size={14} />
                              Results
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No contests found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? "Try a different search query" : "No contests have been created yet"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>Admin Access • {filteredContests.length} contests</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Endable</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Deletable</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span>View Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notice */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 dark:from-red-500/5 dark:to-amber-500/5 rounded-2xl p-6 border border-red-500/20 dark:border-red-500/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <Settings size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Admin Guidelines
                  </h3>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-500" />
                      Ending a contest will permanently calculate and update user ratings
                    </li>
                    <li className="flex items-center gap-2">
                      <Trash2 size={14} className="text-red-500" />
                      Deletion is irreversible and will remove all contest data
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={14} className="text-blue-500" />
                      Upcoming contests can be started early if needed
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}