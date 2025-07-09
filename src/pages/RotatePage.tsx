
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import PDFRotator from '../components/PDFRotator';

const RotatePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <SEOHead toolName="rotate" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PDFRotator />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RotatePage;
