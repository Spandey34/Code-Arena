import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProblemForm = () => {
  const { authFetch } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [rating, setRating] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
  const [correctSolution, setCorrectSolution] = useState('');

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      alert('Problem added successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setInputFormat('');
      setOutputFormat('');
      setConstraints('');
      setRating('');
      setLanguage('JavaScript');
      setTestCases([{ input: '', output: '' }]);
      setCorrectSolution('');
    } catch (err) {
      console.error('Failed to add problem', err?.response?.data || err);
      alert('Failed to add problem');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* TITLE */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
          required
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Description (Markdown supported)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="mt-1 block w-full border rounded-md p-2"
          placeholder="Use **bold**, lists, etc."
          required
        />
      </div>

      {/* INPUT FORMAT */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Input Format
        </label>
        <textarea
          value={inputFormat}
          onChange={(e) => setInputFormat(e.target.value)}
          rows={4}
          className="mt-1 block w-full border rounded-md p-2 font-mono text-sm"
          required
        />
      </div>

      {/* OUTPUT FORMAT */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Output Format
        </label>
        <textarea
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          rows={4}
          className="mt-1 block w-full border rounded-md p-2 font-mono text-sm"
          required
        />
      </div>

      {/* CONSTRAINTS */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Constraints
        </label>
        <textarea
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          rows={4}
          className="mt-1 block w-full border rounded-md p-2 font-mono text-sm"
          placeholder="- 1 ≤ n ≤ 2×10^5"
          required
        />
      </div>

      {/* RATING + LANGUAGE */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Rating
          </label>
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Reference Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option>JavaScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C++</option>
          </select>
        </div>
      </div>

      {/* TEST CASES */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-2">
          Test Cases
        </h4>

        {testCases.map((tc, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-4 mb-2">
            <textarea
              placeholder="Input"
              value={tc.input}
              onChange={(e) =>
                handleTestCaseChange(idx, 'input', e.target.value)
              }
              className="border rounded-md p-2 font-mono text-sm"
              required
            />
            <textarea
              placeholder="Output"
              value={tc.output}
              onChange={(e) =>
                handleTestCaseChange(idx, 'output', e.target.value)
              }
              className="border rounded-md p-2 font-mono text-sm"
              required
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddTestCase}
          className="mt-2 px-4 py-1.5 bg-slate-200 rounded hover:bg-slate-300"
        >
          Add Test Case
        </button>
      </div>

      {/* CORRECT SOLUTION */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Correct Solution (Hidden from users)
        </label>
        <textarea
          value={correctSolution}
          onChange={(e) => setCorrectSolution(e.target.value)}
          rows={6}
          className="mt-1 block w-full border rounded-md p-2 font-mono text-sm"
          required
        />
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600"
      >
        Add Problem
      </button>
    </form>
  );
};

export default ProblemForm;
