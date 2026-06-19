import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              Code Arena
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/practice"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Practice
            </Link>
            <Link
              to="/contests"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contests
            </Link>
            <Link
              to="/match"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              1v1 Match
            </Link>
            <Link
              to="/leaderboard"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Leaderboard
            </Link>
            <Link
              to="/submissions"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Submissions
            </Link>
            <Link
              to="/blogs"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Blogs
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>

            {/* User Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span>{user.username}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {user.rating}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg hidden group-hover:block before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/practice"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Practice
              </Link>
              <Link
                to="/contests"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Contests
              </Link>
              <Link
                to="/match"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                1v1 Match
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <Link
                to="/submissions"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Submissions
              </Link>
              <Link
                to="/blogs"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Blogs
              </Link>
              {user ? (
                <>
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.username}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-2 w-full text-left text-gray-700 dark:text-gray-300"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
