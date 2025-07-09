
import React from 'react';
import PDFMerger from '../components/PDFMerger';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';

const MergePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SEOHead toolName="merge" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PDFMerger />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MergePage;
