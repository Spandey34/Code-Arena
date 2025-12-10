import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user, authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const res = await authFetch.get('/users/profile');
          setProfile(res.data);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, authFetch]);

  const handleRejoin = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {user && profile ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome, {user.username}!</h1>
            <p className="text-lg text-slate-600">Your current rating is <span className="font-bold text-amber-500">{Math.round(profile.rating)}</span>.</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Recent Games (Last 24 Hours)</h2>
            {profile.gameHistory && profile.gameHistory.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {profile.gameHistory.map((history, index) => {
                  const game = history.gameId;
                  const isWinner = game.winner && game.winner === user._id;
                  const gameStatus = game.status;
                  const timeElapsed = (Date.now() - new Date(game.startTime).getTime()) / 1000;
                  const canRejoin = gameStatus === 'in-progress' && timeElapsed < 3600; // 1 hour
                  console.log(history)
                  return (
                    <li key={index} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">{game.problem.title}</p>
                        <p className="text-sm text-slate-500">
                          Played on: {new Date(game.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {gameStatus === 'completed' ? (
                          <span className={`font-semibold ${isWinner ? 'text-green-500' : 'text-red-500'}`}>
                            {isWinner ? 'Victory' : 'Defeat'}
                          </span>
                        ) : (
                          <span className="text-blue-500 font-semibold">In Progress</span>
                        )}
                        {canRejoin && (
                          <button
                            onClick={() => handleRejoin(game._id)}
                            className="bg-amber-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Rejoin
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-slate-500">No games played in the last 24 hours.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-slate-900">Welcome to Code Arena</h1>
            <p className="mt-4 text-lg text-slate-600">
              Compete, practice, and improve your coding skills.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;