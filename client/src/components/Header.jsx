import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  Menu,
  X,
  LogOut,
  User,
  Sword,
  Trophy,
  BookOpen,
  Shield,
  Settings,
  ChevronDown,
  Code
} from 'lucide-react';

const Header = () => {
  const { user, logout, activeUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef(null);
  const adminButtonRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target) &&
        adminButtonRef.current &&
        !adminButtonRef.current.contains(event.target)
      ) {
        setIsAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
    setIsAdminDropdownOpen(false);
  };

  const toggleAdminDropdown = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
  };

  const navLinks = [
    { to: '/matchmaking', label: 'Matchmaking', icon: <Sword size={18} />, requiresAuth: true },
    { to: '/practice', label: 'Practice', icon: <BookOpen size={18} />, requiresAuth: true },
    { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl py-2'
            : 'bg-white dark:bg-gray-900 py-4'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center space-x-3"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAdminDropdownOpen(false);
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Code size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-amber-600 dark:from-white dark:to-amber-400 bg-clip-text text-transparent">
                  Code Arena
                </h1>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                  <span>{activeUsers || 0} online</span>
                </div>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                if (link.requiresAuth && !user) return null;
                const isActive = location.pathname === link.to;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`
                      flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-purple-600/20 text-amber-600 dark:text-amber-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    {link.icon}
                    <span className="font-semibold">{link.label}</span>
                  </NavLink>
                );
              })}

              {/* Admin Dropdown */}
              {user?.role === 'admin' && (
                <div className="relative" ref={adminDropdownRef}>
                  <button
                    ref={adminButtonRef}
                    onClick={toggleAdminDropdown}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isAdminDropdownOpen
                        ? 'bg-gradient-to-r from-amber-500/20 to-purple-600/20 text-amber-600 dark:text-amber-400'
                        : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                  >
                    <Shield size={18} />
                    <span className="font-semibold">Admin</span>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {isAdminDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <NavLink
                        to="/admin"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings size={18} />
                        <span>Dashboard</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* User Profile / Auth */}
              {user ? (
                <>
                  {/* User Menu Desktop */}
                  <div className="hidden lg:flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role === 'admin' ? 'Admin' : 'Coder'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {isMobileMenuOpen ? (
                      <X size={24} className="text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Menu size={24} className="text-gray-700 dark:text-gray-300" />
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                  >
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-900 z-50 lg:hidden">
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                >
                  <X size={24} />
                </button>
              </div>
              
              {user && (
                <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.role === 'admin' ? 'Admin' : 'Coder'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {navLinks.map((link) => {
                  if (link.requiresAuth && !user) return null;
                  const isActive = location.pathname === link.to;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors
                        ${isActive
                          ? 'bg-gradient-to-r from-amber-500/20 to-purple-600/20 text-amber-600 dark:text-amber-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}

                {/* Admin Link in Mobile */}
                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
                  >
                    <Shield size={18} />
                    <span>Admin Dashboard</span>
                  </NavLink>
                )}

                <div className="pt-4">
                  <ThemeToggle />
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <NavLink
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                    >
                      Get Started
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;