
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import JPGToPDFConverter from '../components/JPGToPDFConverter';

const JPGToPDFPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <SEOHead toolName="jpg_to_pdf" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <JPGToPDFConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JPGToPDFPage;
