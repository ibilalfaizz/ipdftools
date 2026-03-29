"use client";

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import SEOHead from '../SEOHead';
import PDFToJPGConverter from '../PDFToJPGConverter';

const PDFToJPGPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <SEOHead toolName="pdf_to_jpg" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PDFToJPGConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PDFToJPGPage;
