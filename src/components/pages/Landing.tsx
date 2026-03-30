"use client";

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
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Header from "../Header";
import Footer from "../Footer";
import { useLanguage } from "@/contexts/LanguageContext";

/** One uniform treatment for all tool icons and CTAs (mint on dark teal). */
const toolIconClass =
  "inline-flex p-4 rounded-full mb-4 mx-auto bg-[#103c44] text-[#d6ffd2] ring-1 ring-[#d6ffd2]/20 group-hover:scale-110 transition-transform duration-300";

const Landing = () => {
  const { t, getLocalizedPath } = useLanguage();

  const pdfToolFeatures = [
    {
      icon: <Merge className="w-8 h-8" />,
      title: t("nav.merge"),
      description: t("landing.merge_desc"),
      path: "/merge-pdf",
      available: true,
    },
    {
      icon: <Split className="w-8 h-8" />,
      title: t("nav.split"),
      description: t("landing.split_desc"),
      path: "/split-pdf",
      available: true,
    },
    {
      icon: <Minimize className="w-8 h-8" />,
      title: t("nav.compress"),
      description: t("landing.compress_desc"),
      path: "/compress-pdf",
      available: true,
    },
    {
      icon: <RotateCw className="w-8 h-8" />,
      title: t("nav.rotate"),
      description: t("landing.rotate_desc"),
      path: "/rotate-pdf",
      available: true,
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t("nav.pdf_to_word"),
      description: t("landing.pdf_to_word_desc"),
      path: "/pdf-to-word",
      available: true,
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: t("nav.pdf_to_jpg"),
      description: t("landing.pdf_to_jpg_desc"),
      path: "/pdf-to-jpg",
      available: true,
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t("nav.pdf_to_text"),
      description: t("landing.pdf_to_text_desc"),
      path: "/pdf-to-text",
      available: true,
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: t("nav.word_to_pdf"),
      description: t("landing.word_to_pdf_desc"),
      path: "/word-to-pdf",
      available: true,
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: t("nav.jpg_to_pdf"),
      description: t("landing.jpg_to_pdf_desc"),
      path: "/jpg-to-pdf",
      available: true,
    },
  ];

  const imageToolFeatures = [
    {
      icon: <Maximize2 className="w-8 h-8" />,
      title: t("nav.image_resize"),
      description: t("landing.image_resize_desc"),
      path: "/bulk-image-resize",
      available: true,
    },
    {
      icon: <Minimize2 className="w-8 h-8" />,
      title: t("nav.image_compress"),
      description: t("landing.image_compress_desc"),
      path: "/bulk-image-compress",
      available: true,
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: t("nav.image_webp"),
      description: t("landing.image_webp_desc"),
      path: "/bulk-image-webp",
      available: true,
    },
  ];

  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <section
          className="text-center mb-20 max-w-4xl mx-auto pt-2 sm:pt-6"
          aria-labelledby="landing-hero-heading"
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#d6ffd2] mb-6">
            {t("landing.hero_eyebrow")}
          </p>
          <h1
            id="landing-hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.12] mb-6"
          >
            <span>{t("landing.hero_headline_before")}</span>
            <span className="text-[#d6ffd2] [text-shadow:0_0_26px_rgba(214,255,210,0.55),0_0_52px_rgba(214,255,210,0.22)]">
              {t("landing.hero_headline_highlight")}
            </span>
            <span>{t("landing.hero_headline_after")}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("landing.hero_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              asChild
              className="min-w-[200px] bg-[#d6ffd2] text-[#00232d] hover:bg-[#d6ffd2]/90 font-semibold"
            >
              <a href="#pdf-tools">{t("landing.hero_cta_primary")}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-w-[200px] border-2 border-[#d6ffd2]/35 bg-[#103c44]/50 text-[#d6ffd2] hover:bg-[#103c44] hover:text-[#d6ffd2]"
            >
              <a href="#image-tools">{t("landing.hero_cta_secondary")}</a>
            </Button>
          </div>
        </section>

        <section
          id="pdf-tools"
          className="max-w-6xl mx-auto scroll-mt-24 mb-20"
          aria-labelledby="pdf-tools-heading"
        >
          <h2
            id="pdf-tools-heading"
            className="text-2xl sm:text-3xl font-bold text-center text-[#d6ffd2] mb-10"
          >
            {t("nav.pdf_tools")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pdfToolFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border border-border bg-[#103c44]/40 backdrop-blur-sm hover:bg-[#103c44]/55"
              >
                <CardHeader className="text-center pb-4">
                  <div className={toolIconClass}>{feature.icon}</div>
                  <CardTitle className="text-2xl font-bold text-[#d6ffd2]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-[#d6ffd2]/75 mb-6 text-lg">
                    {feature.description}
                  </p>
                  {feature.available ? (
                    <Button
                      asChild
                      className="w-full bg-[#d6ffd2] text-[#00232d] hover:bg-[#d6ffd2]/90 border-0 font-semibold"
                    >
                      <Link href={getLocalizedPath(feature.path)}>
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
        </section>

        <section
          id="image-tools"
          className="max-w-6xl mx-auto scroll-mt-24"
          aria-labelledby="image-tools-heading"
        >
          <h2
            id="image-tools-heading"
            className="text-2xl sm:text-3xl font-bold text-center text-[#d6ffd2] mb-10"
          >
            {t("nav.image_tools")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageToolFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border border-border bg-[#103c44]/40 backdrop-blur-sm hover:bg-[#103c44]/55"
              >
                <CardHeader className="text-center pb-4">
                  <div className={toolIconClass}>{feature.icon}</div>
                  <CardTitle className="text-2xl font-bold text-[#d6ffd2]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-[#d6ffd2]/75 mb-6 text-lg">
                    {feature.description}
                  </p>
                  {feature.available ? (
                    <Button
                      asChild
                      className="w-full bg-[#d6ffd2] text-[#00232d] hover:bg-[#d6ffd2]/90 border-0 font-semibold"
                    >
                      <Link href={getLocalizedPath(feature.path)}>
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
        </section>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-[#d6ffd2] mb-8">
            {t("landing.why_choose_title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#103c44]/80 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-[#d6ffd2]/20">
                <FileText className="h-8 w-8 text-[#d6ffd2]" />
              </div>
              <h3 className="text-xl font-semibold text-[#d6ffd2] mb-2">
                {t("landing.secure_title")}
              </h3>
              <p className="text-[#d6ffd2]/75">
                {t("landing.secure_desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#103c44]/80 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-[#d6ffd2]/20">
                <Minimize className="h-8 w-8 text-[#d6ffd2]" />
              </div>
              <h3 className="text-xl font-semibold text-[#d6ffd2] mb-2">
                {t("landing.fast_title")}
              </h3>
              <p className="text-[#d6ffd2]/75">
                {t("landing.fast_desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#103c44]/80 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-[#d6ffd2]/20">
                <Merge className="h-8 w-8 text-[#d6ffd2]" />
              </div>
              <h3 className="text-xl font-semibold text-[#d6ffd2] mb-2">
                {t("landing.easy_title")}
              </h3>
              <p className="text-[#d6ffd2]/75">
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
