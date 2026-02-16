import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  authAPI, 
  problemAPI, 
  contestAPI, 
  submissionAPI,
  matchAPI 
} from '../../shared/services/api';
import { formatDate } from '../../shared/utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    totalContests: 0,
    totalMatches: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch leaderboard to get all users
      const usersRes = await authAPI.getLeaderboard();
      const problemsRes = await problemAPI.getAll();
      const submissionsRes = await submissionAPI.getAll();
      const contestsRes = await contestAPI.getAll();
      const matchesRes = await matchAPI.getAllMatches();

      setStats({
        totalUsers: usersRes.users.length,
        totalProblems: problemsRes.problems.length,
        totalSubmissions: submissionsRes.submissions.length,
        totalContests: contestsRes.length,
        totalMatches: matchesRes.matches.length,
      });

      // Get 5 most recent users
      setRecentUsers(usersRes.users.slice(0, 5));
      
      // Get 5 most recent submissions
      setRecentSubmissions(submissionsRes.submissions.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {stats?.totalUsers}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Total Users
          </div>
          <Link to="/users" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            View all →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {stats?.totalProblems}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Total Problems
          </div>
          <Link to="/problems" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            View all →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {stats?.totalSubmissions}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Total Submissions
          </div>
          <Link to="/submissions" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            View all →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {stats?.totalContests}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Total Contests
          </div>
          <Link to="/contests" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            View all →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-red-600 mb-2">
            {stats?.totalMatches}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Total Matches
          </div>
          <Link to="/matches" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            View all →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Recent Users
            </h2>
          </div>
          <div className="p-6">
            {recentUsers?.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rating: {user.rating}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/users/${user._id}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Recent Submissions
            </h2>
          </div>
          <div className="p-6">
            {recentSubmissions?.map((submission) => (
              <div key={submission._id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(submission.createdAt)}
                  </span>
                  <div>{submission.userId.username}</div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    submission.verdict === 'ACCEPTED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {submission.verdict=='ACCEPTED' ? 'AC' : <>{submission.verdict=='WRONG_ANSWER' ? 'WA' : 'RTE'}</>}
                  </span>
                </div>
                
                <div className="text-sm text-gray-800 dark:text-white">
                  {submission.language} • Problem ID: {submission.problemId._id.slice(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/problems/add"
            className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700"
          >
            Add New Problem
          </Link>
          <Link
            to="/contests/add"
            className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700"
          >
            Create Contest
          </Link>
          <Link
            to="/blogs/add"
            className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700"
          >
            Post Blog
          </Link>
          <Link
            to="/submissions"
            className="bg-yellow-600 text-white p-4 rounded-lg text-center hover:bg-yellow-700"
          >
            View Submissions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;