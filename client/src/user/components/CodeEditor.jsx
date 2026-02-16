import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { LANGUAGES } from '../../shared/utils/constants'
import EditorialPanel from '../pages/Editorials/EditorialPanel'; 
import { 
  Play, Terminal, CheckCircle2, AlertTriangle, 
  Code2, Settings, List, Send, X, Lock, Eye, BookOpen
} from 'lucide-react';

const GlobalStyles = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #1e1e1e; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #424242; border-radius: 5px; border: 2px solid #1e1e1e; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f4f4f; }
  `}</style>
);

const SubmissionModal = ({ submission, onClose }) => {
    if (!submission) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#1e1e1e] border border-[#333] rounded-lg w-[800px] h-[600px] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#252526]">
                    <div>
                        <h2 className="text-white font-medium text-lg">Submission Details</h2>
                        <span className="text-xs text-gray-400">ID: {submission._id}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-4 bg-[#252526] border-b border-[#333] flex gap-6 text-sm">
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Verdict</span>
                        <span className={`font-medium ${submission.verdict === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>{submission.verdict}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Language</span>
                        <span className="text-blue-400 font-mono">{submission.language}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs mb-1">Time</span>
                        <span className="text-gray-300">{new Date(submission.createdAt).toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden p-0 relative">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={submission.language === 'c++' ? 'cpp' : submission.language.toLowerCase()}
                        value={submission.code}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            padding: { top: 15 },
                            fontFamily: "'Fira Code', monospace"
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const CodeEditor = ({ 
  problem, 
  initialCode, 
  userLanguage,
  setUserLanguage,
  onRun, 
  onSubmit, 
  isProcessing, 
  testResults, 
  consoleOutput,
  previousSubmissions = [],
  isMatch = false,
  isContest = false
}) => {
  const [leftWidth, setLeftWidth] = useState(40); 
  const [bottomHeight, setBottomHeight] = useState(30); 
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingBottom, setIsDraggingBottom] = useState(false);

  const [code, setCode] = useState(initialCode || '// Write your code here...');
  const [activeTab, setActiveTab] = useState('testcases');
  const [leftTab, setLeftTab] = useState('description'); 
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    if (testResults || consoleOutput) {
        setActiveTab('testcases');
    }
  }, [testResults, consoleOutput]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      if (isDraggingLeft) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setLeftWidth(Math.min(Math.max(newWidth, 20), 70));
      }
      if (isDraggingBottom) {
        const newHeight = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
        setBottomHeight(Math.min(Math.max(newHeight, 10), 85)); 
      }
    };
    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingBottom(false);
    };
    if (isDraggingLeft || isDraggingBottom) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDraggingLeft ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isDraggingLeft, isDraggingBottom]);

  if (!problem) return <div className="h-full bg-[#1e1e1e] flex items-center justify-center text-gray-500">Loading Problem...</div>;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden border border-[#333] rounded-lg">
      <GlobalStyles />
      {selectedSubmission && <SubmissionModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />}
      
      {/* Editor Toolbar */}
      <div className="h-10 bg-[#252526] border-b border-[#333] flex items-center justify-between px-3 select-none flex-shrink-0 z-20">
        <div className="flex items-center space-x-2">
            <div className="bg-[#333] p-1 rounded">
                <Code2 size={16} className="text-blue-400" />
            </div>
            <span className="font-semibold text-gray-300 text-sm tracking-tight">Code Editor</span>
        </div>
        
        <div className="flex items-center bg-[#333] rounded px-1 py-0.5">
             <button 
                onClick={() => onRun(code, userLanguage)}
                disabled={isProcessing}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs rounded transition-all
                  ${isProcessing ? 'text-gray-400 cursor-not-allowed' : 'text-green-400 hover:bg-[#3e3e42]'}
                `}
             >
                <Play size={12} />
                <span>Run</span>
             </button>
             <div className="w-px h-3 bg-[#444] mx-1"></div>
             <button 
                onClick={() => onSubmit(code, userLanguage)}
                disabled={isProcessing}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs rounded transition-all
                  ${isProcessing ? 'text-gray-400 cursor-not-allowed' : 'text-blue-400 hover:bg-[#3e3e42]'}
                `}
             >
                <Send size={12} />
                <span>Submit</span>
             </button>
        </div>

        <div className="flex items-center space-x-3">
             <button className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white"><Settings size={14} /></button>
        </div>
      </div>

      {/* Main Workspace Splitter */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: Description/Submissions/Editorials */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col min-w-[200px] bg-[#1e1e1e]">
            {/* Left Tabs */}
            <div className="flex items-center bg-[#252526] border-b border-[#333] flex-shrink-0 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setLeftTab('description')}
                    className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${leftTab === 'description' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    <List size={13} /> Problem
                </button>
                
                {/* Hide Submissions/Editorials during Match/Contest */}
                {!isMatch && (
                    <>
                        <button 
                            onClick={() => setLeftTab('submissions')}
                            className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${leftTab === 'submissions' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                           <Eye size={13} /> Submissions
                        </button>
                    </>
                )}

                {!isMatch && !isContest && (
                    <>
                        
                        <button 
                            onClick={() => setLeftTab('editorials')}
                            className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${leftTab === 'editorials' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                           <BookOpen size={13} /> Editorials
                        </button>
                    </>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {/* 1. DESCRIPTION TAB */}
                {leftTab === 'description' && (
                    <div className="p-5">
                        <h1 className="text-lg font-bold text-white mb-2">{problem.title}</h1>
                        <div className="flex items-center space-x-2 mb-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium
                                ${problem.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 
                                  problem.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50' : 
                                  'bg-red-900/30 text-red-400 border-red-900/50'}
                            `}>
                                {problem.difficulty || 'Medium'}
                            </span>
                        </div>

                        <div className="text-sm leading-relaxed text-gray-300 space-y-4">
                            <p className="whitespace-pre-line">{problem.description}</p>
                            
                            {problem.inputFormat && (
                                <div><h3 className="text-white font-medium mb-1 text-xs uppercase tracking-wider">Input Format</h3><p className="text-gray-400">{problem.inputFormat}</p></div>
                            )}
                             {problem.outputFormat && (
                                <div><h3 className="text-white font-medium mb-1 text-xs uppercase tracking-wider">Output Format</h3><p className="text-gray-400">{problem.outputFormat}</p></div>
                            )}

                            {/* Examples */}
                            {problem.examples && problem.examples.map((ex, idx) => (
                                <div key={idx} className="mt-4">
                                    <h3 className="text-white font-medium mb-2 text-xs uppercase">Example {idx + 1}</h3>
                                    <div className="bg-[#2d2d2d] rounded p-3 border-l-2 border-[#444] font-mono text-xs">
                                        <div className="mb-2">
                                            <span className="text-gray-500 block text-[10px] uppercase">Input</span>
                                            <span className="text-gray-300">{ex.input}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-[10px] uppercase">Output</span>
                                            <span className="text-gray-300">{ex.output}</span>
                                        </div>
                                        {ex.explanation && <p className="mt-2 text-gray-400 border-t border-[#444] pt-2"><span className="text-gray-500">Exp:</span> {ex.explanation}</p>}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-6">
                                <h3 className="text-white font-medium mb-2 text-xs uppercase tracking-wider">Constraints</h3>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400 font-mono">
                                    {problem.constraints && problem.constraints.split('\n').map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SUBMISSIONS TAB */}
                {!isMatch && leftTab === 'submissions' && (
                    <div className="p-4 space-y-2">
                        {previousSubmissions.length === 0 ? (
                            <div className="text-gray-500 text-xs text-center mt-10">No submissions yet.</div>
                        ) : (
                            previousSubmissions.map((sub) => (
                                <div 
                                    key={sub._id} 
                                    onClick={() => setSelectedSubmission(sub)}
                                    className="bg-[#262626] border border-[#333] hover:border-[#555] p-3 rounded cursor-pointer transition-all flex items-center justify-between group"
                                >
                                    <div>
                                        <div className={`text-xs font-bold ${sub.verdict === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>
                                            {sub.verdict}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1 flex gap-2">
                                            <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                                            <span className="text-blue-400">{sub.language}</span>
                                        </div>
                                    </div>
                                    <Eye size={14} className="text-gray-500 group-hover:text-white" />
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 3. EDITORIALS TAB */}
                {!isMatch && !isContest && leftTab === 'editorials' && (
                    <div className="h-full">
                        <EditorialPanel problemId={problem._id} />
                    </div>
                )}
            </div>
        </div>

        {/* Resizer */}
        <div onMouseDown={(e) => { e.preventDefault(); setIsDraggingLeft(true); }} className={`w-1 hover:bg-blue-600 cursor-col-resize z-30 flex-shrink-0 ${isDraggingLeft ? 'bg-blue-600' : 'bg-[#1e1e1e] border-l border-[#333]'}`} />

        {/* RIGHT PANEL: Editor + Terminal */}
        <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col h-full min-w-[300px]">
            {/* Top: Code Editor */}
            <div style={{ height: `calc(${100 - bottomHeight}% - 4px)` }} className="flex flex-col min-h-[100px] relative">
                <div className="h-8 bg-[#252526] border-b border-[#333] flex items-center justify-between px-2 flex-shrink-0">
                    <select 
                        value={userLanguage} 
                        onChange={(e) => setUserLanguage(e.target.value)} 
                        className="bg-[#252526] text-xs text-gray-300 focus:outline-none cursor-pointer hover:text-white border border-transparent hover:border-[#444] rounded px-2 py-0.5"
                    >
                        {LANGUAGES.map((data) => (
                          <option key={data.value} value={data.value}>{data.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex-1 relative overflow-hidden">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={userLanguage === 'C++' ? 'cpp' : userLanguage.toLowerCase()}
                        value={code}
                        onChange={(val) => setCode(val)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 10 },
                            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                        }}
                    />
                </div>
            </div>

            {/* Horizontal Resizer */}
            <div onMouseDown={(e) => { e.preventDefault(); setIsDraggingBottom(true); }} className={`h-1 hover:bg-blue-600 cursor-row-resize z-30 flex-shrink-0 ${isDraggingBottom ? 'bg-blue-600' : 'bg-[#1e1e1e] border-t border-[#333]'}`} />

            {/* Bottom Pane (Terminal/Test Results) */}
            <div style={{ height: `${bottomHeight}%` }} className="bg-[#1e1e1e] flex flex-col min-h-[40px]">
                <div className="flex items-center bg-[#252526] border-b border-[#333] flex-shrink-0">
                    <button onClick={() => setActiveTab('testcases')} className={`px-3 py-1.5 text-xs flex items-center gap-2 border-t-2 ${activeTab === 'testcases' ? 'border-blue-500 bg-[#1e1e1e] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                        <CheckCircle2 size={12} /> Test Results
                    </button>
                    <button onClick={() => setActiveTab('output')} className={`px-3 py-1.5 text-xs flex items-center gap-2 border-t-2 ${activeTab === 'output' ? 'border-blue-500 bg-[#1e1e1e] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                        <Terminal size={12} /> Console
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* Empty State */}
                    {!isProcessing && !testResults && !consoleOutput && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                            <span className="text-xs">Run your code to see results</span>
                        </div>
                    )}
                    
                    {/* Loading State */}
                    {isProcessing && (
                        <div className="h-full flex items-center justify-center space-x-2 text-gray-500">
                             <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                             <span className="text-xs">Processing...</span>
                        </div>
                    )}

                    {/* Test Results */}
                    {!isProcessing && activeTab === 'testcases' && testResults && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             {testResults.rawError && (
                                <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                                    <div className="flex items-center gap-2 text-red-400 font-medium mb-1 text-sm">
                                        <AlertTriangle size={14} />
                                        <span>Compilation / Runtime Error</span>
                                    </div>
                                    <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                        {testResults.rawError}
                                    </pre>
                                </div>
                             )}

                             {!testResults.rawError && (
                                <>
                                    <div className={`text-sm font-bold ${testResults.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {testResults.summary}
                                    </div>
                                    
                                    {testResults.cases && testResults.cases.length > 0 && (
                                         <div className="flex flex-wrap gap-2">
                                            {testResults.cases.map((c, idx) => (
                                                <span key={idx} className={`px-2 py-0.5 rounded text-[10px] border ${c.status === 'Passed' ? 'border-green-900 bg-green-900/10 text-green-400' : 'border-red-900 bg-red-900/10 text-red-400'}`}>
                                                    Case {idx + 1}
                                                </span>
                                            ))}
                                         </div>
                                    )}
                                    
                                    {/* Detail View for Cases */}
                                    {testResults.cases && testResults.cases.length > 0 && (
                                        <div className="bg-[#262626] rounded border border-[#333] p-3 text-xs font-mono space-y-2">
                                             {(() => {
                                                 let targetIndex = testResults.cases.findIndex(c => c.status !== 'Passed');
                                                 if (targetIndex === -1) targetIndex = 0;
                                                 const targetCase = testResults.cases[targetIndex];
                                                 
                                                 // Match/Contest: Hide details for cases > 3
                                                 if (targetIndex >= 3) {
                                                     return (
                                                         <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                                                             <Lock size={16} className="mb-1 opacity-50" />
                                                             <span className="font-medium">Hidden Test Case</span>
                                                             <span className="text-[10px] mt-0.5 opacity-70">
                                                                 {targetCase.status === 'Passed' ? 'Passed successfully.' : 'Test failed. Details hidden.'}
                                                             </span>
                                                         </div>
                                                     );
                                                 }
                                                 return (
                                                      <>
                                                          <div className="text-gray-500 mb-2 border-b border-[#333] pb-1">
                                                             Details for Case {targetIndex + 1} ({targetCase.status})
                                                          </div>
                                                          <div>
                                                              <div className="text-gray-500 text-[10px] uppercase">Input</div>
                                                              <div className="text-gray-300 bg-[#333] p-1.5 rounded mt-0.5">{targetCase.input}</div>
                                                          </div>
                                                          <div>
                                                              <div className="text-gray-500 text-[10px] uppercase">Output</div>
                                                              <div className={`${targetCase.status === 'Passed' ? 'text-gray-300' : 'text-red-400'} bg-[#333] p-1.5 rounded mt-0.5`}>{targetCase.actual || targetCase.output}</div>
                                                          </div>
                                                          <div>
                                                              <div className="text-gray-500 text-[10px] uppercase">Expected</div>
                                                              <div className="text-green-400 bg-[#333] p-1.5 rounded mt-0.5">{targetCase.expected}</div>
                                                          </div>
                                                      </>
                                                 );
                                             })()}
                                        </div>
                                    )}
                                </>
                             )}
                        </div>
                    )}

                    {/* Console Output */}
                    {!isProcessing && activeTab === 'output' && consoleOutput && (
                        <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                            {consoleOutput}
                        </pre>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="h-6 bg-[#252526] border-t border-[#333] flex items-center justify-between px-3 text-[10px] text-gray-500 select-none flex-shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <span>Ready</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>Ln 1, Col 1</span>
            <span>UTF-8</span>
            <span>{userLanguage}</span>
          </div>
      </div>
    </div>
  );
};

export default CodeEditor;