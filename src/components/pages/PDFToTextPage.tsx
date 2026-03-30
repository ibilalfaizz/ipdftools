"use client";

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import PDFToTextConverter from '../PDFToTextConverter';

const PDFToTextPage = () => {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <PDFToTextConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PDFToTextPage;
