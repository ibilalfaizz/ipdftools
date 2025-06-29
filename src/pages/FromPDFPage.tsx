
import React from 'react';
import FromPDFConverter from '../components/FromPDFConverter';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FromPDFPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <FromPDFConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FromPDFPage;
