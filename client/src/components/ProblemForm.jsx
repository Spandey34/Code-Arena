import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProblemForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
  const [correctSolution, setCorrectSolution] = useState('');
  const { authFetch } = useContext(AuthContext);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authFetch.post('/admin/problems', {
        title,
        description,
        rating: parseInt(rating),
        language,
        testCases,
        correctSolution,
      });
      alert('Problem added successfully!');
      setTitle('');
      setDescription('');
      setRating('');
      setLanguage('JavaScript');
      setTestCases([{ input: '', output: '' }]);
      setCorrectSolution('');
    } catch (error) {
      console.error('Failed to add problem', error.response.data);
      alert('Failed to add problem.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500" required></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Rating</label>
          <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500" required>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
          </select>
        </div>
      </div>
      <div>
        <h4 className="text-md font-semibold text-slate-800 mb-2">Test Cases</h4>
        {testCases.map((testCase, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-2">
            <textarea
              type="text"
              placeholder="Input"
              value={testCase.input}
              onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
              className="block w-full border border-slate-300 rounded-md shadow-sm p-2"
              required
            />
            <textarea
              type="text"
              placeholder="Output"
              value={testCase.output}
              onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
              className="block w-full border border-slate-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddTestCase}
          className="mt-2 bg-slate-200 text-slate-800 text-sm px-4 py-1.5 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Add Test Case
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Correct Solution Code</label>
        <textarea value={correctSolution} onChange={(e) => setCorrectSolution(e.target.value)} rows="6" className="mt-1 block w-full font-mono text-sm border border-slate-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500" required></textarea>
      </div>
      <button
        type="submit"
        className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors"
      >
        Add Problem
      </button>
    </form>
  );
};

export default ProblemForm;