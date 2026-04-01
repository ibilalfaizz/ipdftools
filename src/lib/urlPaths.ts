export type LocaleCode = "en" | "es" | "fr";

export const pathMapping: Record<string, string[]> = {
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
  "image-ocr": [
    "image-ocr",
    "extraer-texto-imagen",
    "extraire-texte-image",
  ],
  "image-heic-to-jpg": [
    "image-heic-to-jpg",
    "heic-a-jpg",
    "heic-vers-jpg",
  ],
  "image-motion-blur": [
    "image-motion-blur",
    "desenfoque-movimiento",
    "flou-mouvement",
  ],
};

export const languageIndex: Record<LocaleCode, number> = { en: 0, es: 1, fr: 2 };

export const LOCALE_CODES: LocaleCode[] = ["en", "es", "fr"];

export function isLocalePrefix(s: string): s is LocaleCode {
  return s === "en" || s === "es" || s === "fr";
}

/** English tool path (`/merge` or `/merge-pdf`) + locale → `/es/combinar-pdf` */
export function toolPath(locale: LocaleCode, englishPath: string): string {
  const clean = englishPath.replace(/^\//, "");
  const idx = languageIndex[locale];
  for (const [original, translations] of Object.entries(pathMapping)) {
    if (original === clean || translations[0] === clean) {
      return `/${locale}/${translations[idx]}`;
    }
  }
  return `/${locale}/${clean}`;
}

export function homePath(locale: LocaleCode): string {
  return `/${locale}`;
}

/** Map any localized slug to canonical English path, e.g. `combinar-pdf` → `/merge-pdf` */
export function slugToOriginalPath(slug: string): string | null {
  for (const [, translations] of Object.entries(pathMapping)) {
    if (translations.includes(slug)) {
      return `/${translations[0]}`;
    }
  }
  return null;
}

/** e.g. /merge + es -> /combinar */
export function englishPathToLocalized(
  pathWithSlash: string,
  lang: LocaleCode
): string {
  const clean = pathWithSlash.replace(/^\//, "");
  const idx = languageIndex[lang];
  for (const [original, translations] of Object.entries(pathMapping)) {
    if (original === clean || translations[0] === clean) {
      return `/${translations[idx]}`;
    }
  }
  return pathWithSlash;
}

/** Verify `/es` + `rotar` matches the Spanish slug for that tool */
export function isValidLocaleToolPair(
  locale: LocaleCode,
  toolSlug: string
): boolean {
  const originalPath = slugToOriginalPath(toolSlug);
  if (!originalPath) return false;
  const expected = toolPath(locale, originalPath).replace(/^\//, "");
  const actual = `${locale}/${toolSlug}`;
  return expected === actual;
}

export function allLocaleToolStaticParams(): { locale: LocaleCode; tool: string }[] {
  const out: { locale: LocaleCode; tool: string }[] = [];
  for (const locale of LOCALE_CODES) {
    const idx = languageIndex[locale];
    for (const translations of Object.values(pathMapping)) {
      out.push({ locale, tool: translations[idx] });
    }
  }
  return out;
}
