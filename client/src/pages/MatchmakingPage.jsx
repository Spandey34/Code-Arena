import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MatchmakingPage = () => {
  const { user, authFetch, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [status, setStatus] = useState('Tap the button to find a match.');
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);

  useEffect(() => {
    if (!user || !socket || !isSearching) {
      return;
    }

    socket.on('matchFound', ({ gameId }) => {
      setMatchFound(true);
      setStatus('Match found! Redirecting to game...');
      setTimeout(() => navigate(`/game/${gameId}`), 2000);
    });

    socket.on('waitingForOpponent', (data) => {
      setStatus(data.message);
    });

    socket.on('disconnect', () => {
      setStatus('Connection lost. Please try again.');
      setIsSearching(false);
      setMatchFound(false);
    });

    return () => {
      socket.off('matchFound');
      socket.off('waitingForOpponent');
      socket.off('disconnect');
    };
  }, [user, navigate, socket, isSearching]);

  const startMatchmaking = async () => {
    setIsSearching(true);
    setStatus('Looking for a match...');
    
    try {
      const res = await authFetch.post('/game/match');
      const gameId = res.data.gameId;
      setStatus(res.data.message);
      
      if (socket) {
        socket.emit('joinQueue', { userId: user._id, rating: user.rating, gameId: gameId });
      }
    } catch (error) {
      console.error('Matchmaking failed:', error);
      setStatus('Matchmaking failed. Please try again.');
      setIsSearching(false);
    }
  };

  const cancelMatchmaking = () => {
    if (socket) {
      socket.emit('leaveQueue', { userId: user._id });
    }
    setIsSearching(false);
    setStatus('Matchmaking canceled.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Matchmaking</h2>
        <p className="text-lg text-slate-600">{status}</p>

        <div className="mt-6">
          {isSearching ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-amber-500 animate-bounce"></div>
                <div className="w-4 h-4 rounded-full bg-amber-500 animate-bounce delay-100"></div>
                <div className="w-4 h-4 rounded-full bg-amber-500 animate-bounce delay-200"></div>
              </div>
              <button
                onClick={cancelMatchmaking}
                className="mt-4 bg-slate-200 text-slate-800 py-2 px-6 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={startMatchmaking}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
            >
              Start Matchmaking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchmakingPage;