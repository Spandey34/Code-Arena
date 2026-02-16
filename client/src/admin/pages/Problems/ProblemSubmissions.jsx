import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../../shared/hooks/useApi';
import Loader from '../../../shared/components/Loader';
import Toast from '../../../shared/components/Toast';
import { submissionAPI } from '../../../shared/services/api';

const ProblemSubmissions = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { get, loading, error } = useApi();
  const [problem, setProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState({
    userId: '',
    verdict: '',
    language: '',
  });
  const [allSubmissions, setAllSubmissions] = useState([]);

  useEffect(() => {
    fetchProblem();
    fetchAllSubmissions();
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      const response = await get(`/api/problem/info/${problemId}`);
      if (response) setProblem(response.problem);
    } catch (err) {
      console.error('Failed to fetch problem:', err);
    }
  };

  const fetchAllSubmissions = async () => {
    try {
      const response = await submissionAPI.getAll();
      if (response) {
        // Filter submissions by problemId
        const filtered = response.submissions.filter(
          sub => sub.problemId === problemId
        );
        setAllSubmissions(response.submissions);
        setSubmissions(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return 'text-green-600 bg-green-100';
      case 'WRONG_ANSWER':
        return 'text-red-600 bg-red-100';
      case 'TIME_LIMIT_EXCEEDED':
        return 'text-yellow-600 bg-yellow-100';
      case 'RUNTIME_ERROR':
        return 'text-orange-600 bg-orange-100';
      case 'QUEUED':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleViewCode = (submissionId) => {
    navigate(`/submissions/${submissionId}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = () => {
    let filtered = allSubmissions.filter(sub => sub.problemId === problemId);
    
    if (filter.userId) {
      filtered = filtered.filter(sub => 
        sub.userId?._id?.includes(filter.userId) || 
        sub.userId?.username?.toLowerCase().includes(filter.userId.toLowerCase())
      );
    }
    
    if (filter.verdict) {
      filtered = filtered.filter(sub => sub.verdict === filter.verdict);
    }
    
    if (filter.language) {
      filtered = filtered.filter(sub => sub.language === filter.language);
    }
    
    setSubmissions(filtered);
  };

  const languages = [...new Set(allSubmissions.map(sub => sub.language))];
  const verdicts = [...new Set(allSubmissions.map(sub => sub.verdict))];

  if (loading && !problem) return <Loader />;

  return (
    <div className="p-6">
      <Toast message={error} type="error" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Problem Submissions
          {problem && <span className="text-lg text-gray-600 ml-2">- {problem.title}</span>}
        </h1>
        <p className="text-gray-600 mt-2">
          View all submissions for this problem
        </p>
        {problem && (
          <div className="mt-3 flex space-x-4 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              Rating: {problem.rating}
            </span>
            <span className={`px-3 py-1 rounded-full ${
              problem.isPublic 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {problem.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <input
              type="text"
              name="userId"
              value={filter.userId}
              onChange={handleFilterChange}
              placeholder="Search by username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              name="language"
              value={filter.language}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verdict
            </label>
            <select
              name="verdict"
              value={filter.verdict}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Verdicts</option>
              {verdicts.map(verdict => (
                <option key={verdict} value={verdict}>{verdict}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleFilterSubmit}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setFilter({ userId: '', verdict: '', language: '' });
                setSubmissions(allSubmissions.filter(sub => sub.problemId === problemId));
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verdict
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No submissions found for this problem
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {submission.userId?.username || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rating: {submission.userId?.rating || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.language}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerdictColor(
                          submission.verdict
                        )}`}
                      >
                        {submission.verdict}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewCode(submission._id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <div>
          Total Submissions: {submissions.length}
        </div>
        <div>
          <span className="mr-4">
            Accepted: {submissions.filter(s => s.verdict === 'ACCEPTED').length}
          </span>
          <span>
            Success Rate: {submissions.length > 0 
              ? Math.round((submissions.filter(s => s.verdict === 'ACCEPTED').length / submissions.length) * 100) 
              : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProblemSubmissions;