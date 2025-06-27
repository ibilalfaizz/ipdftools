
import React from 'react';
import { FileText } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF Tools
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#merge" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Merge
            </a>
            <a href="#split" className="text-gray-400 cursor-not-allowed font-medium">
              Split (Coming Soon)
            </a>
            <a href="#compress" className="text-gray-400 cursor-not-allowed font-medium">
              Compress (Coming Soon)
            </a>
            <a href="#rotate" className="text-gray-400 cursor-not-allowed font-medium">
              Rotate (Coming Soon)
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
