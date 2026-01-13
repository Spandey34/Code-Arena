import React, { useState, useContext, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../context/AuthContext";
import { Play, CheckCircle, Terminal, Copy, RotateCcw, Zap, Timer, User } from "lucide-react";

const LANGUAGE_MAP = {
  JavaScript: "javascript",
  Python: "python",
  Java: "java",
  "C++": "cpp",
};

const CODE_TEMPLATES = {
  JavaScript: `function solve(input) {
  // Write your solution here
  // Return the answer
}`,

  Python: `def solve(input_data):
    # Write your solution here
    # Return the answer
    pass`,

  Java: `public class Solution {
    public int solve(int[] input) {
        // Write your solution here
        return 0;
    }
}`,

  "C++": `int solve(vector<int>& input) {
    // Write your solution here
    return 0;
}`,
};

const Arena = ({ game, timeLeft }) => {
  const { user, authFetch, socket } = useContext(AuthContext);
  const problem = game?.problem;

  const [consoleOutput, setConsoleOutput] = useState("Ready to code!");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [code, setCode] = useState(CODE_TEMPLATES.JavaScript);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);
  const consoleRef = useRef(null);

  // Fetch user's previous submission
  useEffect(() => {
    if (!game?.submissions) return;
    
    game.submissions.forEach((submission) => {
      if (submission.player === user._id) {
        setIsSubmitted(true);
        setCode(submission.code);
        setSelectedLanguage(submission.language);
      }
      if (submission.player !== user._id) {
        setOpponentSubmitted(true);
      }
    });
  }, [game, user]);

  // Socket listener for opponent submission
  useEffect(() => {
    if (!socket) return;

    const handler = () => setOpponentSubmitted(true);
    socket.on("opponentSubmitted", handler);
    
    return () => socket.off("opponentSubmitted", handler);
  }, [socket]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const runCode = async () => {
    setConsoleOutput("Running tests...");
    try {
      const res = await authFetch.post("/game/run", {
        gameId: game._id,
        code,
        language: selectedLanguage,
      });

      const results = res.data.results || [];
      let out = "";
      let passed = 0;

      results.forEach((t, i) => {
        if (t.passed) {
          out += `✅ Test ${i + 1}: PASS\n`;
          passed++;
        } else {
          out += `❌ Test ${i + 1}: FAIL\n`;
        }
      });

      out += `\n${passed}/${results.length} passed`;
      setConsoleOutput(out);
    } catch (err) {
      setConsoleOutput(`Error: ${err?.response?.data?.message || "Failed"}`);
    }
  };

  const submitSolution = async () => {
    if (isSubmitted) return;
    setConsoleOutput("Submitting...");

    try {
      const res = await authFetch.post("/game/submit", {
        gameId: game._id,
        code,
        language: selectedLanguage,
      });

      const results = res.data.results || [];
      const passed = results.filter(t => t.passed).length;
      const total = results.length;
      
      setConsoleOutput(`Submitted! ${passed}/${total} tests passed`);
      setIsSubmitted(true);

      socket?.emit("submissionStatus", {
        gameId: game._id,
        userId: user._id,
        status: "submitted",
      });
    } catch (err) {
      setConsoleOutput(`Submission failed`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const resetCode = () => {
    if (window.confirm("Reset code to default?")) {
      setCode(CODE_TEMPLATES[selectedLanguage]);
    }
  };

  if (!problem) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Terminal className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Problem...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Status Bar */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{problem.title}</h2>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">
              Rating: {problem.rating || 1200}
            </div>
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <Timer size={14} className="mr-1" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">You:</span>
                <span className={`ml-2 font-medium ${isSubmitted ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isSubmitted ? 'Submitted ✓' : 'Coding...'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Opponent:</span>
                <span className={`ml-2 font-medium ${opponentSubmitted ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {opponentSubmitted ? 'Submitted ✓' : 'Coding...'}
                </span>
              </div>
            </div>
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setCode(CODE_TEMPLATES[e.target.value]);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-1 text-sm"
            disabled={isSubmitted}
          >
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Problem Panel */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-800 overflow-auto bg-white dark:bg-gray-900">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
            <div className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              {/* FIXED: Wrap ReactMarkdown in a div instead of using className prop */}
              <ReactMarkdown>
                {problem.description || "No description available."}
              </ReactMarkdown>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Examples</h3>
            {problem.testCases?.slice(0, 2).map((test, index) => (
              <div key={index} className="mb-4">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Example {index + 1}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="mb-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Input</div>
                    <pre className="bg-gray-900 p-3 rounded text-sm text-gray-100 overflow-x-auto">
                      {test.input}
                    </pre>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Output</div>
                    <pre className="bg-gray-900 p-3 rounded text-sm text-green-400 overflow-x-auto">
                      {test.output}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          {/* Editor Controls */}
          <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                title="Copy Code"
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={resetCode}
                disabled={isSubmitted}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded text-sm transition-colors"
                title="Reset Code"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={runCode}
                disabled={isSubmitted}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
              >
                <Play size={14} />
                Run
              </button>
              <button
                onClick={submitSolution}
                disabled={isSubmitted}
                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle size={14} />
                    Submitted
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              theme="vs-dark"
              language={LANGUAGE_MAP[selectedLanguage]}
              value={code}
              onChange={(v) => !isSubmitted && setCode(v || "")}
              options={{
                readOnly: isSubmitted,
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                lineNumbers: "on",
                renderLineHighlight: "all",
              }}
            />
          </div>

          {/* Console */}
          <div className="border-t border-gray-800 bg-gray-950">
            <div 
              onClick={() => setShowConsole(!showConsole)}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-gray-300">
                <Terminal size={14} />
                <span className="font-medium">Console</span>
              </div>
              <div className="text-gray-400">
                {showConsole ? '▼' : '▲'}
              </div>
            </div>
            
            {showConsole && (
              <div ref={consoleRef} className="px-4 py-3 max-h-32 overflow-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {consoleOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arena;