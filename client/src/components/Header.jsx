import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout, activeUsers } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <NavLink to="/" className="text-xl font-bold text-slate-900">Code Arena</NavLink>
          {user && (
            <>
              <NavLink to="/matchmaking" className="text-slate-600 hover:text-slate-900 transition-colors">Matchmaking</NavLink>
              <NavLink to="/practice" className="text-slate-600 hover:text-slate-900 transition-colors">Practice</NavLink>
              <NavLink to="/leaderboard" className="text-slate-600 hover:text-slate-900 transition-colors">Leaderboard</NavLink>
              {user.role === 'admin' && (
                      <>
                        <NavLink
                          to="/admin"
                          className="text-amber-500 hover:text-amber-600 transition-colors"
                        >
                          Admin
                        </NavLink>

                        <NavLink
                          to="/admin/problems"
                          className="text-amber-500 hover:text-amber-600 transition-colors"
                        >
                          Manage Problems
                        </NavLink>
                      </>
                    )}
       </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-slate-600 font-medium">Hello, {user.username}</span>
              <div className="flex items-center text-sm text-green-500 font-semibold">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                <span>{activeUsers} Active</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-800 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-x-2">
              <NavLink to="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Login</NavLink>
              <NavLink to="/register" className="bg-amber-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-amber-600 transition-colors">Register</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;