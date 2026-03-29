import React, { createContext, useContext, ReactNode } from "react";
import { useLanguage } from "./LanguageContext";
import {
  homePath,
  isLocalePrefix,
  slugToOriginalPath,
  toolPath,
} from "@/lib/urlPaths";
import { getSiteUrl } from "@/lib/site-url";

interface SEOContextType {
  generatePageTitle: (toolName: string) => string;
  generatePageDescription: (toolName: string) => string;
  generateCanonicalUrl: (path: string) => string;
  generateHrefLang: (path: string) => Array<{ lang: string; url: string }>;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const SEOProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLanguage();

  const generatePageTitle = (toolName: string): string => {
    const title = t(`seo.${toolName}.title`);
    const siteName = t("seo.site_name");
    return `${title} - ${siteName}`;
  };

  const generatePageDescription = (toolName: string): string => {
    return t(`seo.${toolName}.description`);
  };

  const generateCanonicalUrl = (path: string): string => {
    const baseUrl = getSiteUrl();
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${p}`;
  };

  const generateHrefLang = (path: string): Array<{ lang: string; url: string }> => {
    const baseUrl = getSiteUrl();
    const trimmed = path.startsWith("/") ? path : `/${path}`;
    const parts = trimmed.split("/").filter(Boolean);

    if (parts.length === 1 && isLocalePrefix(parts[0])) {
      return [
        { lang: "en", url: `${baseUrl}${homePath("en")}` },
        { lang: "es", url: `${baseUrl}${homePath("es")}` },
        { lang: "fr", url: `${baseUrl}${homePath("fr")}` },
        { lang: "x-default", url: `${baseUrl}${homePath("en")}` },
      ];
    }

    if (parts.length >= 2 && isLocalePrefix(parts[0])) {
      const slug = parts[1];
      const englishPath = slugToOriginalPath(slug);
      if (!englishPath) {
        return [{ lang: "x-default", url: `${baseUrl}${trimmed}` }];
      }
      return [
        { lang: "en", url: `${baseUrl}${toolPath("en", englishPath)}` },
        { lang: "es", url: `${baseUrl}${toolPath("es", englishPath)}` },
        { lang: "fr", url: `${baseUrl}${toolPath("fr", englishPath)}` },
        { lang: "x-default", url: `${baseUrl}${toolPath("en", englishPath)}` },
      ];
    }

    const segment = parts[0] ?? "";
    const op = slugToOriginalPath(segment);
    if (op) {
      return [
        { lang: "en", url: `${baseUrl}${toolPath("en", op)}` },
        { lang: "es", url: `${baseUrl}${toolPath("es", op)}` },
        { lang: "fr", url: `${baseUrl}${toolPath("fr", op)}` },
        { lang: "x-default", url: `${baseUrl}${toolPath("en", op)}` },
      ];
    }
    return [
      { lang: "x-default", url: `${baseUrl}${trimmed}` },
    ];
  };

  return (
    <SEOContext.Provider
      value={{
        generatePageTitle,
        generatePageDescription,
        generateCanonicalUrl,
        generateHrefLang,
      }}
    >
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error("useSEO must be used within a SEOProvider");
  }
  return context;
};
