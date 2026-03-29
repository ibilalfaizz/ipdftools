"use client";

import React from 'react';
import PDFSplitter from '../PDFSplitter';
import Header from '../Header';
import Footer from '../Footer';
import SEOHead from '../SEOHead';

const SplitPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <SEOHead toolName="split" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PDFSplitter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SplitPage;
