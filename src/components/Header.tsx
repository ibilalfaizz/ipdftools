
import React from 'react';
import { FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { href: "/merge", label: "Merge", color: "hover:text-blue-600" },
    { href: "/split", label: "Split", color: "hover:text-orange-600" },
    { href: "/compress", label: "Compress", color: "hover:text-green-600" },
    { href: "/to-pdf", label: "To PDF", color: "hover:text-green-600" },
    { href: "/from-pdf", label: "From PDF", color: "hover:text-purple-600" },
    { href: "/rotate", label: "Rotate (Coming Soon)", color: "text-gray-400 cursor-not-allowed" }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF Tools
            </span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`font-medium transition-colors ${
                  location.pathname === item.href 
                    ? 'text-blue-600' 
                    : `text-gray-600 ${item.color}`
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
