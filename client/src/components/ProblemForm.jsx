import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  Code, 
  FileText, 
  Settings,
  Hash,
  AlertTriangle,
  Star,
  Languages,
  CheckCircle,
  ArrowRight,
  Save,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Zap
} from 'lucide-react';

const ProblemForm = () => {
  const { authFetch } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [rating, setRating] = useState('1200');
  const [language, setLanguage] = useState('JavaScript');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
  const [correctSolution, setCorrectSolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  const handleRemoveTestCase = (index) => {
    if (testCases.length > 1) {
      const updated = testCases.filter((_, i) => i !== index);
      setTestCases(updated);
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await authFetch.post('/admin/problems', {
        title,
        description,
        input: inputFormat,
        output: outputFormat,
        constraints,
        rating: Number(rating),
        language,
        testCases,
        correctSolution,
      });

      alert('✅ Problem added successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setInputFormat('');
      setOutputFormat('');
      setConstraints('');
      setRating('1200');
      setLanguage('JavaScript');
      setTestCases([{ input: '', output: '' }]);
      setCorrectSolution('');
      
    } catch (err) {
      console.error('Failed to add problem', err?.response?.data || err);
      alert(`❌ Failed to add problem: ${err?.response?.data?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (rating) => {
    const r = parseInt(rating) || 1200;
    if (r >= 1800) return 'text-red-600';
    if (r >= 1600) return 'text-orange-600';
    if (r >= 1400) return 'text-yellow-600';
    if (r >= 1200) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
              <Code size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Problem</h1>
              <p className="text-gray-600 dark:text-gray-400">Design a challenging coding problem for the arena</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FileText size={20} className="text-amber-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Problem Details</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Problem Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="Enter a descriptive title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Problem Description (Markdown)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 resize-none"
                      placeholder="## Description\n\nWrite the problem description here using Markdown formatting..."
                      required
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Supports Markdown: **bold**, *italic*, `code`, lists, etc.
                    </div>
                  </div>
                </div>
              </div>

              {/* Constraints Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={20} className="text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Constraints</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Problem Constraints
                  </label>
                  <textarea
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white font-mono text-sm transition-all duration-300 resize-none"
                    placeholder="- 1 ≤ n ≤ 2×10^5\n- Array elements are either 0 or 1\n- Time limit: 1 second\n- Memory limit: 256 MB"
                    required
                  />
                </div>
              </div>

              {/* Test Cases Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Settings size={20} className="text-purple-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Cases</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Test Case
                  </button>
                </div>
                
                <div className="space-y-4">
                  {testCases.map((tc, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{idx + 1}</span>
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Test Case {idx + 1}
                          </span>
                        </div>
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Input
                          </label>
                          <textarea
                            placeholder="Input data"
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Expected Output
                          </label>
                          <textarea
                            placeholder="Expected output"
                            value={tc.output}
                            onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* I/O Format Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <ChevronRight size={20} className="text-green-500" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Input Format</h2>
                    </div>
                    <textarea
                      value={inputFormat}
                      onChange={(e) => setInputFormat(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white font-mono text-sm transition-all duration-300 resize-none"
                      placeholder="The first line contains an integer n — size of array\nSecond line contains n space-separated integers"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <ChevronLeft size={20} className="text-blue-500" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Output Format</h2>
                    </div>
                    <textarea
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white font-mono text-sm transition-all duration-300 resize-none"
                      placeholder="Print a single integer — the answer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Configuration Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Settings size={20} className="text-amber-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuration</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="text-amber-500" />
                        Difficulty Rating
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                        min="800"
                        max="3000"
                        step="100"
                        required
                      />
                      <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 font-bold ${getDifficultyColor(rating)}`}>
                        {parseInt(rating) >= 1800 ? 'Hard' : 
                         parseInt(rating) >= 1600 ? 'Medium-Hard' : 
                         parseInt(rating) >= 1400 ? 'Medium' : 
                         parseInt(rating) >= 1200 ? 'Easy-Medium' : 'Easy'}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Higher rating = more difficult
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <div className="flex items-center gap-2">
                        <Languages size={16} className="text-amber-500" />
                        Reference Language
                      </div>
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                    >
                      <option value="JavaScript">JavaScript</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-amber-500" />
                      Correct Solution (Hidden from users)
                    </div>
                  </label>
                  <textarea
                    value={correctSolution}
                    onChange={(e) => setCorrectSolution(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                    placeholder="function solve(input) {\n  // Correct solution here\n  return answer;\n}"
                    required
                  />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This solution is used to validate user submissions
                  </div>
                </div>
              </div>

              {/* Submit Card */}
              <div className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 dark:from-amber-500/5 dark:to-purple-500/5 rounded-2xl p-6 border border-amber-500/20 dark:border-amber-500/10">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Ready to Publish Problem?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Review all details before publishing to the arena
                  </p>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative overflow-hidden w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Publish Problem
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircle size={14} className="inline mr-1" />
                    Problem will be available for practice and matchmaking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Terminal size={20} className="text-blue-500" />
            Problem Creation Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="space-y-2">
              <p>• Write clear, unambiguous descriptions</p>
              <p>• Include edge cases in test data</p>
              <p>• Test your solution thoroughly</p>
            </div>
            <div className="space-y-2">
              <p>• Set appropriate time/memory limits</p>
              <p>• Use realistic constraints</p>
              <p>• Include sample I/O for clarity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemForm;