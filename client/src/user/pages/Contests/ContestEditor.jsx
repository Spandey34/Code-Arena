import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestAPI, problemAPI, submissionAPI } from '../../../shared/services/api';
import { useSocket } from '../../../contexts/SocketContext';
import CodeEditor from '../../components/CodeEditor';
import { formatDate } from '../../../shared/utils/helpers';

const ContestEditor = () => {
  const { id, problemId } = useParams();
  const { socket } = useSocket();
  
  // Data State
  const [contest, setContest] = useState(null);
  const [problem, setProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [activeTab, setActiveTab] = useState('problem'); // Managed here for mobile/custom layouts if needed

  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef();

  // 1. Fetch Data
  useEffect(() => {
    fetchContestData();
  }, [id, problemId]);

  // 2. Timer Logic
  useEffect(() => {
    if (contest) {
      updateTimeLeft();
      timerRef.current = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [contest]);

  // 3. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleResult = (data) => {
        // Ensure result matches current problem context
        if (data.problemId === problemId) {
            setIsProcessing(false);
            
            // Handle Errors
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

            // Handle Success/Partial
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

            // If it's a submission verdict, refresh the submissions list
            if (data.verdict) {
                 fetchSubmissions();
            }
        }
    };

    socket.on('runCodeResult', handleResult);
    socket.on('submissionResult', handleResult);

    return () => {
      socket.off('runCodeResult', handleResult);
      socket.off('submissionResult', handleResult);
    };
  }, [socket, problemId]);

  const fetchContestData = async () => {
    try {
      setLoading(true);
      const contestRes = await contestAPI.getById(id);
      setContest(contestRes);

              const [probRes, subRes] = await Promise.all([
                problemAPI.getById(problemId),
                submissionAPI.getByProblem(problemId)
              ]);
      
              setProblem(probRes.problem);
              if (probRes.problem?.boilerplate) {
                setCode(probRes.problem.boilerplate);
              }
      
              if (subRes.submissions && subRes.submissions.length > 0) {
                setSubmissions(subRes.submissions);
                const lastSub = subRes.submissions[0];
                setCode(lastSub.code);
                setLanguage(lastSub.language);
              }
    } catch (error) {
      console.error('Failed to fetch contest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
      try {
        const submissionsRes = await contestAPI.getSubmissions(id);
        const problemSubmissions = submissionsRes.filter(
          s => s.problemId === problemId
        );
        setSubmissions(problemSubmissions);
      } catch (error) {
          console.error("Error fetching submissions", error);
      }
  };

  const updateTimeLeft = () => {
    if (!contest) return;
    
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(start.getTime() + contest.duration * 60 * 1000); // Duration is usually in minutes
    if(contest.status === 'completed') {
      setTimeLeft(0);
      return;
    }
    if (now > end) {
      setTimeLeft(0);
      return;
    }
    
    const diff = end - now;
    setTimeLeft(Math.floor(diff / 1000));
  };

  const handleRunCode = async (currentCode, currentLang) => {
    setIsProcessing(true);
    setTestResults(null);
    setConsoleOutput('Sending code to execution server...');
    try {
      await submissionAPI.run({
        problemId,
        code: currentCode,
        language: currentLang
      });
    } catch (error) {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown Error';
      setConsoleOutput(`API Error: ${errorMsg}`);
      setTestResults({ status: 'error', summary: 'Error', cases: [], rawError: errorMsg });
    }
  };

  const handleSubmitCode = async (currentCode, currentLang) => {

    if(timeLeft <= 0) {
      setConsoleOutput('Contest has ended. Submissions are closed.');
      setTestResults({ status: 'error', summary: 'Contest Ended', cases: [], rawError: 'Contest has ended. Submissions are closed.' });
      return;
    }
    setIsProcessing(true);
    setTestResults(null);
    setConsoleOutput('Submitting solution...');
    try {
      await submissionAPI.submit({
        problemId,
        code: currentCode,
        language: currentLang,
        contestId: id // Important to pass contestId for tracking
      });
    } catch (error) {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown Error';
      setConsoleOutput(`API Error: ${errorMsg}`);
      setTestResults({ status: 'error', summary: 'Error', cases: [], rawError: errorMsg });
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  if (!contest || !problem) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Contest or problem not found</h1>
        <Link to={`/contests/${id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Back to Contest</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-64px)] flex flex-col">
      {/* Contest Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-4 mb-4 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-2 md:mb-0">
            <h1 className="text-xl font-bold">{contest.name}</h1>
            <div className="text-sm text-blue-200">Problem: {problem.title}</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-mono font-bold">{formatTime(timeLeft)}</div>
            <div className="text-sm text-blue-200">Time Left</div>
          </div>
          
          <div className="text-center md:text-right">
            <div className="text-sm text-blue-200">Your Submissions</div>
            <div className="text-xl font-bold">{submissions.length}</div>
          </div>
        </div>
      </div>

      {/* Problem Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 overflow-x-auto shrink-0 border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 p-2">
          {contest.problems?.map((p, index) => (
            <Link
              key={p._id}
              to={`/contests/${id}/problem/${p._id}`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                p._id === problemId
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Problem {String.fromCharCode(65 + index)}
            </Link>
          ))}
          <div className="flex-1"></div>
          <Link
            to={`/contests/${id}/standings`}
            className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            Live Standings
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex gap-4">
         {/* Using CodeEditor Shared Component */}
         <div className="flex-1 h-full">
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
                previousSubmissions={submissions}
                isContest={true} // Hides Editorials tab, keeps Description & Submissions accessible
            />
         </div>
         
         {/* Optional: Right Sidebar for Contest Specifics (Clarifications/Stats) */}
         {/* You can add a collapsible sidebar here if needed, or keep it clean like MatchRoom */}
      </div>
    </div>
  );
};

export default ContestEditor;