"use client";

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import JPGToPDFConverter from '../JPGToPDFConverter';

const JPGToPDFPage = () => {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <JPGToPDFConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JPGToPDFPage;
