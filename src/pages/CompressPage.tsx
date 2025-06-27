
import React from 'react';
import PDFCompressor from '../components/PDFCompressor';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CompressPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PDFCompressor />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompressPage;
