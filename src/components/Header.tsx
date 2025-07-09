
import React from "react";
import { FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { t, getLocalizedPath, getOriginalPath } = useLanguage();

  // Get the original path for comparison
  const currentOriginalPath = getOriginalPath(location.pathname);

  const navItems = [
    { href: "/merge", label: t("nav.merge"), color: "hover:text-blue-600" },
    { href: "/split", label: t("nav.split"), color: "hover:text-orange-600" },
    {
      href: "/compress",
      label: t("nav.compress"),
      color: "hover:text-green-600",
    },
    { href: "/rotate", label: t("nav.rotate"), color: "hover:text-indigo-600" },
  ];

  const allTools = [
    {
      href: "/merge",
      label: t("nav.merge"),
      description: "Combine multiple PDF files into one",
      color: "from-red-500 to-red-600",
    },
    {
      href: "/split",
      label: t("nav.split"),
      description: "Split PDF into multiple documents",
      color: "from-orange-500 to-red-500",
    },
    {
      href: "/compress",
      label: t("nav.compress"),
      description: "Reduce PDF file size",
      color: "from-green-500 to-teal-500",
    },
    {
      href: "/rotate",
      label: t("nav.rotate"),
      description: "Rotate PDF pages",
      color: "from-indigo-500 to-cyan-500",
    },
    {
      href: "/pdf-to-word",
      label: t("nav.pdf_to_word"),
      description: "Convert PDF to Word documents",
      color: "from-blue-500 to-green-500",
    },
    {
      href: "/pdf-to-jpg",
      label: t("nav.pdf_to_jpg"),
      description: "Convert PDF to JPG images",
      color: "from-purple-500 to-pink-500",
    },
    {
      href: "/pdf-to-text",
      label: t("nav.pdf_to_text"),
      description: "Extract text from PDF",
      color: "from-green-500 to-blue-500",
    },
    {
      href: "/word-to-pdf",
      label: t("nav.word_to_pdf"),
      description: "Convert Word to PDF",
      color: "from-blue-500 to-purple-500",
    },
    {
      href: "/jpg-to-pdf",
      label: t("nav.jpg_to_pdf"),
      description: "Convert images to PDF",
      color: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-20 w-auto object-cover"
            />
          </Link>

          <div className="flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-600 hover:text-blue-600">
                    All PDF Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[600px] max-w-[90vw] grid-cols-2 md:grid-cols-3 max-h-[70vh] overflow-y-auto">
                      {allTools.map((tool) => (
                        <Link
                          key={tool.href}
                          to={getLocalizedPath(tool.href)}
                          className="group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none group-hover:text-blue-600">
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

            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={getLocalizedPath(item.href)}
                  className={`font-medium transition-colors text-sm ${
                    currentOriginalPath === item.href
                      ? "text-blue-600"
                      : `text-gray-600 ${item.color}`
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
