import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contestAPI } from '../../../shared/services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../shared/utils/helpers';
import { CONTEST_STATUS, CONTEST_STATUS_COLORS } from '../../../shared/utils/constants';

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [registered, setRegistered] = useState(false);
  const [status, setStatus] = useState('upcoming');

  useEffect(() => {
    fetchContestDetails();
  }, [id]);

  useEffect(() => {
    if (contest) {
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [contest]);

  const fetchContestDetails = async () => {
    try {
      const response = await contestAPI.getById(id);
      setContest(response);
      console.log(response)
      // Check if user is registered
      const isRegistered = response.registeredUsers?.some(
        u => u._id === user._id || u === user._id
      );
      setRegistered(isRegistered);
      
      // Determine contest status
      const now = new Date();
      const start = new Date(response.startTime);
      const end = new Date(start.getTime() + response.duration * 60000);
      
      if (now < start) setStatus(CONTEST_STATUS.UPCOMING);
      else if (now < end) setStatus(CONTEST_STATUS.ONGOING);
      else setStatus(CONTEST_STATUS.COMPLETED);
      
    } catch (error) {
      setError('Failed to load contest details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!contest) return;
    
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(start.getTime() + contest.duration * 60000);
    
    let diff;
    if (now < start) {
      diff = start - now;
    } else if (now < end) {
      diff = end - now;
    } else {
      diff = 0;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft({ days, hours, minutes, seconds });
  };

  const handleRegister = async () => {
    try {
      await contestAPI.register(id);
      setRegistered(true);
      fetchContestDetails(); // Refresh contest data
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  const canJoinContest = () => {
    if (!contest) return false;
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(start.getTime() + contest.duration * 60000);
    return registered && now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error || 'Contest not found'}
        </h1>
        <Link
          to="/contests"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Contests
        </Link>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(start.getTime() + contest.duration * 60000);
  const hasStarted = contest.status=="ongoing" ? true : now >= start;
  const hasEnded = contest.status=="completed" ? true : now >= end;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Contest Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">{contest.name}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                CONTEST_STATUS_COLORS[status]
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <span className="text-blue-200">
                {contest.registeredUsers?.length || 0} registered
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {contest.duration} min
            </div>
            <div className="text-blue-200">Duration</div>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {hasEnded ? 'Contest Ended' : 
             hasStarted ? 'Contest Ends In' : 'Contest Starts In'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {formatDate(contest.startTime)}
          </p>
        </div>
        
        {!hasEnded&&<div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{timeLeft.days}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Seconds</div>
          </div>
        </div>}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        {!hasEnded && !registered && (
          <button
            onClick={handleRegister}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Register Now
          </button>
        )}
        
        {!registered && canJoinContest() && (
          <button
            onClick={() => navigate(`/contests/${id}/editor`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Enter Contest
          </button>
        )}
        
        <Link
          to={`/contests/${id}/standings`}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          View Standings
        </Link>
        
        <Link
          to={`/contests/${id}/submissions`}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
        >
          My Submissions
        </Link>
      </div>

      {/* Contest Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Problems */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Problems {contest.problems?.length ? `(${contest.problems.length})` : ''}
              </h2>
            </div>
            
            <div className="p-6">
              {contest.problems && contest.problems.length > 0 ? (
                <div className="space-y-4">
                  {contest.problems.map((problem, index) => (
                    <Link
                      key={problem._id}
                      to={hasStarted ? `/contests/${id}/problem/${problem._id}` : '#'}
                      className={`block p-4 rounded-lg border ${
                        hasStarted 
                          ? 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                      } ${
                        index === 0 ? 'border-green-200 bg-green-50 dark:bg-green-900/20' :
                        index === 1 ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                        index === 2 ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                        'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-green-500' :
                            index === 1 ? 'bg-yellow-500' :
                            index === 2 ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">
                              {problem.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded text-xs ${
                                problem.rating <= 1200 ? 'bg-green-100 text-green-800' :
                                problem.rating <= 1800 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {problem.rating <= 1200 ? 'Easy' : 
                                 problem.rating <= 1800 ? 'Medium' : 'Hard'} ({problem.rating})
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Points: {(index + 1) * 100}
                              </span>
                            </div>
                          </div>
                        </div>
                        {hasStarted && (
                          <span className="text-blue-600">→</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No problems added to this contest yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Info & Rules */}
        <div className="lg:col-span-1">
          {/* Contest Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Contest Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Start Time</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {formatDate(contest.startTime)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {contest.duration} minutes
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Participants</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {contest.registeredUsers?.length || 0}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Your Status</span>
                <span className={`font-medium ${
                  registered ? 'text-green-600' : 'text-red-600'
                }`}>
                  {registered ? 'Registered' : 'Not Registered'}
                </span>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Contest Rules
            </h2>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  ✓
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Solutions are judged automatically
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  ✓
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Each problem has different point values
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  ✓
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Penalty of 5 minutes for wrong submissions
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  ✓
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ranking based on problems solved and penalty time
                </span>
              </li>
            </ul>
          </div>

          {/* Leaderboard Preview */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Top 3
              </h2>
              <Link
                to={`/contests/${id}/standings`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All →
              </Link>
            </div>
            
            <div className="space-y-3">
              {[1, 2, 3].map((rank) => (
                <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      rank === 1 ? 'bg-yellow-500' :
                      rank === 2 ? 'bg-gray-400' :
                      'bg-orange-500'
                    }`}>
                      <span className="text-white font-bold">{rank}</span>
                    </div>
                    <span className="text-gray-800 dark:text-white">
                      User {rank}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 dark:text-white">
                      {4 - rank} solved
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {rank * 45} min penalty
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetail;