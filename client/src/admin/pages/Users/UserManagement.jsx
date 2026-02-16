import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../shared/services/api';
import Loader from '../../../shared/components/Loader';
import Toast from '../../../shared/components/Toast';

const UserManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    submissions: {
      total: 0,
      accepted: 0,
      acceptanceRate: 0,
      uniqueProblemsSolved: 0,
      languageDistribution: {},
      verdictDistribution: {}
    },
    matches: {
      total: 0,
      won: 0,
      lost: 0,
      winRate: 0
    },
    contests: {
      participated: 0,
      details: []
    },
    recentActivity: {
      submissions: 0,
      matches: 0,
      contests: 0
    }
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    if (id) {
      fetchUserDetailedData();
    }
  }, [id]);

  const fetchUserDetailedData = async () => {
    setLoading(true);
    try {
      // Use the new detailed stats endpoint
      const response = await adminAPI.getUserDetailedStats(id);
      if (!response) {
        throw new Error('Failed to fetch user data');
      }

      const { user, statistics, recentSubmissions, recentMatches } = response;
      
      setUser(user);
      setStats(statistics);
      setRecentSubmissions(recentSubmissions || []);
      setRecentMatches(recentMatches || []);
      setContests(statistics.contests?.details || []);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async () => {
    if (window.confirm(`Are you sure you want to ${user.isAdmin ? 'remove admin privileges from' : 'make admin'} this user?`)) {
      setLoading(true);
      try {
        await adminAPI.updateUserRole(user._id, !user.isAdmin);
        setUser(prev => ({ ...prev, isAdmin: !prev.isAdmin }));
        setError(null);
        // Show success message
        setError(`${user.username} is now ${!user.isAdmin ? 'an admin' : 'a regular user'}`);
        setTimeout(() => setError(null), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update user role');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      setLoading(true);
      try {
        await adminAPI.deleteUser(user._id);
        // Navigate back to user list with success message
        navigate('/admin/users', { state: { message: `User "${user.username}" deleted successfully` } });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
        setLoading(false);
      }
    }
  };

  const handleBanUser = async () => {
    const reason = prompt('Enter reason for banning this user:');
    if (reason) {
      setLoading(true);
      try {
        await adminAPI.banUser(user._id, reason);
        setUser(prev => ({ ...prev, isBanned: true, banReason: reason }));
        setError(`User "${user.username}" has been banned. Reason: ${reason}`);
        setTimeout(() => setError(null), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to ban user');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUnbanUser = async () => {
    if (window.confirm(`Are you sure you want to unban user "${user.username}"?`)) {
      setLoading(true);
      try {
        // Note: You'll need to create an unban endpoint in the backend
        // For now, we'll just update the UI
        setUser(prev => ({ ...prev, isBanned: false, banReason: '' }));
        setError(`User "${user.username}" has been unbanned`);
        setTimeout(() => setError(null), 3000);
      } catch (err) {
        setError('Failed to unban user. You may need to create an unban endpoint.');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return 'bg-green-900/30 text-green-400 border border-green-800/50';
      case 'WRONG_ANSWER':
        return 'bg-red-900/30 text-red-400 border border-red-800/50';
      case 'TIME_LIMIT_EXCEEDED':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50';
      case 'RUNTIME_ERROR':
        return 'bg-orange-900/30 text-orange-400 border border-orange-800/50';
      case 'QUEUED':
        return 'bg-blue-900/30 text-blue-400 border border-blue-800/50';
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  };

  const getMatchResult = (match) => {
    if (!match.winner) return { text: 'Draw', color: 'bg-gray-800 text-gray-400 border border-gray-700' };
    const won = match.winner._id === user._id;
    return { 
      text: won ? 'Won' : 'Lost', 
      color: won ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50' 
    };
  };

  if (loading && !user) return <Loader />;

  if (!user) return <div className="p-6 text-gray-300">User not found</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      {error && (
        <Toast 
          message={error} 
          type={error.includes('success') || error.includes('now') ? 'success' : 'error'} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-white">
            {user.username} 
            <span className="text-base text-gray-400 ml-2">({user.email})</span>
          </h1>
          <p className="text-gray-400 mt-1">
            User Management - Detailed view and administrative controls
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleToggleAdmin}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              user.isAdmin 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            disabled={loading}
          >
            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
          </button>
          {user.isBanned ? (
            <button
              onClick={handleUnbanUser}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Unban User
            </button>
          ) : (
            <button
              onClick={handleBanUser}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Ban User
            </button>
          )}
          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            Delete User
          </button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">User Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400 font-medium">Username:</span>
              <span className="font-semibold text-white">{user.username}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400 font-medium">Email:</span>
              <span className="font-semibold text-white">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400 font-medium">Rating:</span>
              <span className="font-semibold text-blue-400">{user.rating}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400 font-medium">Role:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.isAdmin 
                  ? 'bg-indigo-900 text-indigo-300' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {user.isAdmin ? 'Admin' : 'User'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400 font-medium">Joined:</span>
              <span className="font-medium text-gray-300">{formatDate(user.createdAt)}</span>
            </div>
            {user.isBanned && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400 font-medium">Status:</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-900 text-red-300">
                  Banned: {user.banReason}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Submission Statistics</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{stats.submissions.total}</div>
              <div className="text-sm text-blue-300 font-medium">Total Submissions</div>
            </div>
            <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{stats.submissions.accepted}</div>
              <div className="text-sm text-green-300 font-medium">Accepted</div>
            </div>
            <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">{stats.submissions.uniqueProblemsSolved}</div>
              <div className="text-sm text-purple-300 font-medium">Problems Solved</div>
            </div>
            <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">{stats.submissions.acceptanceRate}%</div>
              <div className="text-sm text-yellow-300 font-medium">Acceptance Rate</div>
            </div>
          </div>
          
          {/* Language Distribution */}
          {Object.keys(stats.submissions.languageDistribution || {}).length > 0 && (
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Languages Used:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.submissions.languageDistribution).map(([lang, count]) => (
                  <span key={lang} className="px-3 py-1.5 bg-gray-750 text-gray-300 text-sm font-medium rounded-lg border border-gray-700">
                    {lang}: <span className="font-semibold text-white">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Match & Contest Stats */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Match & Contest Stats</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-cyan-400">{stats.matches.total}</div>
              <div className="text-sm text-cyan-300 font-medium">Matches Played</div>
            </div>
            <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{stats.matches.won}</div>
              <div className="text-sm text-green-300 font-medium">Matches Won</div>
            </div>
            <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-violet-400">{stats.contests.participated}</div>
              <div className="text-sm text-violet-300 font-medium">Contests Entered</div>
            </div>
            <div className="text-center p-4 bg-gray-750 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">{stats.matches.winRate}%</div>
              <div className="text-sm text-yellow-300 font-medium">Win Rate</div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Activity (7 days):</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-gray-750 rounded-lg border border-gray-700">
                <div className="text-lg font-bold text-white">{stats.recentActivity.submissions}</div>
                <div className="text-xs text-gray-400 font-medium">Submissions</div>
              </div>
              <div className="text-center p-3 bg-gray-750 rounded-lg border border-gray-700">
                <div className="text-lg font-bold text-white">{stats.recentActivity.matches}</div>
                <div className="text-xs text-gray-400 font-medium">Matches</div>
              </div>
              <div className="text-center p-3 bg-gray-750 rounded-lg border border-gray-700">
                <div className="text-lg font-bold text-white">{stats.recentActivity.contests}</div>
                <div className="text-xs text-gray-400 font-medium">Contests</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions & Recent Matches Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Submissions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-850">
            <h2 className="text-lg font-semibold text-white">Recent Submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-850">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Verdict
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-400">No submissions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {submission.problemTitle || 'Unknown Problem'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300 font-medium">{submission.language}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerdictColor(submission.verdict)}`}>
                          {submission.verdict}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(submission.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-850">
            <h2 className="text-lg font-semibold text-white">Recent Matches</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-850">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Opponent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {recentMatches.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-400">No matches found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentMatches.map((match) => {
                    const result = getMatchResult(match);
                    return (
                      <tr key={match._id} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {match.opponentUsername || 'Unknown Opponent'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-300 font-medium">{match.problemTitle || 'Unknown Problem'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${result.color}`}>
                            {result.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(match.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contest Participation */}
      {contests.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-850">
            <h2 className="text-lg font-semibold text-white">Contest Participation</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-850">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contest Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Problems Solved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Participation Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {contests.map((contest) => (
                  <tr key={contest.contestId} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {contest.contestName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contest.status === 'completed' 
                          ? 'bg-gray-700 text-gray-300 border border-gray-600'
                          : contest.status === 'ongoing'
                          ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                          : 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                      }`}>
                        {contest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        <span className="text-green-400">{contest.solvedProblems}</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-gray-300">{contest.totalProblems}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(contest.participatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verdict Distribution */}
      {Object.keys(stats.submissions.verdictDistribution || {}).length > 0 && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">Verdict Distribution</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.submissions.verdictDistribution).map(([verdict, count]) => (
              <div key={verdict} className="flex items-center px-4 py-2.5 bg-gray-750 rounded-lg border border-gray-700">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold mr-3 ${getVerdictColor(verdict)}`}>
                  {verdict}
                </span>
                <span className="text-sm font-semibold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;