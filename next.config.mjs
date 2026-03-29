import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { dependencies = {} } = JSON.parse(
  readFileSync(join(__dirname, "package.json"), "utf8")
);
const radixReactPackages = Object.keys(dependencies).filter((name) =>
  name.startsWith("@radix-ui/react-")
);

/** Keep in sync with `src/lib/urlPaths.ts` `pathMapping`. */
const pathMapping = {
  merge: ["merge", "combinar", "fusionner"],
  split: ["split", "dividir", "diviser"],
  compress: ["compress", "comprimir", "compresser"],
  rotate: ["rotate", "rotar", "rotation"],
  "pdf-to-word": ["pdf-to-word", "pdf-a-word", "pdf-vers-word"],
  "pdf-to-jpg": ["pdf-to-jpg", "pdf-a-jpg", "pdf-vers-jpg"],
  "pdf-to-text": ["pdf-to-text", "pdf-a-texto", "pdf-vers-texte"],
  "word-to-pdf": ["word-to-pdf", "word-a-pdf", "word-vers-pdf"],
  "jpg-to-pdf": ["jpg-to-pdf", "jpg-a-pdf", "jpg-vers-pdf"],
  "image-resize": ["image-resize", "redimensionar-imagen", "redimensionner-image"],
  "image-compress": ["image-compress", "comprimir-imagen", "compresser-image"],
  "image-webp": ["image-webp", "imagen-webp", "convertir-webp"],
};

/**
 * Permanent redirects (Next uses HTTP 308) so crawlers and browsers treat old
 * indexed URLs as moved to locale-prefixed URLs — avoids duplicate indexing.
 */
function legacyToolRedirects() {
  const out = [];
  for (const translations of Object.values(pathMapping)) {
    const [en, es, fr] = translations;
    out.push({
      source: `/${en}`,
      destination: `/en/${en}`,
      permanent: true,
    });
    out.push({
      source: `/${es}`,
      destination: `/es/${es}`,
      permanent: true,
    });
    out.push({
      source: `/${fr}`,
      destination: `/fr/${fr}`,
      permanent: true,
    });
  }
  return out;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", ...radixReactPackages],
    serverComponentsExternalPackages: ["sharp"],
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
  async redirects() {
    return [
      { source: "/", destination: "/en", permanent: true },
      ...legacyToolRedirects(),
    ];
  },
};

export default nextConfig;
