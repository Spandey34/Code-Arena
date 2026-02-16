import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestAPI } from '../../../shared/services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../shared/utils/helpers';

const ContestStandings = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [standings, setStandings] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredStandings, setFilteredStandings] = useState([]);

  useEffect(() => {
    fetchStandings();
  }, [id]);

  useEffect(() => {
    if (search) {
      const filtered = standings.filter(entry =>
        entry.username.toLowerCase().includes(search.toLowerCase()) ||
        entry.email.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStandings(filtered);
    } else {
      setFilteredStandings(standings);
    }
  }, [search, standings]);

  const fetchStandings = async () => {
    try {
      const [standingsRes, contestRes] = await Promise.all([
        contestAPI.getStandings(id),
        contestAPI.getById(id)
      ]);
      
      setStandings(standingsRes);
      setFilteredStandings(standingsRes);
      setContest(contestRes);
    } catch (error) {
      console.error('Failed to fetch standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRank = () => {
    return standings.findIndex(entry => entry.userId === user._id) + 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const userRank = getUserRank();
  const userStanding = standings[userRank - 1];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {contest?.name} - Standings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {formatDate(contest?.startTime || new Date())}
            </p>
          </div>
          <Link
            to={`/contests/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Contest
          </Link>
        </div>

        {/* User's Rank Card */}
        {userStanding && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <div className="text-sm text-blue-200 mb-1">Your Rank</div>
                <div className="text-3xl font-bold">#{userRank}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-blue-200 mb-1">Problems Solved</div>
                <div className="text-2xl font-bold">{userStanding.solvedCount}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-blue-200 mb-1">Total Penalty</div>
                <div className="text-2xl font-bold">{userStanding.totalPenalty}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-blue-200 mb-1">Participants</div>
                <div className="text-2xl font-bold">{standings.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants..."
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Participant</div>
            <div className="col-span-2">Solved</div>
            <div className="col-span-2">Penalty</div>
            <div className="col-span-3">Problems</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
          {filteredStandings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No participants found. {search && 'Try a different search.'}
              </p>
            </div>
          ) : (
            filteredStandings.map((entry, index) => {
              const isCurrentUser = entry.userId === user._id;
              const problemStatuses = entry.problems ? Object.values(entry.problems) : [];
              
              return (
                <div
                  key={entry.userId}
                  className={`px-6 py-4 ${isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="col-span-1">
                      <div className="flex items-center">
                        <span className={`text-lg font-bold ${
                          entry.rank === 1 ? 'text-yellow-600' :
                          entry.rank === 2 ? 'text-gray-600 dark:text-gray-400' :
                          entry.rank === 3 ? 'text-orange-600' :
                          isCurrentUser ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {entry.rank}
                        </span>
                        {entry.rank <= 3 && (
                          <span className="ml-2 text-sm">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Participant */}
                    <div className="col-span-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${
                          isCurrentUser ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {entry.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-medium ${
                            isCurrentUser ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-white'
                          }`}>
                            {entry.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Solved */}
                    <div className="col-span-2">
                      <div className="font-bold text-gray-800 dark:text-white">
                        {entry.solvedCount}
                      </div>
                    </div>

                    {/* Penalty */}
                    <div className="col-span-2">
                      <div className="text-gray-800 dark:text-white">
                        {entry.totalPenalty}
                      </div>
                    </div>

                    {/* Problems */}
                    <div className="col-span-3">
                      <div className="flex flex-wrap gap-1">
                        {contest?.problems?.slice(0, 6).map((problem, idx) => {
                          const problemKey = Object.keys(entry.problems || {})[idx];
                          const problemStat = problemKey ? entry.problems[problemKey] : null;
                          
                          if (!problemStat) {
                            return (
                              <div
                                key={idx}
                                className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded text-xs flex items-center justify-center"
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                            );
                          }
                          
                          return (
                            <div
                              key={idx}
                              className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                                problemStat.solved
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : problemStat.wrongAttempts > 0
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                              }`}
                              title={
                                problemStat.solved
                                  ? `Solved in ${problemStat.penalty} min`
                                  : `${problemStat.wrongAttempts} wrong attempts`
                              }
                            >
                              {String.fromCharCode(65 + idx)}
                              {problemStat.wrongAttempts > 0 && !problemStat.solved && (
                                <span className="text-[8px]">+{problemStat.wrongAttempts}</span>
                              )}
                            </div>
                          );
                        })}
                        
                        {(contest?.problems?.length || 0) > 6 && (
                          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded text-xs flex items-center justify-center">
                            +{contest.problems.length - 6}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs flex items-center justify-center">
              A
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Solved</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs flex items-center justify-center">
              B+
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Wrong attempts</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 rounded text-xs flex items-center justify-center">
              C
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Not attempted</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs flex items-center justify-center">
              D
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">First to solve</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Contest Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {standings.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Participants
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {standings.filter(s => s.solvedCount > 0).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Participants with AC
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(standings.reduce((acc, s) => acc + s.solvedCount, 0) / standings.length * 10) / 10}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Problems Solved
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {standings[0]?.solvedCount || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Highest Solved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestStandings;