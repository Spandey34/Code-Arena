import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await authFetch.get('/users/leaderboard');
        setLeaderboard(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [authFetch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Leaderboard</h2>
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl mx-auto">
        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {leaderboard.map((user, index) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{Math.round(user.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;