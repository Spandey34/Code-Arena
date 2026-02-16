import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../../shared/services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filter, users]);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getLeaderboard();
      setUsers(response.users);
      setFilteredUsers(response.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'admin') {
      filtered = filtered.filter(user => user.isAdmin);
    } else if (filter === 'user') {
      filtered = filtered.filter(user => !user.isAdmin);
    }

    setFilteredUsers(filtered);
  };

  const promoteToAdmin = async (userId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'remove admin privileges from' : 'promote'} this user?`)) {
      try {
        // Here you would call your API to update user admin status
        console.log('Update user admin status:', userId, !currentStatus);
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    }
  };

  const deleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        // Here you would call your API to delete user
        console.log('Delete user:', userId);
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all registered users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.isAdmin).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.rating >= 1600).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rating 1600+</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round(users.reduce((acc, user) => acc + user.rating, 0) / users.length)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or email..."
              className="input-field"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins Only</option>
              <option value="user">Regular Users Only</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-2">Problems Solved</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Actions</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No users found. {searchTerm && 'Try a different search term.'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* User */}
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <span className="font-bold text-gray-800 dark:text-white mr-2">
                        {user.rating}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.rating >= 2000 ? 'bg-red-100 text-red-800' :
                        user.rating >= 1600 ? 'bg-purple-100 text-purple-800' :
                        user.rating >= 1400 ? 'bg-blue-100 text-blue-800' :
                        user.rating >= 1200 ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.rating >= 2000 ? 'GM' :
                         user.rating >= 1600 ? 'M' :
                         user.rating >= 1400 ? 'E' :
                         user.rating >= 1200 ? 'S' : 'N'}
                      </span>
                    </div>
                  </div>

                  {/* Problems Solved */}
                  <div className="col-span-2">
                    <div className="font-medium text-gray-800 dark:text-white">
                      {user.problemsSolved || 0}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.isAdmin 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3">
                    <div className="flex space-x-2">
                      <Link
                        to={`/users/${user._id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => promoteToAdmin(user._id, user.isAdmin)}
                        className={`px-3 py-1 rounded text-sm ${
                          user.isAdmin
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {user.isAdmin ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        onClick={() => deleteUser(user._id, user.username)}
                        className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Export to CSV
        </button>
      </div>
    </div>
  );
};

export default UserList;