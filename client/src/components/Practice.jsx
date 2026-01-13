import React, { useState, useContext, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Code,
  Play,
  CheckCircle,
  Terminal,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
  Settings,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Timer,
  Cpu,
  Hash,
  BookOpen,
  Target,
  BarChart3,
  Award,
  Clock,
  ArrowLeft,
  Trophy,
  ChevronDown,
  ChevronUp
} from "lucide-react";

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
  
  return 0;
}

// Test the function
const testInput = [0, 1, 0, 1, 1, 1];
console.log(solve(testInput));`,

  Python: `def solve(input_data):
    # Write your solution here
    # Return the answer
    
    # Example:
    # Given a binary array, find longest subarray with equal 0s and 1s
    # Return length of that subarray
    
    return 0

# Test the function
test_input = [0, 1, 0, 1, 1, 1]
print(solve(test_input))`,

  Java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
        Scanner sc = new Scanner(System.in);
        
        // Example test case
        int[] testInput = {0, 1, 0, 1, 1, 1};
        System.out.println(solve(testInput));
    }
    
    public static int solve(int[] arr) {
        // Implement your solution here
        // Return the answer
        
        return 0;
    }
}`,

  "C++": `#include <bits/stdc++.h>
using namespace std;

int solve(vector<int>& arr) {
    // Write your solution here
    // Return the answer
    
    return 0;
}

int main() {
    // Example test case
    vector<int> testInput = {0, 1, 0, 1, 1, 1};
    cout << solve(testInput) << endl;
    return 0;
}`,
};

const Practice = () => {
  const { problemId } = useParams();
  const { user, authFetch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState(
    "🚀 Practice Arena Ready - Write your solution and test it!"
  );
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [code, setCode] = useState(CODE_TEMPLATES.JavaScript);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [showTestCases, setShowTestCases] = useState(true);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState("problem");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successRate, setSuccessRate] = useState(0);
  const [difficultyColor, setDifficultyColor] = useState("text-green-500");

  const editorRef = useRef(null);
  const consoleRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await authFetch.get(`/problems/practice/${problemId}`);
        const problemData = res.data;
        setProblem(problemData);

        // Set difficulty color
        const rating = problemData.rating || 1200;
        if (rating >= 1800) setDifficultyColor("text-red-500");
        else if (rating >= 1600) setDifficultyColor("text-orange-500");
        else if (rating >= 1400) setDifficultyColor("text-yellow-500");
        else if (rating >= 1200) setDifficultyColor("text-green-500");
        else setDifficultyColor("text-blue-500");

        // Calculate success rate (mock - you can fetch real data)
        setSuccessRate(Math.floor(Math.random() * 40) + 60); // 60-100%

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch problem", error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [authFetch, problemId]);

  /* ---------------- SCROLL TO BOTTOM ---------------- */
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  /* ---------------- FULLSCREEN HANDLER ---------------- */
  const toggleFullscreen = () => {
    if (!isEditorFullscreen) {
      containerRef.current?.requestFullscreen();
      setIsEditorFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsEditorFullscreen(false);
    }
  };

  /* ---------------- RUN CODE ---------------- */
  const runCode = async () => {
    setConsoleOutput("🧪 Running tests...\n");
    try {
      const res = await authFetch.post("/problems/run", {
        problemId: problemId,
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
      setConsoleOutput(
        `❌ Error: ${err?.response?.data?.message || "Execution failed"}`
      );
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const submitSolution = async () => {
    setConsoleOutput("🚀 Submitting solution...\n");

    try {
      const res = await authFetch.post("/problems/submit", {
        problemId: problemId,
        code,
        language: selectedLanguage,
      });

      let out = "🏆 Submission Results:\n";

      if (res.data.success) {
        out += "✅ ACCEPTED!\n";
        out += "🎉 Congratulations! All test cases passed.\n";
        out += "⭐ Your solution has been recorded.\n";
        setIsSubmitted(true);

        // Show celebration
        setTimeout(() => {
          setConsoleOutput(
            (prev) => prev + "\n✨ Great job! Try another problem!"
          );
        }, 500);
      } else {
        out += "❌ WRONG ANSWER\n";
        out += "Some test cases failed. Review your solution and try again.\n";

        if (res.data.results) {
          out += "\nFailed test cases:\n";
          res.data.results.forEach((t, i) => {
            if (!t.passed) {
              out += `   Test ${i + 1}: Expected ${t.expected}, Got ${
                t.output
              }\n`;
            }
          });
        }
      }

      setConsoleOutput(out);
    } catch (err) {
      setConsoleOutput(
        `❌ Submission failed: ${
          err?.response?.data?.message || "Unknown error"
        }`
      );
    }
  };

  /* ---------------- EDITOR EVENTS ---------------- */
  const onEditorMount = (editor) => {
    editorRef.current = editor;

    // Add custom keybindings
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

  /* ---------------- UTILITY FUNCTIONS ---------------- */
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

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Loading problem...
          </p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Problem Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This problem doesn't exist or you don't have access.
          </p>
          <button
            onClick={() => navigate("/practice")}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/practice")}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft
                  size={20}
                  className="text-gray-700 dark:text-gray-300"
                />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {problem.title}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Target
                      size={14}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <span
                      className={`text-sm font-semibold ${difficultyColor}`}
                    >
                      Rating: {problem.rating || 1200}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3
                      size={14}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {successRate}% Success Rate
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award
                      size={14}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {problem.points || 100} points
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/matchmaking")}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
              >
                Ready for Battle?
              </button>
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BookOpen size={16} />
                <span>Practice Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Problem */}
          <div className="lg:w-2/5 flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
              {/* Problem Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab("problem")}
                  className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                    activeTab === "problem"
                      ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                  }`}
                >
                  <Code size={16} />
                  Problem
                </button>
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                    activeTab === "editor"
                      ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                  }`}
                >
                  <Terminal size={16} />
                  Editor
                </button>
              </div>

              {/* Problem Content */}
              <div
                className={`${
                  activeTab === "problem" ? "block" : "hidden lg:block"
                } p-6 overflow-y-auto max-h-[calc(100vh-200px)]`}
              >
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {/* Description */}
                  <section className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Hash size={18} className="text-amber-500" />
                      Description
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
  <div className="text-gray-700 dark:text-gray-300">
    <ReactMarkdown>{problem.description || "No description available."}</ReactMarkdown>
  </div>
</div>
                  </section>

                  {/* I/O Format */}
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <ChevronRight size={18} className="text-green-500" />
                        Input Format
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
  <div className="text-gray-700 dark:text-gray-300">
    <ReactMarkdown>{problem.input || "Standard input"}</ReactMarkdown>
  </div>
</div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <ChevronLeft size={18} className="text-blue-500" />
                        Output Format
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
  <div className="text-gray-700 dark:text-gray-300">
    <ReactMarkdown>{problem.output || "Standard output"}</ReactMarkdown>
  </div>
</div>
                    </section>
                  </div>

                  {/* Constraints */}
                  <section className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-yellow-500" />
                      Constraints
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
  <div className="text-gray-700 dark:text-gray-300">
    <ReactMarkdown>{problem.constraints || "No specific constraints."}</ReactMarkdown>
  </div>
</div>
                  </section>

                  {/* Test Cases */}
                  {showTestCases &&
                    problem.testCases &&
                    problem.testCases.length > 0 && (
                      <section className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Cpu size={18} className="text-purple-500" />
                            Sample Tests
                          </h3>
                          <button
                            onClick={() => setShowTestCases(!showTestCases)}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showTestCases ? "Hide" : "Show"}
                          </button>
                        </div>
                        {problem.testCases.slice(0, 2).map((test, index) => (
                          <div
                            key={index}
                            className="mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                          >
                            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                              Test Case {index + 1}
                            </div>
                            <div className="p-4">
                              <div className="mb-3">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                  Input
                                </div>
                                <pre className="bg-gray-900 p-3 rounded text-gray-300 text-sm overflow-x-auto">
                                  {test.input}
                                </pre>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                  Expected Output
                                </div>
                                <pre className="bg-gray-900 p-3 rounded text-green-400 text-sm overflow-x-auto">
                                  {test.output}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </section>
                    )}

                  
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Editor */}
          <div className="lg:w-3/5 flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
              {/* Editor Header */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        setCode(CODE_TEMPLATES[e.target.value]);
                      }}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="JavaScript">JavaScript</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                    </select>

                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 relative"
                      >
                        <Copy size={14} />
                        {copied && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Copied!
                          </div>
                        )}
                      </button>
                      <button
                        onClick={resetCode}
                        className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
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
                    <span
                      className={`px-2 py-1 rounded ${
                        isSubmitted
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {isSubmitted ? "✅ Solved" : "✏️ Working"}
                    </span>
                  </div>
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
                  onMount={onEditorMount}
                  options={{
                    readOnly: isSubmitted,
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
              <div className="border-t border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal
                      size={16}
                      className="text-amber-600 dark:text-amber-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Console
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowConsole(!showConsole)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showConsole ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronUp size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => setConsoleOutput("")}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {showConsole && (
                  <div
                    ref={consoleRef}
                    className="flex-1 max-h-48 overflow-y-auto bg-gray-900 p-4 font-mono text-sm"
                  >
                    <pre className="whitespace-pre-wrap text-gray-300">
                      {consoleOutput}
                    </pre>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 grid grid-cols-2 gap-3">
                  <button
                    onClick={runCode}
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    <Play size={18} />
                    Run Tests (Ctrl+Enter)
                  </button>
                  <button
                    onClick={submitSolution}
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/25 hover:scale-[1.02] transition-all duration-300"
                  >
                    <CheckCircle size={18} />
                    Submit Solution (Ctrl+S)
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
