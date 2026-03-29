"use client";

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import SEOHead from '../SEOHead';
import PDFToTextConverter from '../PDFToTextConverter';

const PDFToTextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <SEOHead toolName="pdf_to_text" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PDFToTextConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PDFToTextPage;
