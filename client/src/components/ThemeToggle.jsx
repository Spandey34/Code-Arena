import React, { useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle = ({ showLabel = false, compact = false }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon size={20} className="text-gray-600 dark:text-gray-400" />
        ) : (
          <Sun size={20} className="text-amber-400" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon size={20} className="text-gray-600 dark:text-gray-400" />
          {showLabel && <span className="font-medium text-sm">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun size={20} className="text-amber-400" />
          {showLabel && <span className="font-medium text-sm">Light Mode</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;