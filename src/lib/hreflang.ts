import {
  homePath,
  isLocalePrefix,
  slugToOriginalPath,
  toolPath,
} from "@/lib/urlPaths";
import { getSiteUrl } from "@/lib/site-url";

/** Alternate URLs for hreflang / metadata.alternates.languages. */
export function getHrefLangAlternates(pathname: string): Array<{
  lang: string;
  url: string;
}> {
  const baseUrl = getSiteUrl();
  const trimmed = pathname.startsWith("/") ? pathname : `/${pathname}`;
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
  return [{ lang: "x-default", url: `${baseUrl}${trimmed}` }];
}

export function hrefLangAlternatesToLanguages(
  links: Array<{ lang: string; url: string }>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { lang, url } of links) {
    out[lang] = url;
  }
  return out;
}
