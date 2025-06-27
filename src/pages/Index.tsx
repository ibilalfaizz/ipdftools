
import React from 'react';
import PDFMerger from '../components/PDFMerger';
import PDFSplitter from '../components/PDFSplitter';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            PDF Tools Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful PDF tools to merge, split, compress, and rotate your documents. 
            Fast, secure, and easy to use.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-16">
          <PDFMerger />
          <PDFSplitter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
