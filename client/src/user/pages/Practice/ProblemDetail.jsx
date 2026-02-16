import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { problemAPI, submissionAPI } from '../../../shared/services/api';
import CodeEditor from '../../components/CodeEditor'; 
import { useSocket } from '../../../contexts/SocketContext';

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data for CodeEditor
  const [submissions, setSubmissions] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  
  // Terminal/Output State
  const [consoleOutput, setConsoleOutput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { socket } = useSocket();

  // 1. Fetch Problem & Submissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [probRes, subRes] = await Promise.all([
          problemAPI.getById(id),
          submissionAPI.getByProblem(id)
        ]);

        setProblem(probRes.problem);
        
        // Set initial code from boilerplate if available
        if (probRes.problem?.boilerplate) {
          setCode(probRes.problem.boilerplate);
        }

        if (subRes.submissions) {
          setSubmissions(subRes.submissions);
          // Auto-load last submission code if exists
          if (subRes.submissions.length > 0) {
            const lastSub = subRes.submissions[0];
            setCode(lastSub.code);
            setLanguage(lastSub.language);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Socket Listeners (The Engine)
  useEffect(() => {
    if (!socket) return;

    const handleResult = (data) => {
        if (data.problemId === id) {
            setIsProcessing(false);
            
            // A. Handle Compilation/Runtime Errors
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

            // B. Handle Test Results
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
            
            // Format console output for the terminal tab
            const rawLogs = results.map((r, i) => `Test ${i+1}: ${r.passed ? 'PASS' : 'FAIL'} (${r.runtime || 0}ms)`).join('\n');
            setConsoleOutput(`Verdict: ${verdict}\n\n${rawLogs}`);

            // C. Refresh Submissions List if it was a real submission (contains verdict)
            if (data.verdict) {
                 submissionAPI.getByProblem(id).then(res => setSubmissions(res.submissions));
            }
        }
    };

    socket.on('runCodeResult', handleResult);
    socket.on('submissionResult', handleResult);

    return () => {
      socket.off('runCodeResult', handleResult);
      socket.off('submissionResult', handleResult);
    };
  }, [id, socket]);

  // 3. Handlers
  const handleRunCode = async (currentCode, currentLang) => {
    setIsProcessing(true);
    setTestResults(null);
    setConsoleOutput('Sending code to execution server...');
    
    try {
      await submissionAPI.run({
        problemId: id,
        code: currentCode,
        language: currentLang,
      });
    } catch (error) {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown Error';
      setConsoleOutput(`API Error: ${errorMsg}`);
      setTestResults({ status: 'error', summary: 'Error', cases: [], rawError: errorMsg });
    }
  };

  const handleSubmitCode = async (currentCode, currentLang) => {
    setIsProcessing(true);
    setTestResults(null);
    setConsoleOutput('Submitting solution...');
    
    try {
      await submissionAPI.submit({
        problemId: id,
        code: currentCode,
        language: currentLang,
      });
    } catch (error) {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown Error';
      setConsoleOutput(`API Error: ${errorMsg}`);
      setTestResults({ status: 'error', summary: 'Error', cases: [], rawError: errorMsg });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#1e1e1e] text-white">Loading...</div>;
  
  if (!problem) return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#1e1e1e] text-white">
          <h2 className="text-xl">Problem not found</h2>
          <Link to="/practice" className="text-blue-400 mt-4">Go Back</Link>
      </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#1e1e1e]">
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
            previousSubmissions={submissions} // Critical: Passes history to the Submissions tab
        />
    </div>
  );
};

export default ProblemDetail;