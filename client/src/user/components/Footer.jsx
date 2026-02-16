import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              <span className="text-xl font-bold">Code Arena</span>
            </div>
            <p className="mt-2 text-gray-400">
              Competitive programming platform for developers
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="/about" className="text-gray-400 hover:text-white">
              About
            </a>
            <a href="/contact" className="text-gray-400 hover:text-white">
              Contact
            </a>
            <a href="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Code Arena. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;