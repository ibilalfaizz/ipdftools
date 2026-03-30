
import React from 'react';
import ToPDFConverter from '../ToPDFConverter';
import Header from '../Header';
import Footer from '../Footer';

const ToPDFPage = () => {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ToPDFConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ToPDFPage;
