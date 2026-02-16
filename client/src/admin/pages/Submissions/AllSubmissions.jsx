import React, { useState, useEffect } from 'react';
import { submissionAPI } from '../../../shared/services/api';
import { VERDICT_COLORS } from '../../../shared/utils/constants';
import { formatDate } from '../../../shared/utils/helpers';
import { X } from 'lucide-react';
import { Editor } from '@monaco-editor/react';

const SubmissionModal = ({ submission, onClose }) => {
    if (!submission) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          
            <div className="bg-[#1e1e1e] border border-[#333] rounded-lg w-[800px] h-[600px] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#252526]">
                    <div>
                        <h2 className="text-white font-medium text-lg">Submission Details</h2>
                        <span className="text-xs text-gray-400">ID: {submission._id}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-4 bg-[#252526] border-b border-[#333] flex gap-6 text-sm">
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Verdict</span>
                        <span className={`font-medium ${submission.verdict === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>{submission.verdict}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Language</span>
                        <span className="text-blue-400 font-mono">{submission.language}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Time</span>
                        <span className="text-gray-300">{new Date(submission.createdAt).toLocaleString()}</span>
                    </div>
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

const AllSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const[selectSubmission, setSelectSubmission] = useState(null);
  const [filters, setFilters] = useState({
    verdict: 'all',
    language: 'all',
    userId: '',
    problemId: ''
  });

  useEffect(() => {
    fetchAllSubmissions();
  }, []);


  useEffect(() => {
    filterSubmissions();
  }, [filters, submissions]);

  const fetchAllSubmissions = async () => {
    try {
      const response = await submissionAPI.getAll();
      console.log(response);
      setSubmissions(response.submissions);
      setFilteredSubmissions(response.submissions);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    if (filters.verdict !== 'all') {
      filtered = filtered.filter(sub => sub.verdict === filters.verdict);
    }

    if (filters.language !== 'all') {
      filtered = filtered.filter(sub => sub.language === filters.language);
    }

    if (filters.userId) {
      filtered = filtered.filter(sub => 
        sub.userId?._id?.includes(filters.userId) || 
        sub.userId?.username?.toLowerCase().includes(filters.userId.toLowerCase())
      );
    }

    if (filters.problemId) {
      filtered = filtered.filter(sub => 
        sub.problemId?._id?.includes(filters.problemId) ||
        sub.problemId?.title?.toLowerCase().includes(filters.problemId.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      verdict: 'all',
      language: 'all',
      userId: '',
      problemId: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        {selectSubmission && <SubmissionModal submission={selectSubmission} onClose={() => setSelectSubmission(null)} />}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          All Submissions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor all user submissions across the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-green-600">
            {submissions.filter(s => s.verdict === 'ACCEPTED').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Accepted</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-red-600">
            {submissions.filter(s => s.verdict === 'WRONG_ANSWER').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Wrong Answer</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {submissions.filter(s => s.verdict === 'TIME_LIMIT_EXCEEDED').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">TLE</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Filter Submissions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verdict
            </label>
            <select
              value={filters.verdict}
              onChange={(e) => handleFilterChange('verdict', e.target.value)}
              className="input-field"
            >
              <option value="all">All Verdicts</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WRONG_ANSWER">Wrong Answer</option>
              <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
              <option value="RUNTIME_ERROR">Runtime Error</option>
              <option value="COMPILATION_ERROR">Compilation Error</option>
              <option value="QUEUED">Queued</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="input-field"
            >
              <option value="all">All Languages</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User ID/Name
            </label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="input-field"
              placeholder="Filter by user..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Problem ID/Title
            </label>
            <input
              type="text"
              value={filters.problemId}
              onChange={(e) => handleFilterChange('problemId', e.target.value)}
              className="input-field"
              placeholder="Filter by problem..."
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-2">Time</div>
            <div className="col-span-2">User</div>
            <div className="col-span-3">Problem</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-2">Verdict</div>
            <div className="col-span-1">Code</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
          {filteredSubmissions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No submissions found matching your filters
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Time */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(submission.createdAt)}
                    </div>
                  </div>

                  {/* User */}
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                        {submission.userId?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white text-sm">
                          {submission.userId?.username || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {submission.userId?._id?.slice(0, 6)}...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Problem */}
                  <div className="col-span-3">
                    <div className="font-medium text-gray-800 dark:text-white text-sm">
                      {submission.problemId?.title || 'Unknown Problem'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      ID: {submission.problemId?._id?.slice(0, 8)}...
                    </div>
                  </div>

                  {/* Language */}
                  <div className="col-span-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                      {submission.language}
                    </span>
                  </div>

                  {/* Verdict */}
                  <div className="col-span-2">
                    <span className={`font-medium ${VERDICT_COLORS[submission.verdict] || 'text-gray-600'}`}>
                      {submission.verdict}
                    </span>
                  </div>

                  {/* Code */}
                  <div className="col-span-1">
                    <button
                      onClick={() => {
                        // Open code modal
                        setSelectSubmission(submission);
                      }}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllSubmissions;