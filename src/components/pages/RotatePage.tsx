"use client";

import React from 'react';
import PDFRotator from '../PDFRotator';
import Header from '../Header';
import Footer from '../Footer';

const RotatePage = () => {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <PDFRotator />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RotatePage;
