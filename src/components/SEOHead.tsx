"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSEO } from "../contexts/SEOContext";
import { useLanguage } from "../contexts/LanguageContext";

interface SEOHeadProps {
  toolName?: string;
  title?: string;
  description?: string;
  type?: "website" | "article";
  image?: string;
}

function setOrCreateMeta(
  selector: string,
  setAttrs: (el: HTMLMetaElement) => void
) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    setAttrs(el);
    document.head.appendChild(el);
  } else {
    setAttrs(el);
  }
}

const SEOHead: React.FC<SEOHeadProps> = ({
  toolName,
  title,
  description,
  type = "website",
  image = "/ipdftools.png",
}) => {
  const pathname = usePathname();
  const {
    generatePageTitle,
    generatePageDescription,
    generateCanonicalUrl,
    generateHrefLang,
  } = useSEO();
  const { language, t } = useLanguage();

  useEffect(() => {
    const pageTitle =
      title ||
      (toolName ? generatePageTitle(toolName) : t("seo.default.title"));
    const pageDescription =
      description ||
      (toolName
        ? generatePageDescription(toolName)
        : t("seo.default.description"));
    const canonicalUrl = generateCanonicalUrl(pathname);
    const hrefLangLinks = generateHrefLang(pathname);
    const fullImageUrl = `https://www.ipdftools.com/${image}`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: {
        "@type": "Organization",
        name: "iPDFTOOLS",
        url: "https://www.ipdftools.com/",
      },
    };

    document.documentElement.lang = language;
    document.title = pageTitle;

    setOrCreateMeta('meta[name="description"]', (el) => {
      el.setAttribute("name", "description");
      el.setAttribute("content", pageDescription);
    });

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove());
    hrefLangLinks.forEach(({ lang, url }) => {
      const l = document.createElement("link");
      l.setAttribute("rel", "alternate");
      l.setAttribute("hreflang", lang);
      l.setAttribute("href", url);
      document.head.appendChild(l);
    });

    const og = (prop: string, content: string) => {
      setOrCreateMeta(`meta[property="${prop}"]`, (el) => {
        el.setAttribute("property", prop);
        el.setAttribute("content", content);
      });
    };
    og("og:type", type);
    og("og:title", pageTitle);
    og("og:description", pageDescription);
    og("og:url", canonicalUrl);
    og("og:image", fullImageUrl);
    og("og:site_name", "iPDFTOOLS");
    og(
      "og:locale",
      language === "en" ? "en_US" : language === "es" ? "es_ES" : "fr_FR"
    );

    const tw = (name: string, content: string) => {
      setOrCreateMeta(`meta[name="${name}"]`, (el) => {
        el.setAttribute("name", name);
        el.setAttribute("content", content);
      });
    };
    tw("twitter:card", "summary_large_image");
    tw("twitter:title", pageTitle);
    tw("twitter:description", pageDescription);
    tw("twitter:image", fullImageUrl);

    let script = document.getElementById("ipdf-ld-json");
    if (!script) {
      script = document.createElement("script");
      script.id = "ipdf-ld-json";
      script.setAttribute("type", "application/ld+json");
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- SEO helpers and `t` track `language`
  }, [pathname, language, toolName, title, description, type, image]);

  return null;
};

export default SEOHead;
