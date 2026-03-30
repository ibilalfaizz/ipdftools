import type { Metadata } from "next";
import { pathMapping, type LocaleCode } from "@/lib/urlPaths";
import {
  hrefLangAlternatesToLanguages,
  getHrefLangAlternates,
} from "@/lib/hreflang";
import { getSiteUrl } from "@/lib/site-url";
import { seoTranslations } from "@/lib/seo-translations";

const OG_IMAGE = "/ipdftools.png";

function ogLocale(locale: LocaleCode): string {
  if (locale === "en") return "en_US";
  if (locale === "es") return "es_ES";
  return "fr_FR";
}

function buildBaseMetadata(
  locale: LocaleCode,
  pathname: string,
  title: string,
  description: string
): Metadata {
  const baseUrl = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const canonicalUrl = `${baseUrl}${path}`;
  const hrefLinks = getHrefLangAlternates(pathname);
  const imageUrl = new URL(OG_IMAGE, baseUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: hrefLangAlternatesToLanguages(hrefLinks),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "iPDFTOOLS",
      locale: ogLocale(locale),
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildHomeMetadata(
  locale: LocaleCode,
  pathname: string
): Metadata {
  const t = seoTranslations[locale];
  return buildBaseMetadata(
    locale,
    pathname,
    t["seo.default.title"],
    t["seo.default.description"]
  );
}

/** `originalPath` e.g. `/merge`, `/pdf-to-word` */
export function buildToolMetadata(
  locale: LocaleCode,
  pathname: string,
  toolKey: string
): Metadata {
  const t = seoTranslations[locale];
  const siteName = t["seo.site_name"];
  const titleKey = `seo.${toolKey}.title` as const;
  const descKey = `seo.${toolKey}.description` as const;
  const pageTitle = `${t[titleKey]} - ${siteName}`;
  const description = t[descKey];
  return buildBaseMetadata(locale, pathname, pageTitle, description);
}

/** Stable SEO translation keys (paths use `bulk-image-*` except image crop). */
const SEO_TOOL_KEY_ALIASES: Record<string, string> = {
  bulk_image_resize: "image_resize",
  bulk_image_compress: "image_compress",
  bulk_image_webp: "image_webp",
};

/** `/merge-pdf` or `/pdf-to-word` → `merge`, `pdf_to_word` (seo keys) */
export function originalPathToSeoToolKey(originalPath: string): string {
  const clean = originalPath.replace(/^\//, "");
  for (const [original, translations] of Object.entries(pathMapping)) {
    if (original === clean || translations[0] === clean) {
      const key = original.replace(/-/g, "_");
      return SEO_TOOL_KEY_ALIASES[key] ?? key;
    }
  }
  const fallback = clean.replace(/-/g, "_");
  return SEO_TOOL_KEY_ALIASES[fallback] ?? fallback;
}
