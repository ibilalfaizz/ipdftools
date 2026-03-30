"use client";

import React from 'react';
import PDFCompressor from '../PDFCompressor';
import Header from '../Header';
import Footer from '../Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const CompressPage = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="tool-page-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">{t('nav.compress')}</CardTitle>
              <p className="text-muted-foreground">{t('landing.compress_desc')}</p>
            </CardHeader>
            <CardContent className="p-0">
              <PDFCompressor />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompressPage;
