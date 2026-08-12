import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchAPI, problemAPI, submissionAPI } from '../../../shared/services/api';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import CodeEditor from '../../components/CodeEditor';

const MatchRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  
  // Data State
  const [match, setMatch] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Game State
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [opponentStatus, setOpponentStatus] = useState({
    connected: false,
    submitted: false,
    solved: false
  });
  const [matchResult, setMatchResult] = useState(null); // { result: 'won'|'lost'|'draw', message: '' }

  // Editor State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Javascript');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [testResults, setTestResults] = useState(null);

  const timerRef = useRef();

  // 1. Fetch Match & Problem Data (Sequential Fetch)
  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        
        // Step 1: Fetch the Match Details
        // Assuming your API has a getById method for matches
        const response = await matchAPI.getMatchById(id); 
        const currentMatch = response?.match || response; // Handle different response structures
        if (!currentMatch) throw new Error('Match not found');
        setMatch(currentMatch);

        // Step 2: Fetch Problem Details if present in match
        const problemId = currentMatch.problem?._id || currentMatch.problem;
        
        if (problemId) {
            const probResponse = await problemAPI.getById(problemId);
            const fullProblem = probResponse?.problem || probResponse;
            setProblem(fullProblem);
            
            // Set boilerplate if available
            if (fullProblem?.boilerplate) {
                setCode(fullProblem.boilerplate);
            }
        }

        // Step 3: Calculate Time Left based on Match Creation Time
        if (currentMatch.createdAt) {
            const startTime = new Date(currentMatch.createdAt).getTime();
            const duration = 30 * 60 * 1000; // 30 minutes in ms
            const now = Date.now();
            const elapsed = now - startTime;
            const remainingSeconds = Math.max(0, Math.floor((duration - elapsed) / 1000));
            setTimeLeft(remainingSeconds);
        }

        // Step 4: Initial Opponent Status
        const opponentId = currentMatch.player1?._id === user._id 
          ? currentMatch.player2?._id 
          : currentMatch.player1?._id;
        
        setOpponentStatus(prev => ({
          ...prev,
          connected: !!opponentId
        }));

      } catch (error) {
        setError('Failed to load match details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
        fetchMatchDetails();
    }
  }, [id, user]);

  // 2. Timer Logic
  useEffect(() => {
    if (matchResult) {
        clearInterval(timerRef.current);
        return;
    }

    if (timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleTimeUp();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
    } else if (match && !matchResult && !loading) {
        handleTimeUp();
    }

    return () => clearInterval(timerRef.current);
  }, [matchResult, timeLeft, match, loading]);

  // 3. Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    // A. Handle Code Execution Results (Run & Submit)
    const handleCodeResult = (data) => {
        // Ensure result belongs to current problem/match
        if (data.problemId === problem?._id || (match && data.matchId === match._id)) {
            setIsProcessing(false);

            // 1. Handle Compilation/Runtime Errors
            const isCompileError = data.status === 'compile_error' || 
                                   data.verdict === 'RUNTIME_ERROR' || 
                                   (data.details && data.details.message && data.details.message.includes('Compilation Error'));

            if (isCompileError) {
                const rawError = data.error || data.details?.message || data.details?.error || 'Unknown Error';
                setTestResults({
                    status: 'error',
                    summary: 'Compilation / Runtime Error',
                    cases: [],
                    rawError: rawError
                });
                setConsoleOutput(rawError);
                return;
            }

            // 2. Handle Test Cases
            const results = data.details?.testResults || data.testCases || data.results || [];
            
            const formattedCases = results.map(r => ({
                status: r.passed ? 'Passed' : 'Failed',
                input: r.input,
                output: r.output,
                actual: r.output,
                expected: r.expected,
                error: r.error
            }));

            const passedCount = results.filter(r => r.passed).length;
            const totalCount = results.length;
            const verdict = data.verdict || (passedCount === totalCount ? 'ACCEPTED' : 'WRONG_ANSWER');
            const isSuccess = verdict === 'ACCEPTED' || (passedCount === totalCount && totalCount > 0);

            setTestResults({
                status: isSuccess ? 'success' : 'error',
                summary: isSuccess ? 'All Test Cases Passed' : `${passedCount}/${totalCount} Test Cases Passed`,
                cases: formattedCases
            });
            
            const rawLogs = results.map((r, i) => `Test ${i+1}: ${r.passed ? 'PASS' : 'FAIL'}`).join('\n');
            setConsoleOutput(`Verdict: ${verdict}\n${rawLogs}`);
        }
    };

    // B. Handle Match Results (Win/Loss)
    const handleMatchResult = (data) => {
         // data: { matchId, result: 'won' | 'lost' | 'draw' }
         if (data.matchId !== id) return;

         if (data.result === 'won') {
             setMatchResult({ result: 'won', message: '🎉 You Won! Speed and accuracy prevailed.' });
         } else if (data.result === 'lost') {
             setMatchResult({ result: 'lost', message: '😔 You Lost. The opponent solved it first.' });
             setOpponentStatus(prev => ({ ...prev, solved: true })); 
         } else {
             setMatchResult({ result: 'draw', message: '🤝 It\'s a Draw!' });
         }
         setIsProcessing(false); 
    };

    // C. Handle Opponent Updates
    const handleOpponentStatus = (data) => {
        setOpponentStatus(prev => ({ ...prev, ...data }));
    };

    socket.on('runCodeResult', handleCodeResult);
    socket.on('submissionResult', handleCodeResult);
    socket.on('matchResult', handleMatchResult);
    socket.on('opponentStatus', handleOpponentStatus);

    return () => {
        socket.off('runCodeResult', handleCodeResult);
        socket.off('submissionResult', handleCodeResult);
        socket.off('matchResult', handleMatchResult);
        socket.off('opponentStatus', handleOpponentStatus);
    };
  }, [socket, id, problem, match]);


  // 4. Action Handlers
  const handleRunCode = async (currentCode, currentLang) => {
    setIsProcessing(true);
    setTestResults(null);
    setConsoleOutput('Sending code to execution server (Test Mode)...');
    
    try {
      await submissionAPI.run({
        problemId: problem._id,
        code: currentCode,
        language: currentLang,
      });
    } catch (error) {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown Error';
      setConsoleOutput(`API Error: ${errorMsg}`);
      setTestResults({
          status: 'error',
          summary: 'Execution Failed',
          cases: [],
          rawError: errorMsg
      });
    }
  };

  const handleSubmitCode = async (currentCode, currentLang) => {
    setIsProcessing(true);
    setTestResults(null);
    setConsoleOutput('Submitting solution to Judge...');
    
    try {
      // Backend returns { verdict: 'QUEUED' }
      await matchAPI.submitCode(id, { code: currentCode, language: currentLang });
    } catch (error) {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown Error';
      setConsoleOutput(`API Error: ${errorMsg}`);
      setTestResults({
          status: 'error',
          summary: 'Submission Failed',
          cases: [],
          rawError: errorMsg
      });
    }
  };

  const handleTimeUp = () => {
    if (!matchResult) {
      setMatchResult({
        result: 'draw',
        message: 'Time\'s up! No one solved the problem.'
      });
    }
  };

  const getOpponent = () => {
    if (!match) return null;
    return match.player1?._id === user._id ? match.player2 : match.player1;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="text-center py-10 text-red-500 font-bold">{error}</div>;

  const opponent = getOpponent();

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-64px)] flex flex-col">
      {/* Match Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-4 mb-4 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <h1 className="text-xl font-bold">1v1 Match</h1>
            <div className="flex items-center space-x-2 text-sm opacity-90">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live • Room: {id.slice(0,6)}...</span>
            </div>
          </div>
          
          <div className="text-center my-2 md:my-0">
            <div className={`text-3xl font-mono font-bold ${timeLeft < 300 ? 'text-red-300' : 'text-white'}`}>
                {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <div className="text-sm opacity-90">Rating: {problem?.rating || 1200}</div>
          </div>
        </div>
      </div>

      {/* Players Bar */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-4 shrink-0">
        {/* Player 1 (You) */}
        <div className="col-span-1 md:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.username[0].toUpperCase()}
                </div>
                <div>
                    <div className="font-bold text-sm text-gray-800 dark:text-white">You</div>
                    <div className="text-xs font-mono text-gray-500">
                        {isProcessing ? 'Processing...' : (testResults?.summary || 'Thinking...')}
                    </div>
                </div>
            </div>
        </div>

        {/* VS Badge */}
        <div className="hidden md:flex col-span-1 items-center justify-center">
            <div className="bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xs shadow-lg">VS</div>
        </div>

        {/* Player 2 (Opponent) */}
        <div className="col-span-1 md:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between border-r-4 border-red-500 shadow-sm">
            <div className="text-right flex-1 mr-3">
                <div className="font-bold text-sm text-gray-800 dark:text-white">{opponent?.username || 'Opponent'}</div>
                <div className={`text-xs font-mono ${opponentStatus.solved ? 'text-green-500' : opponentStatus.submitted ? 'text-yellow-500' : 'text-gray-500'}`}>
                    {opponentStatus.solved ? 'Solved!' : opponentStatus.submitted ? 'Submitted...' : 'Thinking...'}
                </div>
            </div>
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                {opponent?.username?.[0]?.toUpperCase() || '?'}
            </div>
        </div>
      </div>

      {/* Match Result Overlay/Banner */}
      {matchResult && (
        <div className={`mb-4 p-4 rounded-lg text-center shadow-lg animate-in fade-in zoom-in duration-300 ${
          matchResult.result === 'won' 
            ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
            : matchResult.result === 'lost'
            ? 'bg-gradient-to-r from-red-600 to-pink-700 text-white'
            : 'bg-gray-700 text-white'
        }`}>
          <div className="text-2xl font-bold mb-1">
            {matchResult.message}
          </div>
          <button
            onClick={() => navigate('/match')}
            className="mt-3 px-6 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-all"
          >
            Find New Match
          </button>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 min-h-0">
         <CodeEditor 
            problem={{
                ...problem,
                examples: problem.testCases ? problem.testCases.slice(0, 2) : [], 
            }}
            initialCode={code}
            userLanguage={language}
            setUserLanguage={setLanguage}
            onRun={handleRunCode}
            onSubmit={handleSubmitCode}
            isProcessing={isProcessing}
            testResults={testResults}
            consoleOutput={consoleOutput}
            isMatch={true} 
        />
      </div>
    </div>
  );
};

export default MatchRoom;