import React, { useState, useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, authFetch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authFetch.post('/auth/login', { email, password });
      login(res.data, res.data.token);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error.response?.data);
      alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-300 dark:bg-amber-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home Button */}
        <NavLink 
          to="/" 
          className="absolute -top-16 left-0 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group mb-8"
        >
          <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Arena</span>
        </NavLink>

        {/* Login Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Decorative Header */}
          <div className="relative h-28 bg-gradient-to-r from-amber-500 via-amber-600 to-purple-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Code size={30} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="w-10 h-1 bg-white/50 rounded-full"></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to continue your coding journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                    placeholder="coder@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400 hover:text-amber-500 transition-colors" />
                    ) : (
                      <Eye size={18} className="text-gray-400 hover:text-amber-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              {/* Submit Button - FIXED VERSION */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                New to Code Arena?{' '}
                <NavLink 
                  to="/register" 
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:text-amber-700 dark:hover:text-amber-300 inline-flex items-center gap-1 transition-colors group"
                >
                  Create an account
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;