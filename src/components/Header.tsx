"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Aperture,
  Crop,
  Download,
  Eraser,
  FileImage,
  FileText,
  Film,
  GitBranch,
  Image,
  LogIn,
  LogOut,
  Maximize2,
  Menu,
  Merge,
  Minimize,
  Minimize2,
  PenLine,
  RotateCw,
  ScanFace,
  ScanText,
  Search,
  Smartphone,
  Sparkles,
  Split,
  Stamp,
  Upload,
  UserRound,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import ToolSearch from "./ToolSearch";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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

type NavToolItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  featured?: boolean;
};

const Header = () => {
  const pathname = usePathname();
  const { t, getLocalizedPath, getOriginalPath } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const currentOriginalPath = getOriginalPath(pathname);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  };

  const imageTools: NavToolItem[] = [
    {
      href: "/image-workflow",
      label: t("nav.image_workflow"),
      icon: GitBranch,
      featured: true,
    },
    {
      href: "/bulk-image-resize",
      label: t("nav.image_resize"),
      icon: Maximize2,
    },
    {
      href: "/bulk-image-compress",
      label: t("nav.image_compress"),
      icon: Minimize2,
    },
    {
      href: "/bulk-image-webp",
      label: t("nav.image_webp"),
      icon: Sparkles,
    },
    {
      href: "/bulk-image-jpg",
      label: t("nav.image_jpg"),
      icon: FileImage,
    },
    {
      href: "/bulk-image-gif",
      label: t("nav.image_gif"),
      icon: Film,
    },
    {
      href: "/image-crop",
      label: t("nav.image_crop"),
      icon: Crop,
    },
    {
      href: "/image-rotate",
      label: t("nav.image_rotate"),
      icon: RotateCw,
    },
    {
      href: "/image-blur-face",
      label: t("nav.image_blur_face"),
      icon: ScanFace,
    },
    {
      href: "/image-motion-blur",
      label: t("nav.image_motion_blur"),
      icon: Aperture,
    },
    {
      href: "/image-remove-background",
      label: t("nav.image_remove_bg"),
      icon: Eraser,
    },
    {
      href: "/image-watermark",
      label: t("nav.image_watermark"),
      icon: Stamp,
    },
    {
      href: "/image-ocr",
      label: t("nav.image_ocr"),
      icon: ScanText,
    },
    {
      href: "/image-heic-to-jpg",
      label: t("nav.image_heic_jpg"),
      icon: Smartphone,
    },
  ];

  const imageToolHrefs = [
    "/image-workflow",
    "/bulk-image-resize",
    "/bulk-image-compress",
    "/bulk-image-webp",
    "/bulk-image-jpg",
    "/bulk-image-gif",
    "/image-crop",
    "/image-rotate",
    "/image-blur-face",
    "/image-motion-blur",
    "/image-remove-background",
    "/image-watermark",
    "/image-ocr",
    "/image-heic-to-jpg",
  ];
  const onImageToolRoute = imageToolHrefs.includes(currentOriginalPath);

  const allTools: NavToolItem[] = [
    {
      href: "/pdf-workflow",
      label: t("nav.pdf_workflow"),
      icon: GitBranch,
      featured: true,
    },
    {
      href: "/merge-pdf",
      label: t("nav.merge"),
      icon: Merge,
    },
    {
      href: "/split-pdf",
      label: t("nav.split"),
      icon: Split,
    },
    {
      href: "/compress-pdf",
      label: t("nav.compress"),
      icon: Minimize,
    },
    {
      href: "/rotate-pdf",
      label: t("nav.rotate"),
      icon: RotateCw,
    },
    {
      href: "/sign-pdf",
      label: t("nav.sign_pdf"),
      icon: PenLine,
    },
    {
      href: "/pdf-to-word",
      label: t("nav.pdf_to_word"),
      icon: FileText,
    },
    {
      href: "/pdf-to-jpg",
      label: t("nav.pdf_to_jpg"),
      icon: Image,
    },
    {
      href: "/pdf-to-text",
      label: t("nav.pdf_to_text"),
      icon: FileText,
    },
    {
      href: "/word-to-pdf",
      label: t("nav.word_to_pdf"),
      icon: Upload,
    },
    {
      href: "/jpg-to-pdf",
      label: t("nav.jpg_to_pdf"),
      icon: Download,
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
                        {allTools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <li key={tool.href} className="min-w-0">
                              <Link
                                href={getLocalizedPath(tool.href)}
                                onClick={closeMobile}
                                className={cn(
                                  "group flex items-center gap-1.5 rounded-md px-2 py-2.5 text-sm text-primary/95 hover:bg-card hover:text-primary truncate",
                                  tool.featured &&
                                    "border border-primary/45 bg-primary/12 font-semibold text-primary shadow-sm ring-1 ring-primary/20"
                                )}
                                title={tool.label}
                              >
                                <Icon
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    tool.featured
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-primary"
                                  )}
                                  aria-hidden
                                />
                                <span className="truncate">{tool.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/70 mb-2">
                        {t("nav.image_tools")}
                      </h3>
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        {imageTools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <li key={tool.href} className="min-w-0">
                              <Link
                                href={getLocalizedPath(tool.href)}
                                onClick={closeMobile}
                                className={cn(
                                  "group flex items-center gap-1.5 rounded-md px-2 py-2.5 text-sm text-primary/95 hover:bg-card hover:text-primary truncate",
                                  tool.featured &&
                                    "border border-primary/45 bg-primary/12 font-semibold text-primary shadow-sm ring-1 ring-primary/20"
                                )}
                                title={tool.label}
                              >
                                <Icon
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    tool.featured
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-primary"
                                  )}
                                  aria-hidden
                                />
                                <span className="truncate">{tool.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                    <section className="pt-2 border-t border-primary/15">
                      {userEmail ? (
                        <div className="space-y-2">
                          <Link
                            href={getLocalizedPath("/account")}
                            onClick={closeMobile}
                            className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm text-primary/95 hover:bg-card hover:text-primary"
                          >
                            <UserRound className="h-4 w-4" aria-hidden />
                            {t("nav.account")}
                          </Link>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-primary/30 bg-card/40 text-primary hover:bg-card"
                            onClick={() => void onSignOut()}
                          >
                            <LogOut className="h-4 w-4 mr-2" aria-hidden />
                            {t("auth.sign_out")}
                          </Button>
                        </div>
                      ) : (
                        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <Link href={getLocalizedPath("/login")} onClick={closeMobile}>
                            <LogIn className="h-4 w-4 mr-2" aria-hidden />
                            {t("nav.login")}
                          </Link>
                        </Button>
                      )}
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

              {userEmail ? (
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" className="border-primary/25">
                    <Link href={getLocalizedPath("/account")}>
                      <UserRound className="h-4 w-4 mr-2" aria-hidden />
                      {t("nav.account")}
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary/25"
                    onClick={() => void onSignOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" aria-hidden />
                    {t("auth.sign_out")}
                  </Button>
                </div>
              ) : (
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={getLocalizedPath("/login")}>
                    <LogIn className="h-4 w-4 mr-2" aria-hidden />
                    {t("nav.login")}
                  </Link>
                </Button>
              )}

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
                      <div
                        className={cn(
                          "grid w-[min(28rem,calc(100vw-2rem))] max-w-full min-w-0 grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4",
                          "max-h-[min(70vh,32rem)] overflow-y-auto overflow-x-hidden",
                          "[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)]"
                        )}
                      >
                        {allTools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <Link
                              key={tool.href}
                              href={getLocalizedPath(tool.href)}
                              className={cn(
                                "group flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5 select-none rounded-md p-2.5 leading-none no-underline outline-none transition-colors sm:p-3",
                                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                tool.featured &&
                                  "border border-primary/40 bg-primary/[0.08] shadow-sm ring-1 ring-primary/25"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  tool.featured
                                    ? "text-primary"
                                    : "text-muted-foreground group-hover:text-primary"
                                )}
                                aria-hidden
                              />
                              <span
                                className={cn(
                                  "min-w-0 text-sm font-medium leading-snug group-hover:text-primary",
                                  tool.featured && "text-primary"
                                )}
                              >
                                {tool.label}
                              </span>
                            </Link>
                          );
                        })}
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
                      <div
                        className={cn(
                          "grid w-[min(28rem,calc(100vw-2rem))] max-w-full min-w-0 grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4",
                          "max-h-[min(70vh,32rem)] overflow-y-auto overflow-x-hidden",
                          "[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)]"
                        )}
                      >
                        {imageTools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <Link
                              key={tool.href}
                              href={getLocalizedPath(tool.href)}
                              className={cn(
                                "group flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5 select-none rounded-md p-2.5 leading-none no-underline outline-none transition-colors sm:p-3",
                                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                tool.featured &&
                                  "border border-primary/40 bg-primary/[0.08] shadow-sm ring-1 ring-primary/25"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  tool.featured
                                    ? "text-primary"
                                    : "text-muted-foreground group-hover:text-primary"
                                )}
                                aria-hidden
                              />
                              <span
                                className={cn(
                                  "min-w-0 text-sm font-medium leading-snug group-hover:text-primary",
                                  tool.featured && "text-primary"
                                )}
                              >
                                {tool.label}
                              </span>
                            </Link>
                          );
                        })}
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
