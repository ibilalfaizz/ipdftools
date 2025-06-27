
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">
            © 2024 PDF Tools Hub. Built with React & TailwindCSS.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            All processing is done securely. Your files are not stored on our servers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
