/** Production origin (no trailing slash). Override with NEXT_PUBLIC_SITE_URL in env. */
const DEFAULT_SITE_URL = "https://www.ipdftools.com";

/** Public site origin (no trailing slash). Used by sitemap, robots, and SEO canonicals. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return DEFAULT_SITE_URL;
}
