"use client";

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import WordToPDFConverter from '../WordToPDFConverter';

const WordToPDFPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <WordToPDFConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WordToPDFPage;
