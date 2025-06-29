
import React from 'react';
import ToPDFConverter from '../components/ToPDFConverter';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ToPDFPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ToPDFConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ToPDFPage;
