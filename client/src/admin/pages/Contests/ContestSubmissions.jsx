import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestAPI } from '../../../shared/services/api';
import { VERDICT_COLORS } from '../../../shared/utils/constants';
import { formatDate } from '../../../shared/utils/helpers';
import { X, Search, Filter } from 'lucide-react';
import Editor from '@monaco-editor/react';

// --- Reusable Submission Modal (Same as reference) ---
const SubmissionModal = ({ submission, onClose }) => {
    if (!submission) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e1e] border border-[#333] rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#252526]">
                    <div>
                        <h2 className="text-white font-medium text-lg">Submission Details</h2>
                        <span className="text-xs text-gray-400">ID: {submission._id}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20}/>
                    </button>
                </div>
                <div className="p-4 bg-[#252526] border-b border-[#333] flex flex-wrap gap-6 text-sm">
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Verdict</span>
                        <span className={`font-medium ${submission.verdict === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>
                            {submission.verdict}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Language</span>
                        <span className="text-blue-400 font-mono">{submission.language}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Time</span>
                        <span className="text-gray-300">{formatDate(submission.createdAt)}</span>
                    </div>
                    {submission.userId && (
                        <div>
                            <span className="text-gray-500 block text-xs mb-1">User</span>
                            <span className="text-purple-400">@{submission.userId.username}</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-hidden p-0 relative">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={submission.language === 'c++' ? 'cpp' : submission.language.toLowerCase()}
                        value={submission.code}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            padding: { top: 15 },
                            fontFamily: "'Fira Code', monospace"
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const ContestSubmissions = () => {
  const { id } = useParams();
  
  // State
  const [contest, setContest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchUser, setSearchUser] = useState('');
  const [searchProblem, setSearchProblem] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('all');

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch contest info and submissions in parallel
        const [contestRes, submissionsRes] = await Promise.all([
            contestAPI.getById(id),
            contestAPI.getSubmissions(id)
        ]);
        
        setContest(contestRes);
        setSubmissions(submissionsRes);
        setFilteredSubmissions(submissionsRes);
      } catch (err) {
        console.error('Failed to fetch contest data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Filter Logic
  useEffect(() => {
    let result = submissions;

    if (searchUser) {
        result = result.filter(sub => 
            sub.userId?.username?.toLowerCase().includes(searchUser.toLowerCase())
        );
    }

    if (searchProblem) {
        result = result.filter(sub => 
            sub.problemId?.title?.toLowerCase().includes(searchProblem.toLowerCase())
        );
    }

    if (verdictFilter !== 'all') {
        result = result.filter(sub => sub.verdict === verdictFilter);
    }

    setFilteredSubmissions(result);
  }, [searchUser, searchProblem, verdictFilter, submissions]);

  const getVerdictColor = (verdict) => {
    // Fallback to constants or default colors
    return VERDICT_COLORS?.[verdict] || (verdict === 'ACCEPTED' ? 'text-green-600' : 'text-red-600');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        
        {/* Modal */}
        {selectedSubmission && (
            <SubmissionModal 
                submission={selectedSubmission} 
                onClose={() => setSelectedSubmission(null)} 
            />
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Contest Submissions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400">{contest?.name}</span>
              <span>•</span>
              <span>All participants</span>
            </p>
          </div>
          <Link 
            to={`/contests/${id}`}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Back to Contest
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* User Search */}
            <div className="relative">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    User
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        placeholder="Search username..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {/* Problem Search */}
            <div className="relative">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Problem
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        value={searchProblem}
                        onChange={(e) => setSearchProblem(e.target.value)}
                        placeholder="Search problem title..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {/* Verdict Filter */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Verdict
                </label>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                        value={verdictFilter}
                        onChange={(e) => setVerdictFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    >
                        <option value="all">All Verdicts</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="WRONG_ANSWER">Wrong Answer</option>
                        <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
                        <option value="RUNTIME_ERROR">Runtime Error</option>
                        <option value="COMPILATION_ERROR">Compilation Error</option>
                    </select>
                </div>
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
                <button
                    onClick={() => {
                        setSearchUser('');
                        setSearchProblem('');
                        setVerdictFilter('all');
                    }}
                    className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium h-[38px]"
                >
                    Reset Filters
                </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{filteredSubmissions.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mt-1">Visible</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-600">{filteredSubmissions.filter(s => s.verdict === 'ACCEPTED').length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mt-1">Accepted</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-red-600">{filteredSubmissions.filter(s => s.verdict === 'WRONG_ANSWER').length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mt-1">Wrong Answer</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-yellow-600">{filteredSubmissions.filter(s => s.verdict === 'TIME_LIMIT_EXCEEDED').length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mt-1">TLE</div>
            </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-2">Time</div>
            <div className="col-span-2">User</div>
            <div className="col-span-3">Problem</div>
            <div className="col-span-1">Lang</div>
            <div className="col-span-2">Verdict</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSubmissions.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No submissions found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <div 
                    key={submission._id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Time */}
                  <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(submission.createdAt)}
                  </div>

                  {/* User */}
                  <div className="col-span-2">
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {submission.userId?.username || 'Unknown'}
                    </div>
                  </div>

                  {/* Problem */}
                  <div className="col-span-3">
                    <div className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate" title={submission.problemId?.title}>
                      {submission.problemId?.title || 'Unknown Problem'}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="col-span-1">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-medium">
                      {submission.language}
                    </span>
                  </div>

                  {/* Verdict */}
                  <div className="col-span-2">
                    <span className={`text-sm font-semibold ${getVerdictColor(submission.verdict)}`}>
                      {submission.verdict}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      View Code
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContestSubmissions;