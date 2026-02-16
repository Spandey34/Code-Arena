import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { editorialAPI, problemAPI } from '../../../shared/services/api';
import { LANGUAGES } from '../../../shared/utils/constants';

const CreateEditorial = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    code: '',
    language: 'JavaScript'
  });

  useEffect(() => {
    fetchProblemDetails();
  }, [problemId]);

  const fetchProblemDetails = async () => {
    try {
      const response = await problemAPI.getById(problemId);
      setProblem(response.problem);
      
      // Set default title
      setFormData(prev => ({
        ...prev,
        title: `Editorial: ${response.problem.title}`,
        code: `// Solution for: ${response.problem.title}\n// Write your solution here...`
      }));
    } catch (error) {
      setError('Failed to load problem details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.title.trim() || !formData.content.trim() || !formData.code.trim()) {
      setError('Title, content, and code are required');
      setSubmitting(false);
      return;
    }

    try {
      const editorialData = {
        ...formData,
        problemId
      };

      const response = await editorialAPI.create(editorialData);
      console.log(response);
      if (response) {
        navigate(-1);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create editorial');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !problem) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Write Editorial
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your solution and explanation for: {problem?.title}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Problem Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {problem?.title}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    problem?.rating <= 1200 ? 'bg-green-100 text-green-800' :
                    problem?.rating <= 1800 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem?.rating <= 1200 ? 'Easy' : 
                     problem?.rating <= 1800 ? 'Medium' : 'Hard'} ({problem?.rating})
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Write your solution explanation below
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Title */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Editorial Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field text-xl"
              placeholder="Enter editorial title..."
            />
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Explanation *
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Explain your approach and thought process
              </div>
            </div>
            
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="10"
              className="input-field"
              placeholder="Write your explanation here...
              
Include:
• Problem understanding
• Approach explanation
• Time & space complexity analysis
• Alternative solutions if any
• Tips and tricks"
            />
          </div>

          {/* Code Solution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code Solution *
              </label>
              <div>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <textarea
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              rows="15"
              className="input-field font-mono text-sm"
              placeholder={`// Write your ${formData.language} solution here...`}
            />
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Make sure your code is well-commented and easy to understand
            </div>
          </div>

          {/* Tips for Good Editorial */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-3">
              Tips for Writing a Great Editorial
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Start with a brief problem summary</li>
              <li>• Explain the intuition behind your approach</li>
              <li>• Break down the solution step by step</li>
              <li>• Include time and space complexity analysis</li>
              <li>• Mention edge cases and how to handle them</li>
              <li>• Provide alternative approaches if possible</li>
              <li>• Use clear and concise language</li>
              <li>• Add comments to your code</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={(e) =>{ 
                e.preventDefault()
                navigate(`/practice/problem/${problemId}`)
              }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Editorial'}
            </button>
          </div>
        </form>

        {/* Preview Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Preview
          </h2>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="prose dark:prose-invert max-w-none">
              <h1 className="text-2xl font-bold mb-4">{formData.title}</h1>
              
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Explanation</h3>
                <div className="whitespace-pre-line text-gray-600 dark:text-gray-400">
                  {formData.content || 'Your explanation will appear here...'}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Code Solution ({formData.language})</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{formData.code || 'Your code will appear here...'}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditorial;