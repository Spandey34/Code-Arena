import React, { useState, useEffect } from 'react';
import { contestAPI, submissionAPI } from '../../../shared/services/api';
import { VERDICT_COLORS } from '../../../shared/utils/constants';
import { formatDate } from '../../../shared/utils/helpers';
import { X } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { useParams } from 'react-router-dom';

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

const ContestSubmissions = () => {
    const {id} = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [filter, languageFilter, submissions]);

  const fetchSubmissions = async () => {
    try {
      const response = await contestAPI.getSubmissions(id);
      setSubmissions(response);
      setFilteredSubmissions(response);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    if (filter !== 'all') {
      filtered = filtered.filter(sub => sub.verdict === filter);
    }

    if (languageFilter !== 'all') {
      filtered = filtered.filter(sub => sub.language === languageFilter);
    }

    setFilteredSubmissions(filtered);
  };

  const getVerdictColor = (verdict) => {
    return VERDICT_COLORS[verdict] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedSubmission && <SubmissionModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          My Submissions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your submission history
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Verdict
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
              Filter by Language
            </label>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Languages</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter('all');
                setLanguageFilter('all');
              }}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {submissions?.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Submissions
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {submissions.filter(s => s.verdict === 'ACCEPTED').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Accepted
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {submissions.filter(s => s.verdict === 'WRONG_ANSWER').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Wrong Answers
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {submissions.filter(s => s.verdict === 'TIME_LIMIT_EXCEEDED').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Time Limit Exceeded
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-2">Time</div>
            <div className="col-span-3">Problem</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-2">Verdict</div>
            <div className="col-span-3">Code</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredSubmissions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No submissions found. Try adjusting your filters.
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

                  {/* Problem */}
                  <div className="col-span-3">
                    <div className="font-medium text-gray-800 dark:text-white truncate">
                      Problem ID: {submission.problemId._id?.slice(0, 8)}...
                    </div>
                  </div>

                  {/* Language */}
                  <div className="col-span-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                      {submission.language}
                    </span>
                  </div>

                  {/* Verdict */}
                  <div className="col-span-2">
                    <span className={`font-medium ${getVerdictColor(submission.verdict)}`}>
                      {submission.verdict}
                    </span>
                  </div>

                  {/* Code */}
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {submission.code?.substring(0, 50)}...
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Show code modal
                          setSelectedSubmission(submission);
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination (if needed) */}
      {filteredSubmissions.length > 0 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
              Previous
            </button>
            <span className="px-3 py-2 text-gray-600 dark:text-gray-400">
              Page 1 of 1
            </span>
            <button className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ContestSubmissions;