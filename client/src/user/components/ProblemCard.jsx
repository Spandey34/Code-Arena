import React from 'react';
import { Link } from 'react-router-dom';

const ProblemCard = ({ problem }) => {
  const getDifficultyColor = (rating) => {
    if (rating <= 1200) return 'bg-green-100 text-green-800';
    if (rating <= 1800) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyText = (rating) => {
    if (rating <= 1200) return 'Easy';
    if (rating <= 1800) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Status */}
        <div className="col-span-1">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>

        {/* Title */}
        <div className="col-span-5">
          <Link
            to={`/practice/problem/${problem._id}`}
            className="font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            {problem.title}
          </Link>
        </div>

        {/* Difficulty */}
        <div className="col-span-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.rating)}`}>
            {getDifficultyText(problem.rating)} ({problem.rating})
          </span>
        </div>

        {/* Acceptance (placeholder) */}
        <div className="col-span-2">
          <span className="text-gray-600 dark:text-gray-400">
            75% Accepted
          </span>
        </div>

        {/* Action */}
        <div className="col-span-2 text-right">
          <Link
            to={`/practice/problem/${problem._id}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Solve
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;