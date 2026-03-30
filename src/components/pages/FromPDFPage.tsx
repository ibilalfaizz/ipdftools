
import React from 'react';
import FromPDFConverter from '../FromPDFConverter';
import Header from '../Header';
import Footer from '../Footer';

const FromPDFPage = () => {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <FromPDFConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FromPDFPage;
