/** Keep in sync with `src/lib/urlPaths.ts` `pathMapping`. */
const pathMapping = {
  merge: ["merge-pdf", "combinar-pdf", "fusionner-pdf"],
  split: ["split-pdf", "dividir-pdf", "diviser-pdf"],
  compress: ["compress-pdf", "comprimir-pdf", "compresser-pdf"],
  rotate: ["rotate-pdf", "rotar-pdf", "rotation-pdf"],
  "pdf-to-word": ["pdf-to-word", "pdf-a-word", "pdf-vers-word"],
  "pdf-to-jpg": ["pdf-to-jpg", "pdf-a-jpg", "pdf-vers-jpg"],
  "pdf-to-text": ["pdf-to-text", "pdf-a-texto", "pdf-vers-texte"],
  "word-to-pdf": ["word-to-pdf", "word-a-pdf", "word-vers-pdf"],
  "jpg-to-pdf": ["jpg-to-pdf", "jpg-a-pdf", "jpg-vers-pdf"],
  "bulk-image-resize": [
    "bulk-image-resize",
    "redimensionar-imagen-masivo",
    "redimensionnement-images-masse",
  ],
  "bulk-image-compress": [
    "bulk-image-compress",
    "comprimir-imagen-masivo",
    "compression-images-masse",
  ],
  "bulk-image-webp": [
    "bulk-image-webp",
    "convertir-webp-masivo",
    "conversion-webp-masse",
  ],
  "bulk-image-jpg": [
    "bulk-image-jpg",
    "convertir-jpg-masivo",
    "conversion-jpg-masse",
  ],
  "bulk-image-gif": [
    "bulk-image-gif",
    "imagenes-a-gif",
    "images-vers-gif",
  ],
  "image-crop": [
    "image-crop",
    "recortar-imagenes",
    "recadrer-images",
  ],
  "image-rotate": [
    "image-rotate",
    "rotar-imagenes",
    "rotation-images",
  ],
  "image-blur-face": [
    "image-blur-face",
    "desenfoque-caras",
    "flouter-visages",
  ],
  "image-watermark": [
    "image-watermark",
    "marca-de-agua-imagen",
    "filigrane-image",
  ],
  "image-remove-background": [
    "image-remove-background",
    "quitar-fondo-imagen",
    "supprimer-fond-image",
  ],
};

/**
 * Old image tool slugs → new `bulk-image-*` slugs (per locale). Keeps bookmarks
 * and indexed URLs valid after the rename.
 */
function imageToolSlugMigrationRedirects() {
  const migrations = [
    {
      old: ["image-resize", "redimensionar-imagen", "redimensionner-image"],
      new: [
        "bulk-image-resize",
        "redimensionar-imagen-masivo",
        "redimensionnement-images-masse",
      ],
    },
    {
      old: ["image-compress", "comprimir-imagen", "compresser-image"],
      new: [
        "bulk-image-compress",
        "comprimir-imagen-masivo",
        "compression-images-masse",
      ],
    },
    {
      old: ["image-webp", "imagen-webp", "convertir-webp"],
      new: ["bulk-image-webp", "convertir-webp-masivo", "conversion-webp-masse"],
    },
  ];
  const locales = ["en", "es", "fr"];
  const out = [];
  for (const { old, new: newSlugs } of migrations) {
    for (let i = 0; i < 3; i++) {
      const locale = locales[i];
      out.push({
        source: `/${locale}/${old[i]}`,
        destination: `/${locale}/${newSlugs[i]}`,
        permanent: true,
      });
      out.push({
        source: `/${old[i]}`,
        destination: `/${locale}/${newSlugs[i]}`,
        permanent: true,
      });
    }
  }
  return out;
}

/** `bulk-image-crop` → `image-crop` (removed “bulk” from slug). */
function imageCropSlugMigrationRedirects() {
  const old = [
    "bulk-image-crop",
    "recortar-imagen-masivo",
    "recadrer-images-masse",
  ];
  const newSlugs = ["image-crop", "recortar-imagenes", "recadrer-images"];
  const locales = ["en", "es", "fr"];
  const out = [];
  for (let i = 0; i < 3; i++) {
    const locale = locales[i];
    out.push({
      source: `/${locale}/${old[i]}`,
      destination: `/${locale}/${newSlugs[i]}`,
      permanent: true,
    });
    out.push({
      source: `/${old[i]}`,
      destination: `/${locale}/${newSlugs[i]}`,
      permanent: true,
    });
  }
  return out;
}

/**
 * Legacy slugs that were previously indexed. We keep permanent redirects so
 * search engines consolidate signals onto the new keyword-rich slugs.
 */
const legacyPathMapping = {
  merge: ["merge", "combinar", "fusionner"],
  split: ["split", "dividir", "diviser"],
  compress: ["compress", "comprimir", "compresser"],
  rotate: ["rotate", "rotar", "rotation"],
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

function legacySeoSlugRedirects() {
  const out = [];
  for (const [toolId, oldTranslations] of Object.entries(legacyPathMapping)) {
    const newTranslations = pathMapping[toolId];
    if (!newTranslations) continue;
    const [oldEn, oldEs, oldFr] = oldTranslations;
    const [newEn, newEs, newFr] = newTranslations;

    const pairs = [
      ["en", oldEn, newEn],
      ["es", oldEs, newEs],
      ["fr", oldFr, newFr],
    ];
    for (const [locale, oldSlug, newSlug] of pairs) {
      // Old flat URL -> new locale URL (avoid extra hop).
      out.push({
        source: `/${oldSlug}`,
        destination: `/${locale}/${newSlug}`,
        permanent: true,
      });
      // Old locale-prefixed URL -> new locale-prefixed URL.
      out.push({
        source: `/${locale}/${oldSlug}`,
        destination: `/${locale}/${newSlug}`,
        permanent: true,
      });
    }
  }
  return out;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@tensorflow/tfjs",
    "@tensorflow/tfjs-core",
    "@tensorflow/tfjs-backend-webgl",
    "@tensorflow/tfjs-backend-cpu",
    "@tensorflow/tfjs-converter",
    "@tensorflow-models/blazeface",
    "@imgly/background-removal",
    "onnxruntime-web",
  ],
  experimental: {
    // Only lucide: enabling optimizePackageImports for all @radix-ui/* packages
    // can produce a vendor-chunks/@radix-ui.js chunk that intermittently goes missing
    // on dev refresh (stale manifest vs disk). Production builds were fine.
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config, { isServer, webpack: webpackApi }) => {
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      // onnxruntime-web ships pre-minified .mjs with import.meta; SWC/Terser still
      // tries to minify them as non-modules and fails the production build.
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.thisCompilation.tap("SkipOnnxRuntimeMinify", (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: "SkipOnnxRuntimeMinify",
                stage:
                  webpackApi.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE - 1,
              },
              () => {
                for (const { name } of compilation.getAssets()) {
                  if (
                    /onnxruntime|ort\.webgpu|ort\.bundle|ort-wasm/i.test(name)
                  ) {
                    const asset = compilation.getAsset(name);
                    if (asset) {
                      compilation.updateAsset(name, asset.source, {
                        ...asset.info,
                        minimized: true,
                      });
                    }
                  }
                }
              }
            );
          });
        },
      });
    }
    return config;
  },
  async redirects() {
    return [
      { source: "/", destination: "/en", permanent: true },
      ...imageToolSlugMigrationRedirects(),
      ...imageCropSlugMigrationRedirects(),
      ...legacySeoSlugRedirects(),
      ...legacyToolRedirects(),
    ];
  },
};

export default nextConfig;
