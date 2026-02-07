import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom"
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Zap, 
  AlertCircle,
  Save,
  Play,
  Layers,
  Hash,
  Target,
  CheckCircle,
  XCircle,
  ChevronRight,
  Sparkles,
  Eye
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

export default function CreateContest() {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(120);
  const [problems, setProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [searchProblem, setSearchProblem] = useState("");
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { theme } = useContext(ThemeContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/problems/admin/problems", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAllProblems(data);
        setFilteredProblems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (searchProblem) {
      const filtered = allProblems.filter(p => 
        p.title.toLowerCase().includes(searchProblem.toLowerCase()) ||
        p._id.toLowerCase().includes(searchProblem.toLowerCase())
      );
      setFilteredProblems(filtered);
    } else {
      setFilteredProblems(allProblems);
    }
  }, [searchProblem, allProblems]);

  const addProblem = (p) => {
    if (problems.find(item => item.problemId === p._id)) return;
    const nextIndex = String.fromCharCode(65 + problems.length);
    setProblems([...problems, { 
      problemId: p._id, 
      title: p.title, 
      index: nextIndex, 
      points: 100,
      difficulty: p.difficulty || "medium"
    }]);
  };

  const removeProblem = (id) => {
    setProblems(problems.filter(p => p.problemId !== id));
  };

  const updateProblem = (i, field, value) => {
    const copy = [...problems];
    copy[i][field] = value;
    setProblems(copy);
  };

  const moveProblem = (index, direction) => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === problems.length - 1)) return;
    
    const newProblems = [...problems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newProblems[index], newProblems[newIndex]] = [newProblems[newIndex], newProblems[index]];
    setProblems(newProblems);
  };

  const createContest = async () => {
    if (!name.trim()) {
      alert("Please enter a contest name");
      return;
    }
    if (!startTime) {
      alert("Please select a start time");
      return;
    }
    if (problems.length === 0) {
      alert("Please add at least one problem");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/contest/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, startTime, duration, problems })
      });
      const data = await res.json();
      alert(data.message || "Contest created successfully!");
      // Reset form
      setName("");
      setStartTime("");
      setDuration(120);
      setProblems([]);
      navigate('/admin/contest/history');
      
    } catch (err) {
      alert("Failed to create contest");
    } finally {
      setCreating(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'hard': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                Create New Contest
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Design your competition and craft the perfect challenge
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contest Settings Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Trophy className="text-amber-500" size={24} />
                  Contest Configuration
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contest Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Contest Name
                    </label>
                    <input
                      className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      placeholder="e.g. Winter Code Jam 2024"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      value={duration}
                      onChange={e => setDuration(+e.target.value)}
                    />
                  </div>

                  {/* Start Time */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3">
                      <Calendar size={20} className="text-gray-400" />
                      <input
                        type="datetime-local"
                        className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye size={18} />
                    Contest Preview
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {problems.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Problems</div>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {duration}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {name ? name.slice(0, 10) + (name.length > 10 ? '...' : '') : '--'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Name</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Problems Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Layers className="text-indigo-500" size={24} />
                  Selected Problems ({problems.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {problems.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <Layers size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No problems selected
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add problems from the problem library
                    </p>
                  </div>
                ) : (
                  problems.map((p, i) => (
                    <div key={p.problemId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveProblem(i, 'up')}
                              disabled={i === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveProblem(i, 'down')}
                              disabled={i === problems.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                          
                          <div className="w-12">
                            <input
                              className="w-12 text-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 font-bold text-gray-900 dark:text-white"
                              value={p.index}
                              onChange={e => updateProblem(i, "index", e.target.value)}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {p.title}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <div className={`text-sm font-medium ${getDifficultyColor(p.difficulty)}`}>
                                {p.difficulty?.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {p.problemId.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-24">
                            <input
                              type="number"
                              className="w-24 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                              value={p.points}
                              onChange={e => updateProblem(i, "points", +e.target.value)}
                            />
                          </div>
                          
                          <button
                            onClick={() => removeProblem(p.problemId)}
                            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Remove problem"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Problem Library */}
          <div className="space-y-8">
            {/* Problem Library Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Target className="text-green-500" size={24} />
                  Problem Library ({allProblems.length})
                </h3>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchProblem}
                    onChange={e => setSearchProblem(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Problems List */}
              <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredProblems.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-600 dark:text-gray-400">No problems found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProblems.map(p => {
                      const isAdded = problems.find(item => item.problemId === p._id);
                      return (
                        <div
                          key={p._id}
                          className={`p-4 rounded-lg transition-all ${isAdded 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white truncate">
                                {p.title}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs font-medium ${getDifficultyColor(p.difficulty)}`}>
                                  {p.difficulty?.toUpperCase() || 'MEDIUM'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {p.points || 100} pts
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => isAdded ? removeProblem(p._id) : addProblem(p)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                isAdded
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                                  : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/40'
                              }`}
                            >
                              {isAdded ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle size={14} />
                                  Added
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Plus size={14} />
                                  Add
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Create Button Card */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-indigo-500/5 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20 dark:border-indigo-500/10">
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Ready to Launch?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Review your contest settings before creating
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Problems</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {problems.length} selected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {duration} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Points</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {problems.reduce((sum, p) => sum + (p.points || 0), 0)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={createContest}
                  disabled={creating || problems.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Launch Contest
                    </>
                  )}
                </button>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4">
                  <p>Double-check all settings. Contest will be visible to users immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}