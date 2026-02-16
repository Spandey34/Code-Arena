import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    {
      category: 'Problems',
      items: [
        { path: '/problems', icon: '📝', label: 'All Problems' },
        { path: '/problems/add', icon: '➕', label: 'Add Problem' },
      ]
    },
    {
      category: 'Contests',
      items: [
        { path: '/contests', icon: '🏆', label: 'All Contests' },
        { path: '/contests/add', icon: '➕', label: 'Create Contest' },
      ]
    },
    {
      category: 'Users',
      items: [
        { path: '/users', icon: '👥', label: 'All Users' },
      ]
    },
    {
      category: 'Submissions',
      items: [
        { path: '/submissions', icon: '📋', label: 'All Submissions' },
      ]
    },
    {
      category: 'Matches',
      items: [
        { path: '/matches', icon: '⚔️', label: 'Match History' },
      ]
    },
    {
      category: 'Blogs',
      items: [
        { path: '/blogs', icon: '📰', label: 'Blog Management' },
        { path: '/blogs/add', icon: '➕', label: 'Post Blog' },
      ]
    },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 dark:bg-gray-800 h-screen transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Link to="" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-white">Admin Panel</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white p-1"
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-6 px-3">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.category && sidebarOpen && (
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-2 px-3">
                  {item.category}
                </div>
              )}
              
              <div className="space-y-1">
                {item.items ? (
                  item.items.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive(subItem.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-lg">{subItem.icon}</span>
                      {sidebarOpen && <span>{subItem.label}</span>}
                    </Link>
                  ))
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Info */}
      {sidebarOpen && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400">
            <p>Admin Panel v1.0</p>
            <p className="mt-1">© {new Date().getFullYear()} Code Arena</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;