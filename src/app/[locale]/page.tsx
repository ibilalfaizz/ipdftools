import { notFound } from "next/navigation";
import Landing from "@/pages/Landing";
import { LOCALE_CODES, isLocalePrefix } from "@/lib/urlPaths";

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export default function LocaleHomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale =
    typeof params?.locale === "string" ? params.locale.trim() : "";
  if (!isLocalePrefix(locale)) {
    notFound();
  }
  return <Landing />;
}
