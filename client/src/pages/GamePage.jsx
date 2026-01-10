import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Arena from '../components/Arena';

const TOTAL_DURATION = 30 * 60; // 30 minutes in seconds

const GamePage = () => {
  const { gameId } = useParams();
  const { user, authFetch, socket } = useContext(AuthContext);
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);

  /* ---------------- FETCH GAME ---------------- */
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await authFetch.get(`/game/${gameId}`);
        const gameData = res.data;
        setGame(gameData);

        // ⏱️ Compute initial time left from startTime
        if (gameData.startTime) {
          const elapsed = Math.floor(
            (Date.now() - new Date(gameData.startTime).getTime()) / 1000
          );
          setTimeLeft(Math.max(TOTAL_DURATION - elapsed, 0));
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch game details', error);
        navigate('/matchmaking');
      }
    };

    fetchGameDetails();
  }, [gameId, authFetch, navigate]);

  /* ---------------- SOCKET GAME OVER ---------------- */
  useEffect(() => {
    if (!socket) return;

    const handler = ({ winner }) => {
      alert(
        `Game over! Winner: ${winner === user._id ? 'You' : 'Opponent'}`
      );
      navigate('/leaderboard');
    };

    socket.on('gameOver', handler);
    return () => socket.off('gameOver', handler);
  }, [socket, user, navigate]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!game?.startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - new Date(game.startTime).getTime()) / 1000
      );
      const remaining = Math.max(TOTAL_DURATION - elapsed, 0);

      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        navigate('/leaderboard');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game, navigate]);

  /* ---------------- UI STATES ---------------- */
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
        <p className="text-lg text-slate-600">
          Game not found or has ended.
        </p>
      </div>
    );
  }

  return <Arena game={game} timeLeft={timeLeft} />;
};

export default GamePage;
