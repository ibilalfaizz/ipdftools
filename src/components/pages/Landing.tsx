"use client";

import React, { useMemo, useState } from "react";
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
  FileImage,
  Film,
  Crop,
  Stamp,
  ScanFace,
  Eraser,
  ScanText,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Header from "../Header";
import Footer from "../Footer";
import ToolSearch from "../ToolSearch";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/** Landing tool filter chips (matches PDF + image tools below). */
type ToolFilter =
  | "all"
  | "optimize"
  | "create"
  | "edit"
  | "convert"
  | "security";

type ToolFilterTag = Exclude<ToolFilter, "all">;

type LandingTool = {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  available: boolean;
  categories: ToolFilterTag[];
};

function toolMatchesFilter(
  categories: ToolFilterTag[],
  active: ToolFilter
): boolean {
  if (active === "all") return true;
  return categories.includes(active);
}

/** One uniform treatment for all tool icons and CTAs (mint on dark teal). */
const toolIconClass =
  "inline-flex p-4 rounded-full mb-4 mx-auto bg-card text-primary ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300";

const FILTER_CHIPS: { id: ToolFilter; labelKey: string }[] = [
  { id: "all", labelKey: "landing.filter_all" },
  { id: "optimize", labelKey: "landing.filter_optimize" },
  { id: "create", labelKey: "landing.filter_create" },
  { id: "edit", labelKey: "landing.filter_edit" },
  { id: "convert", labelKey: "landing.filter_convert" },
  { id: "security", labelKey: "landing.filter_security" },
];

const Landing = () => {
  const { t, getLocalizedPath } = useLanguage();
  const [toolFilter, setToolFilter] = useState<ToolFilter>("all");

  const pdfToolFeatures: LandingTool[] = useMemo(
    () => [
      {
        icon: <Merge className="w-8 h-8" />,
        title: t("nav.merge"),
        description: t("landing.merge_desc"),
        path: "/merge-pdf",
        available: true,
        categories: ["create"],
      },
      {
        icon: <Split className="w-8 h-8" />,
        title: t("nav.split"),
        description: t("landing.split_desc"),
        path: "/split-pdf",
        available: true,
        categories: ["edit"],
      },
      {
        icon: <Minimize className="w-8 h-8" />,
        title: t("nav.compress"),
        description: t("landing.compress_desc"),
        path: "/compress-pdf",
        available: true,
        categories: ["optimize"],
      },
      {
        icon: <RotateCw className="w-8 h-8" />,
        title: t("nav.rotate"),
        description: t("landing.rotate_desc"),
        path: "/rotate-pdf",
        available: true,
        categories: ["edit"],
      },
      {
        icon: <FileText className="w-8 h-8" />,
        title: t("nav.pdf_to_word"),
        description: t("landing.pdf_to_word_desc"),
        path: "/pdf-to-word",
        available: true,
        categories: ["convert"],
      },
      {
        icon: <Image className="w-8 h-8" />,
        title: t("nav.pdf_to_jpg"),
        description: t("landing.pdf_to_jpg_desc"),
        path: "/pdf-to-jpg",
        available: true,
        categories: ["convert"],
      },
      {
        icon: <FileText className="w-8 h-8" />,
        title: t("nav.pdf_to_text"),
        description: t("landing.pdf_to_text_desc"),
        path: "/pdf-to-text",
        available: true,
        categories: ["convert"],
      },
      {
        icon: <Upload className="w-8 h-8" />,
        title: t("nav.word_to_pdf"),
        description: t("landing.word_to_pdf_desc"),
        path: "/word-to-pdf",
        available: true,
        categories: ["convert"],
      },
      {
        icon: <Download className="w-8 h-8" />,
        title: t("nav.jpg_to_pdf"),
        description: t("landing.jpg_to_pdf_desc"),
        path: "/jpg-to-pdf",
        available: true,
        categories: ["convert"],
      },
    ],
    [t]
  );

  const imageToolFeatures: LandingTool[] = useMemo(
    () => [
      {
        icon: <Maximize2 className="w-8 h-8" />,
        title: t("nav.image_resize"),
        description: t("landing.image_resize_desc"),
        path: "/bulk-image-resize",
        available: true,
        categories: ["optimize"],
      },
      {
        icon: <Minimize2 className="w-8 h-8" />,
        title: t("nav.image_compress"),
        description: t("landing.image_compress_desc"),
        path: "/bulk-image-compress",
        available: true,
        categories: ["optimize"],
      },
      {
        icon: <Sparkles className="w-8 h-8" />,
        title: t("nav.image_webp"),
        description: t("landing.image_webp_desc"),
        path: "/bulk-image-webp",
        available: true,
        categories: ["convert"],
      },
      {
        icon: <FileImage className="w-8 h-8" />,
        title: t("nav.image_jpg"),
        description: t("landing.image_jpg_desc"),
        path: "/bulk-image-jpg",
        available: true,
        categories: ["convert"],
      },
      {
        icon: <Smartphone className="w-8 h-8" />,
        title: t("nav.image_heic_jpg"),
        description: t("landing.image_heic_jpg_desc"),
        path: "/image-heic-to-jpg",
        available: true,
        categories: ["convert"],
      },
      {
        icon: <Film className="w-8 h-8" />,
        title: t("nav.image_gif"),
        description: t("landing.image_gif_desc"),
        path: "/bulk-image-gif",
        available: true,
        categories: ["create"],
      },
      {
        icon: <Crop className="w-8 h-8" />,
        title: t("nav.image_crop"),
        description: t("landing.image_crop_desc"),
        path: "/image-crop",
        available: true,
        categories: ["edit"],
      },
      {
        icon: <RotateCw className="w-8 h-8" />,
        title: t("nav.image_rotate"),
        description: t("landing.image_rotate_desc"),
        path: "/image-rotate",
        available: true,
        categories: ["edit"],
      },
    {
      icon: <ScanFace className="w-8 h-8" />,
      title: t("nav.image_blur_face"),
      description: t("landing.image_blur_face_desc"),
      path: "/image-blur-face",
      available: true,
      categories: ["security"],
    },
    {
      icon: <Eraser className="w-8 h-8" />,
      title: t("nav.image_remove_bg"),
      description: t("landing.image_remove_bg_desc"),
      path: "/image-remove-background",
      available: true,
      categories: ["edit"],
    },
    {
      icon: <Stamp className="w-8 h-8" />,
      title: t("nav.image_watermark"),
      description: t("landing.image_watermark_desc"),
      path: "/image-watermark",
      available: true,
      categories: ["edit"],
    },
    {
      icon: <ScanText className="w-8 h-8" />,
      title: t("nav.image_ocr"),
      description: t("landing.image_ocr_desc"),
      path: "/image-ocr",
      available: true,
      categories: ["convert"],
    },
    ],
    [t]
  );

  const pdfFiltered = useMemo(
    () =>
      pdfToolFeatures.filter((f) =>
        toolMatchesFilter(f.categories, toolFilter)
      ),
    [pdfToolFeatures, toolFilter]
  );

  const imageFiltered = useMemo(
    () =>
      imageToolFeatures.filter((f) =>
        toolMatchesFilter(f.categories, toolFilter)
      ),
    [imageToolFeatures, toolFilter]
  );

  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <section
          className="text-center mb-20 max-w-4xl mx-auto pt-2 sm:pt-6"
          aria-labelledby="landing-hero-heading"
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6">
            {t("landing.hero_eyebrow")}
          </p>
          <h1
            id="landing-hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.12] mb-6"
          >
            <span>{t("landing.hero_headline_before")}</span>
            <span className="text-primary [text-shadow:0_0_26px_hsl(var(--primary)/0.55),0_0_52px_hsl(var(--primary)/0.22)]">
              {t("landing.hero_headline_highlight")}
            </span>
            <span>{t("landing.hero_headline_after")}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("landing.hero_subtitle")}
          </p>
          <div className="w-full max-w-xl mx-auto mb-10">
            <ToolSearch variant="hero" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              asChild
              className="min-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              <a href="#pdf-tools">{t("landing.hero_cta_primary")}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-w-[200px] border-2 border-primary/35 bg-card/50 text-primary hover:bg-card hover:text-primary"
            >
              <a href="#image-tools">{t("landing.hero_cta_secondary")}</a>
            </Button>
          </div>
        </section>

        <section
          className="max-w-6xl mx-auto mb-12 scroll-mt-24"
          aria-label={t("landing.filter_toolbar_aria")}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-1">
            {FILTER_CHIPS.map(({ id, labelKey }) => (
              <button
                key={id}
                type="button"
                aria-pressed={toolFilter === id}
                onClick={() => setToolFilter(id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  toolFilter === id
                    ? "border-success bg-success text-success-foreground shadow-md font-semibold"
                    : "border-primary/30 bg-card/40 text-primary/90 hover:border-primary/50 hover:bg-card/65"
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </section>

        <section
          id="pdf-tools"
          className="max-w-6xl mx-auto scroll-mt-24 mb-20"
          aria-labelledby="pdf-tools-heading"
        >
          <h2
            id="pdf-tools-heading"
            className="text-2xl sm:text-3xl font-bold text-center text-primary mb-10"
          >
            {t("nav.pdf_tools")}
          </h2>
          {pdfFiltered.length === 0 ? (
            <p className="text-center text-primary/60 text-base max-w-lg mx-auto py-6">
              {t("landing.filter_empty_pdf")}
            </p>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pdfFiltered.map((feature) => (
              <Card
                key={feature.path}
                className="group hover:shadow-xl transition-all duration-300 border border-border bg-card/40 backdrop-blur-sm hover:bg-card/55"
              >
                <CardHeader className="text-center pb-4">
                  <div className={toolIconClass}>{feature.icon}</div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-primary/75 mb-6 text-lg">
                    {feature.description}
                  </p>
                  {feature.available ? (
                    <Button
                      asChild
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 font-semibold"
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
          )}
        </section>

        <section
          id="image-tools"
          className="max-w-6xl mx-auto scroll-mt-24"
          aria-labelledby="image-tools-heading"
        >
          <h2
            id="image-tools-heading"
            className="text-2xl sm:text-3xl font-bold text-center text-primary mb-10"
          >
            {t("nav.image_tools")}
          </h2>
          {imageFiltered.length === 0 ? (
            <p className="text-center text-primary/60 text-base max-w-lg mx-auto py-6">
              {t("landing.filter_empty_image")}
            </p>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageFiltered.map((feature) => (
              <Card
                key={feature.path}
                className="group hover:shadow-xl transition-all duration-300 border border-border bg-card/40 backdrop-blur-sm hover:bg-card/55"
              >
                <CardHeader className="text-center pb-4">
                  <div className={toolIconClass}>{feature.icon}</div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-primary/75 mb-6 text-lg">
                    {feature.description}
                  </p>
                  {feature.available ? (
                    <Button
                      asChild
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 font-semibold"
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
          )}
        </section>

        <section
          className="mt-24 py-20 md:py-28 max-w-5xl mx-auto"
          aria-labelledby="why-choose-heading"
        >
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-success mb-5 md:mb-6">
              {t("landing.why_choose_eyebrow")}
            </p>
            <h2
              id="why-choose-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-normal text-white leading-tight tracking-tight mb-14 md:mb-16 max-w-3xl mx-auto"
            >
              <span className="font-normal">
                {t("landing.why_choose_headline_regular")}
              </span>
              <span className="font-bold">{t("landing.why_choose_headline_emphasis")}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-left md:text-center">
              <div>
                <h3 className="text-lg font-bold text-primary mb-3">
                  {t("landing.secure_title")}
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {t("landing.secure_desc")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-3">
                  {t("landing.fast_title")}
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {t("landing.fast_desc")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-3">
                  {t("landing.easy_title")}
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {t("landing.easy_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
