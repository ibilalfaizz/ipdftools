"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import ToolSearch from "./ToolSearch";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const pathname = usePathname();
  const { t, getLocalizedPath, getOriginalPath } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentOriginalPath = getOriginalPath(pathname);

  const imageTools = [
    {
      href: "/bulk-image-resize",
      label: t("nav.image_resize"),
      description: t("landing.image_resize_desc"),
    },
    {
      href: "/bulk-image-compress",
      label: t("nav.image_compress"),
      description: t("landing.image_compress_desc"),
    },
    {
      href: "/bulk-image-webp",
      label: t("nav.image_webp"),
      description: t("landing.image_webp_desc"),
    },
    {
      href: "/bulk-image-jpg",
      label: t("nav.image_jpg"),
      description: t("landing.image_jpg_desc"),
    },
    {
      href: "/bulk-image-gif",
      label: t("nav.image_gif"),
      description: t("landing.image_gif_desc"),
    },
    {
      href: "/image-crop",
      label: t("nav.image_crop"),
      description: t("landing.image_crop_desc"),
    },
    {
      href: "/image-rotate",
      label: t("nav.image_rotate"),
      description: t("landing.image_rotate_desc"),
    },
    {
      href: "/image-blur-face",
      label: t("nav.image_blur_face"),
      description: t("landing.image_blur_face_desc"),
    },
    {
      href: "/image-remove-background",
      label: t("nav.image_remove_bg"),
      description: t("landing.image_remove_bg_desc"),
    },
    {
      href: "/image-watermark",
      label: t("nav.image_watermark"),
      description: t("landing.image_watermark_desc"),
    },
    {
      href: "/image-ocr",
      label: t("nav.image_ocr"),
      description: t("landing.image_ocr_desc"),
    },
    {
      href: "/image-heic-to-jpg",
      label: t("nav.image_heic_jpg"),
      description: t("landing.image_heic_jpg_desc"),
    },
  ];

  const imageToolHrefs = [
    "/bulk-image-resize",
    "/bulk-image-compress",
    "/bulk-image-webp",
    "/bulk-image-jpg",
    "/bulk-image-gif",
    "/image-crop",
    "/image-rotate",
    "/image-blur-face",
    "/image-remove-background",
    "/image-watermark",
    "/image-ocr",
    "/image-heic-to-jpg",
  ];
  const onImageToolRoute = imageToolHrefs.includes(currentOriginalPath);

  const allTools = [
    {
      href: "/merge-pdf",
      label: t("nav.merge"),
      description: "Combine multiple PDF files into one",
    },
    {
      href: "/split-pdf",
      label: t("nav.split"),
      description: "Split PDF into multiple documents",
    },
    {
      href: "/compress-pdf",
      label: t("nav.compress"),
      description: "Reduce PDF file size",
    },
    {
      href: "/rotate-pdf",
      label: t("nav.rotate"),
      description: "Rotate PDF pages",
    },
    {
      href: "/pdf-to-word",
      label: t("nav.pdf_to_word"),
      description: "Convert PDF to Word documents",
    },
    {
      href: "/pdf-to-jpg",
      label: t("nav.pdf_to_jpg"),
      description: "Convert PDF to JPG images",
    },
    {
      href: "/pdf-to-text",
      label: t("nav.pdf_to_text"),
      description: "Extract text from PDF",
    },
    {
      href: "/word-to-pdf",
      label: t("nav.word_to_pdf"),
      description: "Convert Word to PDF",
    },
    {
      href: "/jpg-to-pdf",
      label: t("nav.jpg_to_pdf"),
      description: "Convert images to PDF",
    },
  ];

  const pdfToolHrefs = allTools.map((tool) => tool.href);
  const onPdfToolRoute = pdfToolHrefs.includes(currentOriginalPath);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-[60] overflow-visible">
      <div className="container mx-auto px-3 sm:px-4 py-2 md:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4 md:min-h-[44px]">
          <div className="flex items-center justify-between gap-2 shrink-0">
            <Link
              href={getLocalizedPath("/")}
              className="flex items-center min-w-0 shrink"
            >
              <img
                src="/ipdf-logo.png"
                alt="Logo"
                className="h-12 w-auto max-h-12 sm:h-14 sm:max-h-14 md:h-20 md:max-h-none object-contain object-left"
              />
            </Link>

            <div className="flex md:hidden items-center gap-0.5 shrink-0">
              <LanguageSelector triggerClassName="w-10 px-1 sm:w-11 shrink-0 border-primary/25" />

              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-primary hover:bg-card hover:text-primary"
                    aria-label={t("tool_search.search_tools")}
                  >
                    <Search className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-primary hover:bg-card hover:text-primary"
                    aria-label={t("nav.menu")}
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full max-w-sm border-l border-primary/15 bg-background text-foreground overflow-y-auto gap-0 p-0 pt-12 pb-8 flex flex-col tool-side-panel"
                >
                  <SheetHeader className="px-4 pb-2 text-left border-b border-primary/15">
                    <SheetTitle className="text-foreground">
                      {t("nav.menu")}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="px-4 py-4 border-b border-primary/15">
                    <ToolSearch
                      variant="header"
                      onNavigate={closeMobile}
                    />
                  </div>
                  <nav className="flex flex-col gap-6 px-4 pt-4 pb-6">
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/70 mb-2">
                        {t("nav.pdf_tools")}
                      </h3>
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        {allTools.map((tool) => (
                          <li key={tool.href} className="min-w-0">
                            <Link
                              href={getLocalizedPath(tool.href)}
                              onClick={closeMobile}
                              className="block rounded-md px-2 py-2.5 text-sm text-primary/95 hover:bg-card hover:text-primary truncate"
                              title={tool.label}
                            >
                              {tool.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/70 mb-2">
                        {t("nav.image_tools")}
                      </h3>
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        {imageTools.map((tool) => (
                          <li key={tool.href} className="min-w-0">
                            <Link
                              href={getLocalizedPath(tool.href)}
                              onClick={closeMobile}
                              className="block rounded-md px-2 py-2.5 text-sm text-primary/95 hover:bg-card hover:text-primary truncate"
                              title={tool.label}
                            >
                              {tool.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="hidden md:flex w-auto flex-row items-center justify-end gap-4 lg:gap-6 shrink-0">
            <div className="w-[min(18rem,28vw)] max-w-sm min-w-[11rem]">
              <ToolSearch variant="header" />
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              <LanguageSelector />

              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={
                        onPdfToolRoute
                          ? "text-primary"
                          : "text-foreground/80 hover:text-primary"
                      }
                    >
                      {t("nav.pdf_tools")}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[min(520px,90vw)] grid-cols-2 max-h-[70vh] overflow-y-auto">
                        {allTools.map((tool) => (
                          <Link
                            key={tool.href}
                            href={getLocalizedPath(tool.href)}
                            className="group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none group-hover:text-primary">
                              {tool.label}
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {tool.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={
                        onImageToolRoute
                          ? "text-primary"
                          : "text-foreground/80 hover:text-primary"
                      }
                    >
                      {t("nav.image_tools")}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[min(480px,90vw)] grid-cols-2">
                        {imageTools.map((tool) => (
                          <Link
                            key={tool.href}
                            href={getLocalizedPath(tool.href)}
                            className="group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none group-hover:text-primary">
                              {tool.label}
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {tool.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
