
import React from 'react';
import { FileText, Merge, Split, Minimize, RotateCw, ArrowRight, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Landing = () => {
  const features = [
    {
      icon: <Merge className="w-8 h-8" />,
      title: "Merge PDFs",
      description: "Combine multiple PDF files into a single document with ease.",
      path: "/merge",
      color: "from-blue-500 to-purple-500",
      available: true
    },
    {
      icon: <Split className="w-8 h-8" />,
      title: "Split PDFs",
      description: "Extract pages from your PDF or split into multiple documents.",
      path: "/split",
      color: "from-orange-500 to-red-500",
      available: true
    },
    {
      icon: <Minimize className="w-8 h-8" />,
      title: "Compress PDFs",
      description: "Reduce PDF file size while maintaining quality.",
      path: "/compress",
      color: "from-green-500 to-teal-500",
      available: true
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Convert to PDF",
      description: "Convert various file formats (DOC, JPG, PNG, etc.) to PDF.",
      path: "/to-pdf",
      color: "from-green-500 to-blue-500",
      available: true
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Convert from PDF",
      description: "Convert PDF files to various formats (JPG, PNG, TXT, etc.).",
      path: "/from-pdf",
      color: "from-purple-500 to-pink-500",
      available: true
    },
    {
      icon: <RotateCw className="w-8 h-8" />,
      title: "Rotate PDFs",
      description: "Rotate PDF pages to the correct orientation.",
      path: "/rotate",
      color: "from-purple-500 to-pink-500",
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            PDF Tools Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            The ultimate collection of PDF tools. Merge, split, compress, convert, and rotate your documents 
            with professional-grade quality. Fast, secure, and completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Link to="/merge">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex p-4 bg-gradient-to-r ${feature.color} rounded-full mb-4 mx-auto text-white group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 text-lg">
                  {feature.description}
                </p>
                {feature.available ? (
                  <Button asChild className={`w-full bg-gradient-to-r ${feature.color} hover:shadow-lg transition-all duration-300`}>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose Our PDF Tools?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">100% Secure</h3>
              <p className="text-gray-600">All processing happens in your browser. Your files never leave your device.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Minimize className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">Lightning-fast processing with no file size limits or watermarks.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Merge className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy to Use</h3>
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
