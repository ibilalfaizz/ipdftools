import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolRouteClient from "@/components/ToolRouteClient";
import { WebAppJsonLd } from "@/components/WebAppJsonLd";
import {
  buildToolMetadata,
  originalPathToSeoToolKey,
} from "@/lib/page-metadata";
import { getSiteUrl } from "@/lib/site-url";
import { seoTranslations } from "@/lib/seo-translations";
import {
  allLocaleToolStaticParams,
  isLocalePrefix,
  isValidLocaleToolPair,
  slugToOriginalPath,
  type LocaleCode,
} from "@/lib/urlPaths";

type Props = { params: { locale: string; tool: string } };

export function generateStaticParams() {
  return allLocaleToolStaticParams();
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = typeof params?.locale === "string" ? params.locale.trim() : "";
  const tool = typeof params?.tool === "string" ? params.tool.trim() : "";
  if (!isLocalePrefix(locale)) return {};
  const originalPath = slugToOriginalPath(tool);
  if (!originalPath || !isValidLocaleToolPair(locale, tool)) {
    return {};
  }
  const toolKey = originalPathToSeoToolKey(originalPath);
  return buildToolMetadata(
    locale as LocaleCode,
    `/${locale}/${tool}`,
    toolKey
  );
}

export default function ToolPage({ params }: Props) {
  const locale =
    typeof params?.locale === "string" ? params.locale.trim() : "";
  const tool = typeof params?.tool === "string" ? params.tool.trim() : "";
  if (!isLocalePrefix(locale)) {
    notFound();
  }
  const originalPath = slugToOriginalPath(tool);
  if (!originalPath || !isValidLocaleToolPair(locale, tool)) {
    notFound();
  }
  const t = seoTranslations[locale as LocaleCode];
  const siteName = t["seo.site_name"];
  const toolKey = originalPathToSeoToolKey(originalPath);
  const pageTitle = `${t[`seo.${toolKey}.title`]} - ${siteName}`;
  const description = t[`seo.${toolKey}.description`];
  const canonicalUrl = `${getSiteUrl()}/${locale}/${tool}`;
  return (
    <>
      <WebAppJsonLd
        name={pageTitle}
        description={description}
        url={canonicalUrl}
      />
      <ToolRouteClient originalPath={originalPath} />
    </>
  );
}
