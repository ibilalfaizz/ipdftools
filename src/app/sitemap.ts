import type { MetadataRoute } from "next";
import { pathMapping } from "@/lib/urlPaths";
import { getSiteUrl } from "@/lib/site-url";

/** One `<url>` per tool: English `<loc>` (`/en/...`) + `xhtml:link` alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const toolEntries: MetadataRoute.Sitemap = Object.entries(pathMapping)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, translations]) => {
      const [enSlug, esSlug, frSlug] = translations;
      return {
        url: `${base}/en/${enSlug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
          languages: {
            en: `${base}/en/${enSlug}`,
            es: `${base}/es/${esSlug}`,
            fr: `${base}/fr/${frSlug}`,
            "x-default": `${base}/en/${enSlug}`,
          },
        },
      };
    });

  return [
    {
      url: `${base}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: `${base}/en`,
          es: `${base}/es`,
          fr: `${base}/fr`,
          "x-default": `${base}/en`,
        },
      },
    },
    ...toolEntries,
  ];
}
