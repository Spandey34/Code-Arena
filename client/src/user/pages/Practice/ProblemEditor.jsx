import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { problemAPI, submissionAPI } from '../../../shared/services/api';
import CodeEditor from '../../components/CodeEditor';
import { VERDICT_COLORS } from '../../../shared/utils/constants';

const ProblemEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeTab, setActiveTab] = useState('problem');
  const [userSubmissions, setUserSubmissions] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProblem();
      fetchSubmissions();
    } else {
      // Create sample problem for editor mode
      setProblem({
        _id: 'new',
        title: 'Custom Problem',
        description: 'Write your own problem or practice with custom test cases.',
        inputFormat: 'Custom input format',
        outputFormat: 'Custom output format',
        constraints: 'No constraints',
        rating: 1200
      });
      setLoading(false);
    }
  }, [id]);

  const fetchProblem = async () => {
    try {
      const response = await problemAPI.getById(id);
      setProblem(response.data.problem);
      
      // Load saved code from localStorage if exists
      const savedCode = localStorage.getItem(`code_${id}_${language}`);
      if (savedCode) {
        setCode(savedCode);
      } else {
        // Default template based on language
        setCode(getDefaultCode(language));
      }
    } catch (error) {
      console.error('Failed to fetch problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!id) return;
    try {
      const response = await problemAPI.getSubmissions(id);
      setUserSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const getDefaultCode = (lang) => {
    switch (lang) {
      case 'JavaScript':
        return `// ${problem?.title || 'Problem Solution'}\nfunction solve(input) {\n    // Write your solution here\n    return input;\n}\n\n// For testing\nconsole.log(solve("test"));`;
      case 'Python':
        return `# ${problem?.title || 'Problem Solution'}\ndef solve(input_str):\n    # Write your solution here\n    return input_str\n\n# For testing\nif __name__ == "__main__":\n    print(solve("test"))`;
      case 'Java':
        return `// ${problem?.title || 'Problem Solution'}\npublic class Solution {\n    public static String solve(String input) {\n        // Write your solution here\n        return input;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(solve("test"));\n    }\n}`;
      case 'C++':
        return `// ${problem?.title || 'Problem Solution'}\n#include <iostream>\n#include <string>\nusing namespace std;\n\nstring solve(string input) {\n    // Write your solution here\n    return input;\n}\n\nint main() {\n    cout << solve("test") << endl;\n    return 0;\n}`;
      default:
        return '// Write your solution here';
    }
  };

  const handleRunCode = async (code, language) => {
    if (!problem) return;
    
    setSubmissionLoading(true);
    try {
      const response = await submissionAPI.run({
        problemId: problem._id,
        code,
        language
      });
      
      setSubmissionResult({
        verdict: 'RUNNING',
        message: 'Code is being executed...'
      });
      
      // In real implementation, you would listen for WebSocket updates
      // For now, simulate a response
      setTimeout(() => {
        setSubmissionResult({
          verdict: 'ACCEPTED',
          message: 'All test cases passed!',
          time: '0.2s',
          memory: '12MB'
        });
      }, 2000);
      
    } catch (error) {
      console.error('Failed to run code:', error);
      setSubmissionResult({
        verdict: 'ERROR',
        message: 'Failed to execute code'
      });
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleSubmitCode = async (code, language) => {
    if (!problem || problem._id === 'new') {
      alert('Cannot submit code for custom problems');
      return;
    }
    
    setSubmissionLoading(true);
    try {
      const response = await submissionAPI.submit({
        problemId: problem._id,
        code,
        language
      });
      
      setSubmissionResult({
        verdict: 'QUEUED',
        message: 'Submission queued for evaluation'
      });
      
      // Save code to localStorage
      localStorage.setItem(`code_${problem._id}_${language}`, code);
      
      // Refresh submissions
      fetchSubmissions();
      
    } catch (error) {
      console.error('Failed to submit code:', error);
      setSubmissionResult({
        verdict: 'ERROR',
        message: 'Submission failed'
      });
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    
    // Save current code for old language
    if (problem && code) {
      localStorage.setItem(`code_${problem._id}_${language}`, code);
    }
    
    // Load saved code for new language or use default
    const savedCode = problem 
      ? localStorage.getItem(`code_${problem._id}_${newLanguage}`)
      : null;
    
    setCode(savedCode || getDefaultCode(newLanguage));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {problem?.title}
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                problem?.rating <= 1200 ? 'bg-green-100 text-green-800' :
                problem?.rating <= 1800 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem?.rating <= 1200 ? 'Easy' : 
                 problem?.rating <= 1800 ? 'Medium' : 'Hard'} ({problem?.rating || 1200})
              </span>
              {problem?._id !== 'new' && (
                <button
                  onClick={() => navigate(`/practice/problem/${problem._id}`)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View Problem Page →
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/practice')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Back to Problems
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem Statement */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('problem')}
                  className={`px-6 py-4 font-medium ${
                    activeTab === 'problem'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  Problem
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-6 py-4 font-medium ${
                    activeTab === 'submissions'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  Submissions ({userSubmissions.length})
                </button>
                <button
                  onClick={() => setActiveTab('custom-tests')}
                  className={`px-6 py-4 font-medium ${
                    activeTab === 'custom-tests'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  Custom Tests
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {activeTab === 'problem' && (
                <div className="prose dark:prose-invert max-w-none">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="whitespace-pre-line mb-6">
                    {problem?.description || 'No problem description available.'}
                  </p>

                  <h2 className="text-xl font-bold mb-4">Input Format</h2>
                  <p className="whitespace-pre-line mb-6">
                    {problem?.inputFormat || 'No input format specified.'}
                  </p>

                  <h2 className="text-xl font-bold mb-4">Output Format</h2>
                  <p className="whitespace-pre-line mb-6">
                    {problem?.outputFormat || 'No output format specified.'}
                  </p>

                  <h2 className="text-xl font-bold mb-4">Constraints</h2>
                  <p className="whitespace-pre-line">
                    {problem?.constraints || 'No constraints specified.'}
                  </p>

                  {problem?.explanation && (
                    <>
                      <h2 className="text-xl font-bold mb-4 mt-6">Explanation</h2>
                      <p className="whitespace-pre-line">{problem.explanation}</p>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div>
                  {userSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">📝</div>
                      <p className="text-gray-500 dark:text-gray-400">
                        No submissions yet
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="py-3 text-left">Time</th>
                            <th className="py-3 text-left">Language</th>
                            <th className="py-3 text-left">Verdict</th>
                            <th className="py-3 text-left">Time</th>
                            <th className="py-3 text-left">Memory</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userSubmissions.map((submission) => (
                            <tr key={submission._id} className="border-b border-gray-200 dark:border-gray-700">
                              <td className="py-3">
                                {new Date(submission.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                                  {submission.language}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`font-medium ${VERDICT_COLORS[submission.verdict] || 'text-gray-600'}`}>
                                  {submission.verdict}
                                </span>
                              </td>
                              <td className="py-3 text-gray-600 dark:text-gray-400">
                                0.2s
                              </td>
                              <td className="py-3 text-gray-600 dark:text-gray-400">
                                12MB
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'custom-tests' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                    Test Your Code
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Input
                      </label>
                      <textarea
                        className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono"
                        placeholder="Enter test input..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expected Output
                      </label>
                      <textarea
                        className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono"
                        placeholder="Enter expected output..."
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    onClick={() => {
                      // Run custom test
                      console.log('Running custom test');
                    }}
                  >
                    Run Test
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submission Result */}
          {submissionResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              submissionResult.verdict === 'ACCEPTED' || submissionResult.verdict === 'RUNNING'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : submissionResult.verdict === 'ERROR'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className={`font-bold ${
                    submissionResult.verdict === 'ACCEPTED' ? 'text-green-700 dark:text-green-400' :
                    submissionResult.verdict === 'ERROR' ? 'text-red-700 dark:text-red-400' :
                    'text-blue-700 dark:text-blue-400'
                  }`}>
                    {submissionResult.verdict}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {submissionResult.message}
                  </div>
                  {submissionResult.time && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Time: {submissionResult.time} | Memory: {submissionResult.memory}
                    </div>
                  )}
                </div>
                {submissionResult.verdict === 'ACCEPTED' && (
                  <div className="text-2xl">🎉</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <CodeEditor
              initialCode={code}
              language={language}
              onCodeChange={setCode}
              onRun={(code, lang) => handleRunCode(code, lang)}
              onSubmit={(code, lang) => handleSubmitCode(code, lang)}
              loading={submissionLoading}
            />
            
            {/* Quick Actions */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCode(getDefaultCode(language));
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Reset Code
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    alert('Code copied to clipboard!');
                  }}
                  className="px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50"
                >
                  Copy Code
                </button>
                <button
                  onClick={() => navigate(`/editorials/${problem?._id}`)}
                  className="px-3 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-sm hover:bg-purple-200 dark:hover:bg-purple-800/50 col-span-2"
                >
                  View Editorials
                </button>
              </div>
            </div>

            {/* Problem Stats */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                Problem Statistics
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Acceptance Rate</span>
                  <span className="font-medium text-gray-800 dark:text-white">75%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</span>
                  <span className="font-medium text-gray-800 dark:text-white">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Your Submissions</span>
                  <span className="font-medium text-blue-600">{userSubmissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                  <span className={`font-medium ${
                    problem?.rating <= 1200 ? 'text-green-600' :
                    problem?.rating <= 1800 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {problem?.rating <= 1200 ? 'Easy' : 
                     problem?.rating <= 1800 ? 'Medium' : 'Hard'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemEditor;