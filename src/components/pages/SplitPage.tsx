"use client";

import React from 'react';
import PDFSplitter from '../PDFSplitter';
import Header from '../Header';
import Footer from '../Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const SplitPage = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden pb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">{t('nav.split')}</CardTitle>
              <p className="text-gray-600">{t('landing.split_desc')}</p>
            </CardHeader>
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
