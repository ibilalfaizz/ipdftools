
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JPGToPDFConverter from '../components/JPGToPDFConverter';

const JPGToPDFPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
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
