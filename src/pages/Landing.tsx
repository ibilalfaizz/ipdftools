
import React from 'react';
import { FileText, Merge, Split, Minimize, RotateCw, ArrowRight, Upload, Download, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

const Landing = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <Merge className="w-8 h-8" />,
      title: t('nav.merge'),
      description: "Combine multiple PDF files into a single document with ease.",
      path: "/merge",
      color: "from-red-500 to-red-600",
      available: true
    },
    {
      icon: <Split className="w-8 h-8" />,
      title: t('nav.split'),
      description: "Extract pages from your PDF or split into multiple documents.",
      path: "/split",
      color: "from-orange-500 to-red-500",
      available: true
    },
    {
      icon: <Minimize className="w-8 h-8" />,
      title: t('nav.compress'),
      description: "Reduce PDF file size while maintaining quality.",
      path: "/compress",
      color: "from-green-500 to-teal-500",
      available: true
    },
    {
      icon: <RotateCw className="w-8 h-8" />,
      title: t('nav.rotate'),
      description: "Rotate PDF pages to the correct orientation.",
      path: "/rotate",
      color: "from-indigo-500 to-cyan-500",
      available: true
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t('nav.pdf_to_word'),
      description: "Convert PDF files to editable Word documents.",
      path: "/pdf-to-word",
      color: "from-blue-500 to-green-500",
      available: true
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: t('nav.pdf_to_jpg'),
      description: "Convert PDF pages to high-quality JPG images.",
      path: "/pdf-to-jpg",
      color: "from-purple-500 to-pink-500",
      available: true
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t('nav.pdf_to_text'),
      description: "Extract text content from PDF documents.",
      path: "/pdf-to-text",
      color: "from-green-500 to-blue-500",
      available: true
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: t('nav.word_to_pdf'),
      description: "Convert Word documents to PDF format.",
      path: "/word-to-pdf",
      color: "from-blue-500 to-purple-500",
      available: true
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: t('nav.jpg_to_pdf'),
      description: "Convert JPG and PNG images to PDF documents.",
      path: "/jpg-to-pdf",
      color: "from-orange-500 to-yellow-500",
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex p-4 brand-gradient rounded-full mb-4">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold brand-accent mb-6">
            iPDFTOOLS
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            The ultimate collection of PDF tools. Merge, split, compress, convert, and rotate your documents 
            with professional-grade quality. Fast, secure, and completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="brand-gradient hover:opacity-90">
              <Link to="/merge">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm hover:bg-red-50/30">
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex p-4 bg-gradient-to-r ${feature.color} rounded-full mb-4 mx-auto text-white group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-2xl font-bold brand-text-dark">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 text-lg">
                  {feature.description}
                </p>
                {feature.available ? (
                  <Button asChild className={`w-full bg-gradient-to-r ${feature.color} hover:shadow-lg transition-all duration-300 border-0`}>
                    <Link to={feature.path}>
                      Use Tool <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features List */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold brand-text-dark mb-8">Why Choose iPDFTOOLS?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 brand-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 brand-accent" />
              </div>
              <h3 className="text-xl font-semibold brand-text-dark mb-2">100% Secure</h3>
              <p className="text-gray-600">All processing happens in your browser. Your files never leave your device.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 brand-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Minimize className="h-8 w-8 brand-accent" />
              </div>
              <h3 className="text-xl font-semibold brand-text-dark mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">Lightning-fast processing with no file size limits or watermarks.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 brand-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Merge className="h-8 w-8 brand-accent" />
              </div>
              <h3 className="text-xl font-semibold brand-text-dark mb-2">Easy to Use</h3>
              <p className="text-gray-600">Intuitive interface that works on any device. No registration required.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
