
import React from "react";
import {
  FileText,
  Merge,
  Split,
  Minimize,
  RotateCw,
  ArrowRight,
  Upload,
  Download,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEOHead from "../components/SEOHead";
import { useLanguage } from "../contexts/LanguageContext";

const Landing = () => {
  const { t, getLocalizedPath } = useLanguage();

  const features = [
    {
      icon: <Merge className="w-8 h-8" />,
      title: t("nav.merge"),
      description: t("landing.merge_desc"),
      path: "/merge",
      color: "from-red-500 to-red-600",
      available: true,
    },
    {
      icon: <Split className="w-8 h-8" />,
      title: t("nav.split"),
      description: t("landing.split_desc"),
      path: "/split",
      color: "from-orange-500 to-red-500",
      available: true,
    },
    {
      icon: <Minimize className="w-8 h-8" />,
      title: t("nav.compress"),
      description: t("landing.compress_desc"),
      path: "/compress",
      color: "from-green-500 to-teal-500",
      available: true,
    },
    {
      icon: <RotateCw className="w-8 h-8" />,
      title: t("nav.rotate"),
      description: t("landing.rotate_desc"),
      path: "/rotate",
      color: "from-indigo-500 to-cyan-500",
      available: true,
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t("nav.pdf_to_word"),
      description: t("landing.pdf_to_word_desc"),
      path: "/pdf-to-word",
      color: "from-blue-500 to-green-500",
      available: true,
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: t("nav.pdf_to_jpg"),
      description: t("landing.pdf_to_jpg_desc"),
      path: "/pdf-to-jpg",
      color: "from-purple-500 to-pink-500",
      available: true,
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t("nav.pdf_to_text"),
      description: t("landing.pdf_to_text_desc"),
      path: "/pdf-to-text",
      color: "from-green-500 to-blue-500",
      available: true,
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: t("nav.word_to_pdf"),
      description: t("landing.word_to_pdf_desc"),
      path: "/word-to-pdf",
      color: "from-blue-500 to-purple-500",
      available: true,
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: t("nav.jpg_to_pdf"),
      description: t("landing.jpg_to_pdf_desc"),
      path: "/jpg-to-pdf",
      color: "from-orange-500 to-yellow-500",
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <SEOHead />
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex p-4 rounded-full mb-4 brand-gradient">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold brand-accent mb-6">{t("landing.hero_title")}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t("landing.hero_subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm hover:bg-red-50/30"
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`inline-flex p-4 bg-gradient-to-r ${feature.color} rounded-full mb-4 mx-auto text-white group-hover:scale-110 transition-transform duration-300`}
                >
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
                  <Button
                    asChild
                    className={`w-full bg-gradient-to-r ${feature.color} hover:shadow-lg transition-all duration-300 border-0`}
                  >
                    <Link to={getLocalizedPath(feature.path)}>
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
          <h2 className="text-3xl font-bold brand-text-dark mb-8">
            {t("landing.why_choose_title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 brand-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 brand-accent" />
              </div>
              <h3 className="text-xl font-semibold brand-text-dark mb-2">
                {t("landing.secure_title")}
              </h3>
              <p className="text-gray-600">
                {t("landing.secure_desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 brand-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Minimize className="h-8 w-8 brand-accent" />
              </div>
              <h3 className="text-xl font-semibold brand-text-dark mb-2">
                {t("landing.fast_title")}
              </h3>
              <p className="text-gray-600">
                {t("landing.fast_desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 brand-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Merge className="h-8 w-8 brand-accent" />
              </div>
              <h3 className="text-xl font-semibold brand-text-dark mb-2">
                {t("landing.easy_title")}
              </h3>
              <p className="text-gray-600">
                {t("landing.easy_desc")}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
