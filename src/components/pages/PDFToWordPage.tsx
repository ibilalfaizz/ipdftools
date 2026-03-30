"use client";

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import PDFToWordConverter from '../PDFToWordConverter';

const PDFToWordPage = () => {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <PDFToWordConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PDFToWordPage;
