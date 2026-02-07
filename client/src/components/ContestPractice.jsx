import React, { useState, useContext, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext"; // Add ThemeContext
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  CheckCircle,
  Terminal,
  AlertTriangle,
  Copy,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Trophy,
  BookOpen,
  Code,
  Target,
  Award,
  Cpu,
  Hash,
  ChevronRight,
  ChevronLeft,
  Timer,
  Zap,
  Clock,
  Users,
  Calendar,
  Shield,
  Eye,
  BarChart3,
  Sparkles,
  Loader2
} from "lucide-react";
import axios from "axios";

const LANGUAGE_MAP = {
  JavaScript: "javascript",
  Python: "python",
  Java: "java",
  "C++": "cpp",
};

const CODE_TEMPLATES = {
  JavaScript: `function solve(input) {\n  // Write your solution here\n  return 0;\n}`,
  Python: `def solve(input_data):\n    # Write your solution here\n    return 0`,
  Java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}`,
  "C++": `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`,
};

const ContestSolve = () => {
  const { contestId, problemId } = useParams();
  const { authFetch } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); // Get theme from context
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState("🚀 Contest Arena Ready - Write your solution and test it!");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [code, setCode] = useState(CODE_TEMPLATES.JavaScript);
  const [showConsole, setShowConsole] = useState(true);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("problem");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00", ended: false });
  const [testResults, setTestResults] = useState([]);
  const [fontSize, setFontSize] = useState(14);

  const editorRef = useRef(null);
  const consoleRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contestRes, problemRes] = await Promise.all([
          authFetch.get(`/contest/${contestId}`),
          authFetch.get(`/problems/practice/${problemId}`)
        ]);
        setContest(contestRes.data);
        setProblem(problemRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [contestId, problemId]);

  useEffect(() => {
    if (!contest || contest.status !== "running") return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(contest.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ h: "00", m: "00", s: "00", ended: true });
        return;
      }

      setTimeLeft({
        h: String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0"),
        m: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0"),
        s: String(Math.floor((diff / 1000) % 60)).padStart(2, "0"),
        ended: false
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const runCode = async () => {
    setConsoleOutput("🧪 Running tests...\n");
    try {
      const res = await authFetch.post(`/problems/run`, {
        problemId,
        code,
        language: selectedLanguage,
      });
      
      let out = "🧪 Test Results:\n";
      const results = res.data.results || [];
      setTestResults(results);
      
      if (results.length === 0) {
        out += "No test results returned. Check your code syntax.\n";
      } else {
        results.forEach((t, i) => {
          if (t.passed) {
            out += `✅ Test Case ${i + 1}: PASSED\n`;
          } else {
            out += `❌ Test Case ${i + 1}: FAILED\n`;
            out += `   Expected: ${t.expected || "N/A"}\n`;
            out += `   Got: ${t.output || "N/A"}\n`;
            if (t.error) out += `   Error: ${t.error}\n`;
          }
        });

        const passed = results.filter((t) => t.passed).length;
        const total = results.length;
        out += `\n📊 ${passed}/${total} tests passed`;

        if (passed === total) {
          out += " 🎉 All tests passed! Ready to submit.";
        }
      }

      setConsoleOutput(out);
    } catch (err) {
      setConsoleOutput(`❌ Error: ${err?.response?.data?.message || "Execution failed"}`);
    }
  };

  const submitSolution = async () => {
    if (timeLeft.ended) {
      setConsoleOutput("❌ Contest has ended. Submissions are closed.");
      return;
    }

    setConsoleOutput("🚀 Submitting to judge...\n");
    try {
      const res = await authFetch.post(`/contest/${contestId}/submit`, {
        problemId,
        code,
        language: selectedLanguage,
      });

      let out = "🏆 Submission Results:\n";
      
      if (res.data.success || res.data.verdict === "AC") {
        out += "✅ ACCEPTED!\n";
        out += "🎉 Congratulations! All test cases passed.\n";
        setIsSubmitted(true);
        
        setTimeout(() => {
          setConsoleOutput(prev => prev + "\n✨ Great job! Your solution has been recorded.");
        }, 500);
      } else {
        out += "❌ WRONG ANSWER\n";
        out += "Some test cases failed. Review your solution and try again.\n";
        
        if (res.data.results) {
          out += "\nFailed test cases:\n";
          res.data.results.forEach((t, i) => {
            if (!t.passed) {
              out += `   Test ${i + 1}: Expected ${t.expected}, Got ${t.output}\n`;
            }
          });
        }
      }

      setConsoleOutput(out);
    } catch (err) {
      setConsoleOutput(`❌ Submission failed: ${err?.response?.data?.message || "Unknown error"}`);
    }
  };

  const toggleFullscreen = () => {
    if (!isEditorFullscreen) {
      containerRef.current?.requestFullscreen();
      setIsEditorFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsEditorFullscreen(false);
    }
  };

  const onEditorMount = (editor) => {
    editorRef.current = editor;
    
    editor.onKeyDown((e) => {
      // Ctrl/Cmd + Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.code === "Enter") {
        e.preventDefault();
        runCode();
      }
      
      // Ctrl/Cmd + S to submit
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
        e.preventDefault();
        submitSolution();
      }
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    if (window.confirm("Reset code to template?")) {
      setCode(CODE_TEMPLATES[selectedLanguage]);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-amber-900/20' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-amber-900/20' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gradient-to-br from-gray-200 to-gray-300'} flex items-center justify-center`}>
            <AlertTriangle size={24} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Problem not found
          </h3>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            This problem doesn't exist or you don't have access.
          </p>
          <button
            onClick={() => navigate(`/contest/${contestId}`)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transform hover:-translate-y-1 transition-all duration-300"
          >
            Back to Contest
          </button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
    switch (difficulty.toLowerCase()) {
      case 'easy': return theme === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'medium': return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
      case 'hard': return theme === 'dark' ? 'text-red-400' : 'text-red-600';
      default: return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/80'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      {/* Header */}
      <div className={`mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/80'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/contest/${contestId}`)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <ArrowLeft size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {problem.title}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Target size={14} />
                    <span className={`text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      Contest Mode
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <Timer size={20} className="text-amber-500" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {[timeLeft.h, timeLeft.m, timeLeft.s].map((unit, i) => (
                        <div key={i} className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono font-bold ${
                            timeLeft.ended 
                              ? theme === 'dark' 
                                ? 'bg-gray-800 text-gray-400' 
                                : 'bg-gray-200 text-gray-600'
                              : 'bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-lg'
                          }`}>
                            {unit}
                          </div>
                          {i < 2 && <span className="text-lg font-bold px-0.5 text-amber-500">:</span>}
                        </div>
                      ))}
                    </div>
                    <div className={`text-xs mt-1 ${timeLeft.ended ? 'text-red-400' : 'text-amber-500'}`}>
                      {timeLeft.ended ? 'CONTEST ENDED' : 'TIME REMAINING'}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/contest/${contestId}/scoreboard`)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
              >
                <Trophy size={16} className="inline mr-2" />
                Scoreboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-6 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Problem */}
          <div className="lg:w-2/5 flex flex-col">
            <div className={`rounded-2xl shadow-xl border overflow-hidden flex-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {/* Problem Tabs */}
              <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setActiveTab("problem")}
                  className={`flex-1 px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "problem" ? "border-amber-500 text-amber-600 dark:text-amber-400" : theme === 'dark' ? "border-transparent text-gray-400 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  PROBLEM
                </button>
                <button
                  onClick={() => setActiveTab("samples")}
                  className={`flex-1 px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "samples" ? "border-amber-500 text-amber-600 dark:text-amber-400" : theme === 'dark' ? "border-transparent text-gray-400 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  SAMPLES
                </button>
              </div>

              {/* Problem Content */}
              <div className={`${activeTab === "problem" ? "block" : "hidden"} p-6 overflow-y-auto max-h-[calc(100vh-200px)]`}>
                <div className={`prose ${theme === 'dark' ? 'prose-invert' : 'prose-gray'} max-w-none`}>
                  {/* Description */}
                  <section className="mb-8">
                    <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Hash size={18} className="text-amber-500" />
                      Description
                    </h3>
                    <div className={`rounded-lg p-4 border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <ReactMarkdown>
                          {problem.description || "No description available."}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </section>

                  {/* I/O Format */}
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    <section>
                      <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <ChevronRight size={18} className="text-green-500" />
                        Input Format
                      </h3>
                      <div className={`rounded-lg p-4 border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          <ReactMarkdown>
                            {problem.input || "Standard input"}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <ChevronLeft size={18} className="text-blue-500" />
                        Output Format
                      </h3>
                      <div className={`rounded-lg p-4 border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          <ReactMarkdown>
                            {problem.output || "Standard output"}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Constraints */}
                  <section className="mb-8">
                    <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AlertTriangle size={18} className="text-yellow-500" />
                      Constraints
                    </h3>
                    <div className={`rounded-lg p-4 border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <ReactMarkdown>
                          {problem.constraints || "No specific constraints."}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Samples Content */}
              <div className={`${activeTab === "samples" ? "block" : "hidden"} p-6 overflow-y-auto max-h-[calc(100vh-200px)]`}>
                <div className="space-y-6">
                  {problem.testCases?.slice(0, 2).map((test, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className={`px-4 py-2 text-sm font-semibold ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                        Sample Test Case {index + 1}
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <div className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Input
                          </div>
                          <pre className={`p-3 rounded text-sm overflow-x-auto ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-200 text-gray-900'}`}>
                            {test.input}
                          </pre>
                        </div>
                        <div>
                          <div className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Expected Output
                          </div>
                          <pre className={`p-3 rounded text-sm overflow-x-auto ${theme === 'dark' ? 'bg-gray-900 text-green-300' : 'bg-gray-200 text-green-900'}`}>
                            {test.output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Editor */}
          <div className="lg:w-3/5 flex flex-col">
            <div className={`rounded-2xl shadow-xl border overflow-hidden flex-1 flex flex-col ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {/* Editor Header */}
              <div className={`p-4 border-b ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        setCode(CODE_TEMPLATES[e.target.value]);
                      }}
                      className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="JavaScript">JavaScript</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                    </select>

                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={copyCode}
                        className={`flex items-center gap-1 relative ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <Copy size={14} />
                        {copied && (
                          <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-green-900 text-green-400' : 'bg-green-500 text-white'}`}>
                            Copied!
                          </div>
                        )}
                      </button>
                      <button
                        onClick={resetCode}
                        className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        {isEditorFullscreen ? (
                          <Minimize2 size={14} />
                        ) : (
                          <Maximize2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded ${
                      isSubmitted
                        ? theme === 'dark' 
                          ? "bg-green-900/30 text-green-400" 
                          : "bg-green-100 text-green-700"
                        : timeLeft.ended
                        ? theme === 'dark'
                          ? "bg-gray-800 text-gray-400"
                          : "bg-gray-100 text-gray-600"
                        : theme === 'dark'
                        ? "bg-amber-900/30 text-amber-400"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {isSubmitted ? "✅ Solved" : timeLeft.ended ? "⌛ Ended" : "✏️ Working"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  language={LANGUAGE_MAP[selectedLanguage]}
                  value={code}
                  onChange={(v) => !isSubmitted && setCode(v || "")}
                  onMount={onEditorMount}
                  options={{
                    readOnly: isSubmitted || timeLeft.ended,
                    fontSize,
                    automaticLayout: true,
                    minimap: { enabled: true },
                    tabSize: 2,
                    autoIndent: "full",
                    formatOnType: true,
                    formatOnPaste: true,
                    wordWrap: "on",
                    lineNumbers: "on",
                    glyphMargin: true,
                    folding: true,
                    lineDecorationsWidth: 5,
                    lineNumbersMinChars: 3,
                    scrollBeyondLastLine: false,
                    renderLineHighlight: "all",
                    cursorBlinking: "smooth",
                    cursorStyle: "line",
                    cursorWidth: 2,
                  }}
                />
              </div>

              {/* Console */}
              <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
                <div className={`px-4 py-2 flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-amber-600 dark:text-amber-500" />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Console
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowConsole(!showConsole)}
                      className={`p-1 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {showConsole ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronUp size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => setConsoleOutput("")}
                      className={`p-1 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {showConsole && (
                  <div
                    ref={consoleRef}
                    className={`flex-1 max-h-48 overflow-y-auto p-4 font-mono text-sm ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-200 text-gray-900'}`}
                  >
                    <pre className={`whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-200 text-gray-900'}`}>
                      {consoleOutput}
                    </pre>
                  </div>
                )}

                {/* Action Buttons */}
                <div className={`p-4 grid grid-cols-2 gap-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <button
                    onClick={runCode}
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    <Play size={18} />
                    Run Tests (Ctrl+Enter)
                  </button>
                  <button
                    onClick={submitSolution}
                    disabled={timeLeft.ended}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all duration-300 ${
                      timeLeft.ended
                        ? theme === 'dark' 
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:shadow-lg hover:shadow-green-500/25 hover:scale-[1.02]"
                    }`}
                  >
                    <CheckCircle size={18} />
                    {timeLeft.ended ? "Contest Ended" : "Submit (Ctrl+S)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestSolve;