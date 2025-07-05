import React from "react";
import { FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";

const Header = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { href: "/merge", label: t("nav.merge"), color: "hover:text-blue-600" },
    { href: "/split", label: t("nav.split"), color: "hover:text-orange-600" },
    {
      href: "/compress",
      label: t("nav.compress"),
      color: "hover:text-green-600",
    },
    { href: "/rotate", label: t("nav.rotate"), color: "hover:text-indigo-600" },
    {
      href: "/pdf-to-word",
      label: t("nav.pdf_to_word"),
      color: "hover:text-blue-600",
    },
    {
      href: "/pdf-to-jpg",
      label: t("nav.pdf_to_jpg"),
      color: "hover:text-purple-600",
    },
    {
      href: "/pdf-to-text",
      label: t("nav.pdf_to_text"),
      color: "hover:text-green-600",
    },
    {
      href: "/word-to-pdf",
      label: t("nav.word_to_pdf"),
      color: "hover:text-blue-600",
    },
    {
      href: "/jpg-to-pdf",
      label: t("nav.jpg_to_pdf"),
      color: "hover:text-orange-600",
    },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-20 w-auto object-cover"
            />
            {/* <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF Tools
            </span> */}
          </Link>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`font-medium transition-colors text-sm ${
                    location.pathname === item.href
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
