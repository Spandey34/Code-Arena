import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contestAPI, problemAPI } from '../../../shared/services/api';

const CreateContest = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    duration: 120,
    status: 'upcoming'
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await problemAPI.getAll();
      setProblems(response.problems);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const toggleProblem = (problemId) => {
    if (selectedProblems.includes(problemId)) {
      setSelectedProblems(
        selectedProblems.filter(id => id !== problemId)
      );
    } else {
      setSelectedProblems([
        ...selectedProblems,
        problemId
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    if (selectedProblems.length === 0) {
      setError('Please select at least one problem');
      setLoading(false);
      return;
    }

    if (!formData.startTime) {
      setError('Please select a start time');
      setLoading(false);
      return;
    }

    try {
      // Convert local browser time to UTC
      const utcStartTime = new Date(
        formData.startTime
      ).toISOString();

      console.log('Selected local time:', formData.startTime);
      console.log('Converted UTC time:', utcStartTime);

      const contestData = {
        ...formData,

        // IMPORTANT:
        // Send UTC time to backend/MongoDB
        startTime: utcStartTime,

        problems: selectedProblems,

        duration: parseInt(formData.duration)
      };

      console.log('Contest data being sent:', contestData);

      const response = await contestAPI.create(contestData);

      if (response) {
        navigate('/contests', {
          state: {
            message: 'Contest created successfully!'
          }
        });
      }

    } catch (error) {
      console.error('Error creating contest:', error);

      setError(
        error.response?.data?.message ||
        'Failed to create contest'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Create New Contest
        </h1>

        <p className="text-gray-600 dark:text-gray-400">
          Set up a new coding competition
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">

          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Contest Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Contest Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contest Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter contest name"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time *
              </label>

              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes) *
              </label>

              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="60">
                  60 minutes (1 hour)
                </option>

                <option value="120">
                  120 minutes (2 hours)
                </option>

                <option value="180">
                  180 minutes (3 hours)
                </option>

                <option value="240">
                  240 minutes (4 hours)
                </option>

                <option value="300">
                  300 minutes (5 hours)
                </option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Status *
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="upcoming">
                  Upcoming
                </option>

                <option value="ongoing">
                  Ongoing
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* Problem Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Select Problems *
            </h2>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProblems.length} problem(s) selected
            </div>

          </div>

          {/* Search */}
          <div className="mb-4">

            <input
              type="text"
              placeholder="Search problems..."
              className="input-field mb-4"
              onChange={(e) => {
                // Search functionality can be implemented here
              }}
            />

          </div>

          {/* Problems */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">

            {problems.map((problem) => (

              <div
                key={problem._id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProblems.includes(problem._id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => toggleProblem(problem._id)}
              >

                <div className="flex items-start justify-between mb-2">

                  <div className="font-medium text-gray-800 dark:text-white">
                    {problem.title}
                  </div>

                  <div
                    className={`w-4 h-4 rounded border ${
                      selectedProblems.includes(problem._id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >

                    {selectedProblems.includes(problem._id) && (

                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />

                      </svg>

                    )}

                  </div>

                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {problem.description.substring(0, 60)}...
                </div>

                <div className="flex justify-between items-center">

                  {/* Difficulty */}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      problem.rating <= 1200
                        ? 'bg-green-100 text-green-800'
                        : problem.rating <= 1800
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {problem.rating <= 1200
                      ? 'Easy'
                      : problem.rating <= 1800
                      ? 'Medium'
                      : 'Hard'}{' '}
                    ({problem.rating})
                  </span>

                  {/* Visibility */}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      problem.isPublic
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {problem.isPublic ? 'Public' : 'Private'}
                  </span>

                </div>

              </div>

            ))}

          </div>

          {/* Selected Problems */}
          {selectedProblems.length > 0 && (

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">

              <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                Selected Problems ({selectedProblems.length})
              </h3>

              <div className="flex flex-wrap gap-2">

                {selectedProblems.map((problemId) => {

                  const problem = problems.find(
                    p => p._id === problemId
                  );

                  return problem ? (

                    <div
                      key={problemId}
                      className="flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border"
                    >

                      <span className="text-sm">
                        {problem.title}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleProblem(problemId)}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        ×
                      </button>

                    </div>

                  ) : null;

                })}

              </div>

            </div>

          )}

        </div>

        {/* Contest Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">

          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Contest Preview
          </h2>

          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">

              {/* Name */}
              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contest Name
                </label>

                <div className="font-medium text-gray-800 dark:text-white">
                  {formData.name || 'Not set'}
                </div>

              </div>

              {/* Duration */}
              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>

                <div className="font-medium text-gray-800 dark:text-white">
                  {formData.duration} minutes
                </div>

              </div>

            </div>

            {/* Start Time */}
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>

              <div className="font-medium text-gray-800 dark:text-white">

                {formData.startTime
                  ? new Date(formData.startTime).toLocaleString(
                      'en-IN',
                      {
                        timeZone: 'Asia/Kolkata',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }
                    )
                  : 'Not set'}

              </div>

            </div>

            {/* Problems */}
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Problems
              </label>

              <div className="font-medium text-gray-800 dark:text-white">
                {selectedProblems.length} problem(s) selected
              </div>

            </div>

          </div>

        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">

          <button
            type="button"
            onClick={() => navigate('/admin/contests')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              selectedProblems.length === 0
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Creating Contest...'
              : 'Create Contest'}
          </button>

        </div>

      </form>

    </div>
  );
};

export default CreateContest;