
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="brand-text-dark font-medium mb-2">
            © 2024 iPDFTOOLS. Built with React & TailwindCSS.
          </p>
          <p className="text-sm text-gray-500">
            All processing is done securely in your browser. Your files are never stored on our servers.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Professional PDF tools for everyone - Free, Fast, and Secure
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
