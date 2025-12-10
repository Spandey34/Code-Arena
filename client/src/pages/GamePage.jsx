import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Arena from '../components/Arena';

const GamePage = () => {
  const { gameId } = useParams();
  const { user, authFetch, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await authFetch.get(`/game/${gameId}`);
        setGame(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch game details', error);
        navigate('/matchmaking');
      }
    };
    
    if (socket) {
      socket.on('gameOver', ({ winner }) => {
        alert(`Game over! Winner: ${winner === user._id ? 'You' : 'Opponent'}`);
        navigate('/leaderboard');
      });
    }

    fetchGameDetails();

    return () => {
      if (socket) {
        socket.off('gameOver');
      }
    };
  }, [gameId, user, authFetch, navigate, socket]);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-submit logic
      // This is a simplified auto-submit; in a real app, you'd send an empty submission
      // to the backend to end the game.
      // For now, we'll simply trigger a navigation to the leaderboard.
      navigate('/leaderboard');
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-slate-600">Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-slate-600">Game not found or has ended.</p>
      </div>
    );
  }

  return <Arena game={game} timeLeft={timeLeft} />;
};

export default GamePage;