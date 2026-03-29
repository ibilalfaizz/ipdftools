import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Landing from "@/pages/Landing";
import { WebAppJsonLd } from "@/components/WebAppJsonLd";
import { buildHomeMetadata } from "@/lib/page-metadata";
import { getSiteUrl } from "@/lib/site-url";
import { seoTranslations } from "@/lib/seo-translations";
import { LOCALE_CODES, isLocalePrefix, type LocaleCode } from "@/lib/urlPaths";

type Props = { params: { locale: string } };

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = typeof params?.locale === "string" ? params.locale.trim() : "";
  if (!isLocalePrefix(locale)) {
    return {};
  }
  return buildHomeMetadata(locale as LocaleCode, `/${locale}`);
}

export default function LocaleHomePage({ params }: Props) {
  const locale =
    typeof params?.locale === "string" ? params.locale.trim() : "";
  if (!isLocalePrefix(locale)) {
    notFound();
  }
  const t = seoTranslations[locale as LocaleCode];
  const base = getSiteUrl();
  return (
    <>
      <WebAppJsonLd
        name={t["seo.default.title"]}
        description={t["seo.default.description"]}
        url={`${base}/${locale}`}
      />
      <Landing />
    </>
  );
}
