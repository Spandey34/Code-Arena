import React, { useState, useContext, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../context/AuthContext";
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
  Timer // Added Timer icon
} from "lucide-react";
import axios from "axios";

const LANGUAGE_MAP = {
  JavaScript: "javascript",
  Python: "python",
  Java: "java",
  "C++": "cpp",
};

const CODE_TEMPLATES = {
  JavaScript: `function solve(input) {\n  return 0;\n}`,
  Python: `def solve(input_data):\n    return 0`,
  Java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n    }\n}`,
  "C++": `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    return 0;\n}`,
};

const ContestSolve = () => {
  const { contestId, problemId } = useParams();
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [contestEnded, setContestEnded] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("Contest Console Ready 🚀");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [code, setCode] = useState(CODE_TEMPLATES.JavaScript);
  const [showConsole, setShowConsole] = useState(true);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("problem");
  const [copied, setCopied] = useState(false);
  
  // --- NEW STATE FOR TIMER ---
  const [displayTime, setDisplayTime] = useState("");

  const editorRef = useRef(null);
  const consoleRef = useRef(null);
  const containerRef = useRef(null);

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/practice/${problemId}`);
        setProblem(res.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    const fetchContest = async () => {
      try {
        const res = await api.get(`/contest/${contestId}`);
        // Assuming your backend returns startTime and endTime
        const endTime = new Date(res.data.endTime).getTime();
        
        // --- TIMER LOGIC ---
        const timerInterval = setInterval(() => {
          const now = new Date().getTime();
          const distance = endTime - now;

          if (distance < 0) {
            clearInterval(timerInterval);
            setContestEnded(true);
            alert("Contest has ended! Redirecting...");
            navigate("/contests"); // Redirect to contest history/list page
            return;
          }

          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setDisplayTime(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        if (res.data.status !== "running") {
          setContestEnded(true);
        }

        return () => clearInterval(timerInterval);
      } catch (e) {
        console.error("Timer/Contest fetch failed", e);
      }
    };

    fetchContest();
    fetchProblem();
  }, [contestId, problemId, navigate]);

  const runCode = async () => {
    setConsoleOutput("🧪 Running local tests...\n");
    try {
      const res = await api.post(`/problems/run`, {
        problemId,
        code,
        language: selectedLanguage,
      });
      let out = "🧪 Test Results:\n";
      const results = res.data.results || [];
      
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
      setConsoleOutput("❌ Execution failed");
    }
  };

  const submitSolution = async () => {
    setConsoleOutput("🚀 Submitting to Judge...\n");
    try {
      const res = await api.post(`/contest/${contestId}/submit`, {
        problemId,
        code,
        language: selectedLanguage,
      });
      setConsoleOutput(`🏆 Verdict: ${res.data.verdict}`);
      if (res.data.verdict === "AC") setIsSubmitted(true);
    } catch (err) {
      setConsoleOutput("❌ Submission failed");
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

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* HEADER */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/contest/${contestId}`)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              {problem.title} 
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">Contest Mode</span>
            </h1>
          </div>
        </div>
        
        {/* --- TIMER DISPLAY IN HEADER --- */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-1.5 rounded-full border border-gray-700">
            <Timer size={16} className="text-amber-500" />
            <span className="text-sm font-mono font-bold text-amber-500">{displayTime || "Calculating..."}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/contest/${contestId}/scoreboard`)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold transition-all">
              <Trophy size={16} /> Scoreboard
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* LEFT PANEL: PROBLEM & SAMPLES */}
        <div className={`lg:w-2/5 flex flex-col border-r border-gray-800 bg-gray-900 ${activeTab !== 'problem' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex border-b border-gray-800">
                <button onClick={() => setActiveTab("problem")} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "problem" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500"}`}>PROBLEM</button>
                <button onClick={() => setActiveTab("samples")} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "samples" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500"}`}>SAMPLES</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === "problem" ? (
                    <div className="prose prose-invert max-w-none">
                        <section className="mb-6">
                            <h3 className="flex items-center gap-2 text-indigo-400 text-sm font-bold mb-2 uppercase tracking-wider"><Hash size={16}/> Description</h3>
                            <ReactMarkdown>{problem.description}</ReactMarkdown>
                        </section>
                        
                        <section className="mb-6">
                            <h3 className="flex items-center gap-2 text-indigo-400 text-sm font-bold mb-2 uppercase tracking-wider"><ChevronRight size={16}/> Input Format</h3>
                            <ReactMarkdown>{problem.input || "Standard Input"}</ReactMarkdown>
                        </section>

                        <section className="mb-6">
                            <h3 className="flex items-center gap-2 text-indigo-400 text-sm font-bold mb-2 uppercase tracking-wider"><ChevronLeft size={16}/> Output Format</h3>
                            <ReactMarkdown>{problem.output || "Standard Output"}</ReactMarkdown>
                        </section>

                        <section className="mb-6">
                            <h3 className="flex items-center gap-2 text-indigo-400 text-sm font-bold mb-2 uppercase tracking-wider"><AlertTriangle size={16}/> Constraints</h3>
                            <ReactMarkdown>{problem.constraints || "None provided"}</ReactMarkdown>
                        </section>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {problem.testCases?.map((test, idx) => (
                            <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                                <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Sample Case {idx + 1}</div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Input</p>
                                        <pre className="bg-gray-950 p-3 rounded-lg text-sm font-mono text-indigo-300">{test.input}</pre>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Output</p>
                                        <pre className="bg-gray-950 p-3 rounded-lg text-sm font-mono text-emerald-400">{test.output}</pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT PANEL: EDITOR & CONSOLE */}
        <div className={`lg:w-3/5 flex flex-col bg-gray-950 ${activeTab === 'problem' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="bg-gray-900 p-3 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <select 
                        value={selectedLanguage} 
                        onChange={(e) => { setSelectedLanguage(e.target.value); setCode(CODE_TEMPLATES[e.target.value]); }}
                        className="bg-gray-800 border border-gray-700 text-sm rounded-md px-3 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        {Object.keys(LANGUAGE_MAP).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button onClick={() => {navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false), 2000)}} className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
                        <Copy size={16} className={copied ? "text-emerald-400" : "text-gray-400"} />
                    </button>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400">
                        {isEditorFullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
                    </button>
                </div>
                <div className="text-xs font-mono text-gray-500">
                    {isSubmitted ? "✅ ACCEPTED" : "UNSOLVED"}
                </div>
            </div>

            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language={LANGUAGE_MAP[selectedLanguage]}
                    value={code}
                    onChange={(v) => !isSubmitted && setCode(v || "")}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: isSubmitted
                    }}
                />
            </div>

            {/* CONSOLE */}
            <div className="border-t border-gray-800 bg-gray-900">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Terminal size={14}/> Console
                    </div>
                    <button onClick={() => setShowConsole(!showConsole)} className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400">
                        {showConsole ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}
                    </button>
                </div>
                {showConsole && (
                    <div ref={consoleRef} className="h-32 bg-gray-950 p-4 font-mono text-xs text-gray-300 overflow-y-auto overflow-x-hidden">
                        <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
                    </div>
                )}
            </div>

            {/* ACTION FOOTER */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 grid grid-cols-2 gap-4">
                <button onClick={runCode} className="flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-700">
                    <Play size={16}/> Run Samples
                </button>
                <button 
                    onClick={submitSolution} 
                    disabled={contestEnded} 
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all shadow-lg ${contestEnded ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"}`}
                >
                    <CheckCircle size={16}/> {contestEnded ? "Contest Over" : "Submit to Judge"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContestSolve;