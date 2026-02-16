import React from 'react';
import { VERDICT_COLORS } from '../../shared/utils/constants';

const SubmissionResult = ({ result, onClose }) => {
  if (!result) return null;

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return '✅';
      case 'WRONG_ANSWER':
        return '❌';
      case 'TIME_LIMIT_EXCEEDED':
        return '⏱️';
      case 'RUNTIME_ERROR':
        return '💥';
      case 'COMPILATION_ERROR':
        return '🔧';
      case 'QUEUED':
        return '⏳';
      case 'PROCESSING':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const getVerdictMessage = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return 'Congratulations! All test cases passed.';
      case 'WRONG_ANSWER':
        return 'Your output doesn\'t match the expected output.';
      case 'TIME_LIMIT_EXCEEDED':
        return 'Your code took too long to execute.';
      case 'RUNTIME_ERROR':
        return 'Your code crashed during execution.';
      case 'COMPILATION_ERROR':
        return 'Your code failed to compile.';
      case 'QUEUED':
        return 'Your submission is waiting in queue.';
      case 'PROCESSING':
        return 'Your submission is being evaluated.';
      default:
        return 'Submission result unknown.';
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`text-3xl ${getVerdictIcon(result.verdict)}`}></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Submission Result
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Verdict */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Verdict
              </span>
              <span className={`text-lg font-bold ${VERDICT_COLORS[result.verdict] || 'text-gray-600'}`}>
                {result.verdict}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {getVerdictMessage(result.verdict)}
            </p>
          </div>

          {/* Test Cases */}
          {result.testCases && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Test Cases
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {result.testCases.map((testCase, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center ${
                      testCase.passed
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}
                  >
                    <div className="font-bold">Test {index + 1}</div>
                    <div className="text-sm">{testCase.passed ? 'Passed' : 'Failed'}</div>
                    <div className="text-xs mt-1">
                      {testCase.time || '0'}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Time Taken
                </div>
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                  {result.time || '0'} ms
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Memory Used
                </div>
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                  {result.memory || '0'} MB
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Language
                </div>
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                  {result.language || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {result.error && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Error Details
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <pre className="text-red-800 dark:text-red-300 text-sm whitespace-pre-wrap font-mono">
                  {result.error}
                </pre>
              </div>
            </div>
          )}

          {/* Your Output vs Expected Output */}
          {result.yourOutput && result.expectedOutput && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Output Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Output
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                    {result.yourOutput}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expected Output
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                    {result.expectedOutput}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips for Improvement */}
          {result.verdict !== 'ACCEPTED' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                Tips for Improvement
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {result.verdict === 'WRONG_ANSWER' && (
                  <>
                    <li>• Check edge cases and boundary conditions</li>
                    <li>• Verify your logic for all possible inputs</li>
                    <li>• Test with sample inputs manually</li>
                  </>
                )}
                {result.verdict === 'TIME_LIMIT_EXCEEDED' && (
                  <>
                    <li>• Optimize your algorithm's time complexity</li>
                    <li>• Look for unnecessary loops or recursion</li>
                    <li>• Consider using more efficient data structures</li>
                  </>
                )}
                {result.verdict === 'RUNTIME_ERROR' && (
                  <>
                    <li>• Check for array index out of bounds</li>
                    <li>• Look for null pointer dereferences</li>
                    <li>• Verify your recursion base cases</li>
                  </>
                )}
                {result.verdict === 'COMPILATION_ERROR' && (
                  <>
                    <li>• Check for syntax errors</li>
                    <li>• Verify imports and dependencies</li>
                    <li>• Look for missing semicolons or brackets</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Submission ID: {result.submissionId?.slice(0, 8) || 'N/A'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // View code functionality
                  console.log('View code');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Code
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionResult;