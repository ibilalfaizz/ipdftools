"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
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

  // Get the original path for comparison
  const currentOriginalPath = getOriginalPath(pathname);

  const imageTools = [
    {
      href: "/image-resize",
      label: t("nav.image_resize"),
      description: t("landing.image_resize_desc"),
    },
    {
      href: "/image-compress",
      label: t("nav.image_compress"),
      description: t("landing.image_compress_desc"),
    },
    {
      href: "/image-webp",
      label: t("nav.image_webp"),
      description: t("landing.image_webp_desc"),
    },
  ];

  const imageToolHrefs = ["/image-resize", "/image-compress", "/image-webp"];
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

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={getLocalizedPath("/")} className="flex items-center space-x-3">
            <img
              src="/ipdf-logo.png"
              alt="Logo"
              className="h-20 w-auto object-cover"
            />
          </Link>

          <div className="flex items-center space-x-4">
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
                    <div className="grid gap-3 p-4 w-[600px] max-w-[90vw] grid-cols-2 md:grid-cols-3 max-h-[70vh] overflow-y-auto">
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
                    <div className="grid gap-3 p-4 w-[420px] max-w-[90vw]">
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

            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
