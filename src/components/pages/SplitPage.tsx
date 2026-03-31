"use client";

import React from 'react';
import PDFSplitter from '../PDFSplitter';
import Header from '../Header';
import Footer from '../Footer';
import { Card, CardContent } from '@/components/ui/card';

const SplitPage = () => {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="tool-page-card">
            <CardContent className="p-0">
              <PDFSplitter />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SplitPage;
