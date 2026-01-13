import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Arena from '../components/Arena';
import { 
  Clock, 
  Trophy, 
  Sword, 
  Users, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
  Settings,
  Fullscreen,
  Minimize,
  Target,
  Code,
  BarChart3,
  Gamepad2,
  Crown,
  Skull
} from 'lucide-react';

const TOTAL_DURATION = 30 * 60; // 30 minutes in seconds

const GamePage = () => {
  const { gameId } = useParams();
  const { user, authFetch, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [opponentInfo, setOpponentInfo] = useState(null);
  const [gameStats, setGameStats] = useState({
    linesWritten: 0,
    testsPassed: 0,
    totalTests: 5,
    submissionCount: 0
  });
  const containerRef = useRef(null);

  /* ---------------- FETCH GAME ---------------- */
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await authFetch.get(`/game/${gameId}`);
        const gameData = res.data;
        setGame(gameData);

        // Find opponent info
        const opponent = gameData.players?.find(p => p._id !== user._id);
        if (opponent) {
          setOpponentInfo(opponent);
        }

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
  }, [gameId, authFetch, navigate, user]);

  /* ---------------- SOCKET EVENTS ---------------- */
  useEffect(() => {
    if (!socket) return;

    // Game Over Handler
    const gameOverHandler = ({ winner }) => {
      const isWinner = winner === user._id;
      // We'll handle this in Arena component
    };

    // Opponent Submission Handler
    const opponentSubmitHandler = () => {
      // Trigger visual effect for opponent submission
      console.log('Opponent submitted!');
    };

    // Code Update Handler
    const codeUpdateHandler = ({ userId, code }) => {
      if (userId !== user._id) {
        // Handle opponent code updates
        console.log('Opponent code updated');
      }
    };

    socket.on('gameOver', gameOverHandler);
    socket.on('opponentSubmitted', opponentSubmitHandler);
    socket.on('codeUpdate', codeUpdateHandler);

    return () => {
      socket.off('gameOver', gameOverHandler);
      socket.off('opponentSubmitted', opponentSubmitHandler);
      socket.off('codeUpdate', codeUpdateHandler);
    };
  }, [socket, user]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!game?.startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - new Date(game.startTime).getTime()) / 1000
      );
      const remaining = Math.max(TOTAL_DURATION - elapsed, 0);

      setTimeLeft(remaining);

      // Update game stats every 10 seconds
      if (elapsed % 10 === 0) {
        setGameStats(prev => ({
          ...prev,
          linesWritten: prev.linesWritten + Math.floor(Math.random() * 5),
          testsPassed: Math.min(prev.testsPassed + Math.floor(Math.random() * 2), prev.totalTests)
        }));
      }

      if (remaining === 0) {
        clearInterval(interval);
        // Time's up - handle in Arena component
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game]);

  /* ---------------- FULLSCREEN HANDLER ---------------- */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /* ---------------- FORMAT TIME ---------------- */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sword size={24} className="text-amber-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Battle Arena</h2>
          <p className="text-gray-400">Preparing your coding challenge...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
          <p className="text-gray-400 mb-6">This game has ended or doesn't exist.</p>
          <button
            onClick={() => navigate('/matchmaking')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            Find New Match
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white"
    >
      {/* Top Battle Bar */}
      

      
        {/* Left Sidebar - Player Stats */}


        {/* Main Arena */}
        <div className="flex-1 overflow-hidden">
          <Arena game={game} timeLeft={timeLeft} />
        </div>

        {/* Right Sidebar - Problem & Actions */}
        
      </div>

      
      
        
      
    
  );
};

export default GamePage;