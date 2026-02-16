import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contestAPI } from '../../../shared/services/api'; // Ensure this has the new updateRatings method
import { formatDate } from '../../../shared/utils/helpers';
import { CONTEST_STATUS, CONTEST_STATUS_COLORS } from '../../../shared/utils/constants';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // New state to track which contest is currently updating
  const [updatingRatings, setUpdatingRatings] = useState(null);

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    filterContests();
  }, [searchTerm, statusFilter, contests]);

  const fetchContests = async () => {
    try {
      const response = await contestAPI.getAll();
      console.log(response);
      setContests(response);
      setFilteredContests(response);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContestStatus = (contest) => {
    if (contest.status === 'completed') return CONTEST_STATUS.COMPLETED;
    if (contest.status === 'ongoing') return CONTEST_STATUS.ONGOING;
    if (contest.status === 'upcoming') return CONTEST_STATUS.UPCOMING;
    
    // Fallback date check if status string isn't updated
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(start.getTime() + contest.duration * 60000);
    
    if (now < start) return CONTEST_STATUS.UPCOMING;
    if (now < end) return CONTEST_STATUS.ONGOING;
    return CONTEST_STATUS.COMPLETED;
  };

  const filterContests = () => {
    let filtered = contests || [];

    if (searchTerm) {
      filtered = filtered.filter(contest =>
        contest.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contest => getContestStatus(contest) === statusFilter);
    }

    setFilteredContests(filtered);
  };

  const handleDelete = async (contestId) => {
    if (window.confirm('Are you sure you want to delete this contest? This action cannot be undone.')) {
      try {
        await contestAPI.delete(contestId);
        fetchContests();
      } catch (error) {
        console.error('Failed to delete contest:', error);
      }
    }
  };

  // === NEW FUNCTION: Handle Rating Update ===
  const handleUpdateRatings = async (contestId) => {
    if (!window.confirm('Are you sure? This will calculate ratings for all participants based on current standings. This action happens only once.')) {
        return;
    }

    setUpdatingRatings(contestId);
    try {
        // You need to ensure your api service handles this POST request
        // e.g., axios.post(`/api/contest/updateRatings/${contestId}`)
        await contestAPI.updateRatings(contestId); 
        
        alert('Ratings updated successfully!');
        
        // Refresh the list to show the new "isRatingCalculated" status
        fetchContests(); 
    } catch (error) {
        console.error('Failed to update ratings:', error);
        alert(error.response?.data?.message || 'Failed to update ratings');
    } finally {
        setUpdatingRatings(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Contest Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage coding contests and competitions
          </p>
        </div>
        <Link
          to="/contests/add"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create Contest
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* ... existing stats code ... */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-blue-600">{contests.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Contests</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-green-600">
            {contests.filter(c => getContestStatus(c) === CONTEST_STATUS.UPCOMING).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {contests.filter(c => getContestStatus(c) === CONTEST_STATUS.ONGOING).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Ongoing</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-gray-600">
            {contests.filter(c => getContestStatus(c) === CONTEST_STATUS.COMPLETED).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
         {/* ... existing filter code ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contests..."
              className="input-field w-full px-4 py-3 border rounded-lg"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full px-4 py-3 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value={CONTEST_STATUS.UPCOMING}>Upcoming</option>
              <option value={CONTEST_STATUS.ONGOING}>Ongoing</option>
              <option value={CONTEST_STATUS.COMPLETED}>Completed</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Contests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Start Time</div>
            <div className="col-span-1">Duration</div>
            <div className="col-span-1">Users</div>
            <div className="col-span-1">Status</div>
            {/* Expanded Actions column to fit the new button */}
            <div className="col-span-4 text-right">Actions</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredContests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No contests found. {searchTerm && 'Try a different search term.'}
              </p>
            </div>
          ) : (
            filteredContests.map((contest) => {
              const status = getContestStatus(contest);
              // Ensure we check the flag from backend
              const isCompleted = status === CONTEST_STATUS.COMPLETED;
              const isRatingsDone = contest.isRatingCalculated; 
              
              return (
                <div key={contest._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Name */}
                    <div className="col-span-3">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {contest.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {contest.problemsCount || 0} problems
                      </div>
                    </div>

                    {/* Start Time */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-800 dark:text-white">
                        {formatDate(contest.startTime)}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="col-span-1">
                      <div className="text-sm text-gray-800 dark:text-white">
                        {contest.duration}m
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="col-span-1">
                      <div className="text-sm text-gray-800 dark:text-white">
                        {contest.registeredUsersCount || 0}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${CONTEST_STATUS_COLORS[contest.status]}`}>
                        {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                      </span>
                    </div>

                    {/* Actions - Now spans 4 columns */}
                    <div className="col-span-4">
                      <div className="flex justify-end space-x-2">
                        {/* 1. RATE BUTTON (Only if Completed) */}
                        {isCompleted && (
                            <button
                                onClick={() => handleUpdateRatings(contest._id)}
                                disabled={isRatingsDone || updatingRatings === contest._id}
                                className={`px-2 py-1 rounded text-xs border flex items-center ${
                                    isRatingsDone
                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" // Disabled style
                                    : "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100" // Active style
                                }`}
                            >
                                {updatingRatings === contest._id ? (
                                    <>
                                        <div className="animate-spin h-3 w-3 mr-1 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                                        Processing...
                                    </>
                                ) : isRatingsDone ? (
                                    "Rated ✓"
                                ) : (
                                    "Update Ratings"
                                )}
                            </button>
                        )}

                        <Link
                          to={`/contests/edit/${contest._id}`}
                          className="px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded text-xs flex items-center"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/contests/${contest._id}/submissions`}
                          className="px-2 py-1 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded text-xs flex items-center"
                        >
                          Subs
                        </Link>
                        <Link
                          to={`/contests/${contest._id}/standings`}
                          className="px-2 py-1 bg-green-100 text-green-600 hover:bg-green-200 rounded text-xs flex items-center"
                        >
                          Rank
                        </Link>
                        <button
                          onClick={() => handleDelete(contest._id)}
                          className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs flex items-center"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestList;