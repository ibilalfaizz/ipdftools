import type { MetadataRoute } from "next";
import { allLocalizedSlugs } from "@/lib/urlPaths";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const slugs = [...allLocalizedSlugs()].sort();

  const toolPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolPages,
  ];
}
