import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contestAPI } from '../../../shared/services/api';
import { formatDate } from '../../../shared/utils/helpers';
import { CONTEST_STATUS, CONTEST_STATUS_COLORS } from '../../../shared/utils/constants';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await contestAPI.getAll();
      setContests(response);
      console.log(response);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContests = contests?.filter(contest => {
    if (filter === 'all') return true;
    return contest.status === filter;
  });

  const getStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(start.getTime() + contest.duration * 60000);

    if (now < start) return CONTEST_STATUS.UPCOMING;
    if (now < end) return CONTEST_STATUS.ONGOING;
    return CONTEST_STATUS.COMPLETED;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Coding Contests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compete with developers worldwide
        </p>
      </div>

      {/* Stats and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {contests?.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Contests
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {contests?.filter(c => getStatus(c) === CONTEST_STATUS.UPCOMING).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Upcoming
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {contests?.filter(c => getStatus(c) === CONTEST_STATUS.ONGOING).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Ongoing
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-gray-600 mb-1">
            {contests?.filter(c => getStatus(c) === CONTEST_STATUS.COMPLETED).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Completed
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            All Contests
          </button>
          <button
            onClick={() => setFilter(CONTEST_STATUS.UPCOMING)}
            className={`px-4 py-2 rounded-lg ${filter === CONTEST_STATUS.UPCOMING ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter(CONTEST_STATUS.ONGOING)}
            className={`px-4 py-2 rounded-lg ${filter === CONTEST_STATUS.ONGOING ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilter(CONTEST_STATUS.COMPLETED)}
            className={`px-4 py-2 rounded-lg ${filter === CONTEST_STATUS.COMPLETED ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Contests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContests?.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No contests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'No contests available yet' 
                : `No ${filter} contests at the moment`}
            </p>
          </div>
        ) : (
          filteredContests?.map((contest) => {
            const status = getStatus(contest);
            return (
              <Link
                key={contest._id}
                to={`/contests/${contest._id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        {contest.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${CONTEST_STATUS_COLORS[contest.status]}`}>
                        {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {contest.duration}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        minutes
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(contest.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{contest.duration} minutes</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {contest.registeredUsersCount || 0} registered
                      </span>
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        {status === CONTEST_STATUS.UPCOMING ? 'Register Now' : 'View Details'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Create Contest (for admins) */}
      {localStorage.getItem('user')?.includes('"isAdmin":true') && (
        <div className="mt-8 text-center">
          <Link
            to="/admin/contests/add"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Contest
          </Link>
        </div>
      )}
    </div>
  );
};

export default ContestList;