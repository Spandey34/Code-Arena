import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Arena = ({ game, timeLeft }) => {
  const { user, authFetch, socket } = useContext(AuthContext);
  const [player1ConsoleOutput, setPlayer1ConsoleOutput] = useState('Ready...');
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [code, setCode] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  
  const problem = game.problem;

  const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++'];

  useEffect(() => {
    if (socket) {
      socket.on('opponentSubmitted', (data) => {
        setOpponentSubmitted(true);
      });
    }
  }, [socket]);

  const handleCopyPaste = (e) => {
    e.preventDefault();
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const runCode = async () => {
    setPlayer1ConsoleOutput('Running tests...');
    try {
      const res = await authFetch.post('/game/run', {
        gameId: game._id,
        code,
        language: selectedLanguage,
      });
      
      const results = res.data.results;
      console.log(results);
      let output = 'Running tests...\n';
      results.forEach((test, index) => {
        output += test.passed ? `✔ Test Case ${index + 1} Passed\n` : `✖ Test Case ${index + 1} Failed: Expected ${test.expected}, got ${test.output}\n`;
      });
      setPlayer1ConsoleOutput(output);
    } catch (error) {
      console.error('Code execution failed', error.response.data);
      setPlayer1ConsoleOutput(error.response.data.message || 'An error occurred during execution.');
    }
  };

  const submitSolution = async () => {
    if (isSubmitted) return;
    setPlayer1ConsoleOutput('Submitting solution...');
    try {
      const res = await authFetch.post('/game/submit', {
        gameId: game._id,
        code,
        language: selectedLanguage,
      });
      
      const results = res.data.results;
      const allTestsPassed = results.every(test => test.passed);

      let output = 'Submission results...\n';
      results.forEach((test, index) => {
        output += test.passed ? `✔ Test Case ${index + 1} Passed\n` : `✖ Test Case ${index + 1} Failed: Expected ${test.expected}, got ${test.output}\n`;
      });
      setPlayer1ConsoleOutput(output);
      
      setIsSubmitted(true);
      if (socket) {
        socket.emit('submissionStatus', { gameId: game._id, userId: user._id, status: 'submitted' });
      }

    } catch (error) {
      console.error('Submission failed', error.response.data);
      setPlayer1ConsoleOutput(error.response.data.message || 'An error occurred during submission.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">Problem: {problem.title}</h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-slate-500">Your Status</span>
              <div className="text-sm font-medium text-amber-600">{isSubmitted ? 'Submitted' : 'Not Submitted'}</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-slate-500">Opponent Status</span>
              <div className="text-sm font-medium text-slate-400">{opponentSubmitted ? 'Submitted' : 'Not Submitted'}</div>
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-slate-500">Time Left</span>
              <div className="text-2xl font-bold text-slate-900">{formatTime(timeLeft)}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-6">
        <div className="bg-white rounded-xl shadow-lg flex-1 p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Problem Description</h3>
          <p className="text-slate-600 mb-4">{problem.description}</p>
          <h4 className="text-lg font-semibold text-slate-800 mb-2">Example 1:</h4>
          <pre className="bg-slate-100 p-3 rounded-lg text-sm font-mono text-slate-700 overflow-x-auto">
            Input: {problem.testCases[0]?.input || 'N/A'}
            Output: {problem.testCases[0]?.output || 'N/A'}
          </pre>
        </div>

        <div className="bg-white rounded-xl shadow-lg flex-1 flex flex-col">
          <div className="p-4 flex justify-between items-center bg-slate-100 rounded-t-xl">
            <div className="text-sm text-slate-600 font-semibold">Code Editor</div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-sm font-mono focus:ring-amber-500 focus:border-amber-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="p-4 flex-1 flex flex-col bg-slate-800 text-slate-100 rounded-b-xl">
            <div className="flex-1 flex flex-col">
              <textarea
                className="font-mono text-sm bg-transparent text-slate-100 w-full h-full flex-1 resize-none focus:outline-none"
                placeholder="Type your code here..."
                onCopy={handleCopyPaste}
                onCut={handleCopyPaste}
                onPaste={handleCopyPaste}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              ></textarea>
              <p className="text-xs text-slate-500 mt-2">
                Note: Copying and pasting code is disabled for this competition.
              </p>
            </div>
            <div className="mt-4 flex-1 flex flex-col h-48">
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Output Console</h4>
              <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-200 flex-1 overflow-y-auto">
                <pre className="console-output whitespace-pre-wrap">{player1ConsoleOutput}</pre>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={runCode}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Run Code
              </button>
              <button
                onClick={submitSolution}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={isSubmitted}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arena;