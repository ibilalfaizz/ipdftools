"use client";

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import SEOHead from '../SEOHead';
import PDFToWordConverter from '../PDFToWordConverter';

const PDFToWordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <SEOHead toolName="pdf_to_word" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PDFToWordConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PDFToWordPage;
