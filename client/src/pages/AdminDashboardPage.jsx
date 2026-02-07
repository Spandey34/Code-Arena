import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboardPage = () => {
  const { authFetch } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manage');
  const [problems, setProblems] = useState([]);
  
  // Updated state to match backend schema exactly
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    input: '',        // New required field
    output: '',       // New required field
    constraints: '',  // New required field
    rating: 800,      // Replaces difficulty
    language: 'all',
    correctSolution: '', // New required field
    testCases: [{ input: '', output: '' }]
  });

  useEffect(() => {
    fetchProblems();
    // fetchStats(); // Commented out as backend endpoint wasn't provided in snippet, enable if needed
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await authFetch.get('/problems/admin/problems');
      setProblems(res.data || []);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProblemStatus = async (id) => {
    try {
      await authFetch.patch(`/problems/admin/problem/${id}/toggle`);
      fetchProblems();
    } catch (error) {
      console.error('Failed to toggle problem status:', error);
      alert('Failed to update problem status');
    }
  };

  const deleteProblem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      await authFetch.delete(`/problems/admin/problem/${id}`);
      fetchProblems();
    } catch (error) {
      console.error('Failed to delete problem:', error);
      alert('Failed to delete problem');
    }
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    try {
      await authFetch.post('/admin/problem', problemForm);
      alert('Problem created successfully!');
      // Reset form
      setProblemForm({
        title: '',
        description: '',
        input: '',
        output: '',
        constraints: '',
        rating: 800,
        language: 'all',
        correctSolution: '',
        testCases: [{ input: '', output: '' }]
      });
      setActiveTab('manage');
      fetchProblems();
    } catch (error) {
      console.error('Failed to create problem:', error);
      alert(error.response?.data?.message || 'Failed to create problem');
    }
  };

  const addTestCase = () => {
    setProblemForm({
      ...problemForm,
      testCases: [...problemForm.testCases, { input: '', output: '' }]
    });
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...problemForm.testCases];
    newTestCases[index][field] = value;
    setProblemForm({ ...problemForm, testCases: newTestCases });
  };

  const removeTestCase = (index) => {
    if (problemForm.testCases.length === 1) return;
    const newTestCases = problemForm.testCases.filter((_, i) => i !== index);
    setProblemForm({ ...problemForm, testCases: newTestCases });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Problem Management</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'manage'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Manage Problems
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'add'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Add Problem
            </button>
          </div>
        </div>

        {/* Add Problem Section */}
        {activeTab === 'add' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Problem</h2>
            
            <form onSubmit={handleAddProblem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={problemForm.title}
                    onChange={(e) => setProblemForm({...problemForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Problem title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating *
                  </label>
                  <input
                    type="number"
                    required
                    value={problemForm.rating}
                    onChange={(e) => setProblemForm({...problemForm, rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. 800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={problemForm.language}
                    onChange={(e) => setProblemForm({...problemForm, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Languages</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="C++">C++</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({...problemForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Full problem description..."
                />
              </div>

              {/* Input Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Format *
                </label>
                <textarea
                  required
                  value={problemForm.input}
                  onChange={(e) => setProblemForm({...problemForm, input: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the input format..."
                />
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Output Format *
                </label>
                <textarea
                  required
                  value={problemForm.output}
                  onChange={(e) => setProblemForm({...problemForm, output: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the output format..."
                />
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Constraints *
                </label>
                <textarea
                  required
                  value={problemForm.constraints}
                  onChange={(e) => setProblemForm({...problemForm, constraints: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. 1 <= N <= 100..."
                />
              </div>

              {/* Correct Solution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correct Solution Code *
                </label>
                <textarea
                  required
                  value={problemForm.correctSolution}
                  onChange={(e) => setProblemForm({...problemForm, correctSolution: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Paste the reference solution here..."
                />
              </div>

              {/* Test Cases */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Test Cases *
                  </label>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    + Add Test Case
                  </button>
                </div>
                
                <div className="space-y-3">
                  {problemForm.testCases.map((testCase, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Input
                        </label>
                        <textarea
                          required
                          value={testCase.input}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Expected Output
                        </label>
                        <textarea
                          required
                          value={testCase.output}
                          onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                        />
                      </div>
                      {problemForm.testCases.length > 1 && (
                        <div className="md:col-span-2">
                          <button
                            type="button"
                            onClick={() => removeTestCase(index)}
                            className="text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Problem
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Manage Problems Section */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Manage Problems</h2>
              
              {problems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No problems found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Language
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {problems.map(problem => (
                        <tr key={problem._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {problem.title}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                              {problem.rating}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {problem.language || 'All'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {/* Toggle functionality preserved but backend implementation may vary */}
                              <button
                                onClick={() => deleteProblem(problem._id)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;