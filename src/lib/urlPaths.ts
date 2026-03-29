export type LocaleCode = "en" | "es" | "fr";

export const pathMapping: Record<string, string[]> = {
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

export const languageIndex: Record<LocaleCode, number> = { en: 0, es: 1, fr: 2 };

/** Map any localized slug to canonical English path, e.g. combinar -> /merge */
export function slugToOriginalPath(slug: string): string | null {
  for (const [original, translations] of Object.entries(pathMapping)) {
    if (translations.includes(slug)) {
      return `/${original}`;
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
    if (original === clean) {
      return `/${translations[idx]}`;
    }
  }
  return pathWithSlash;
}

export function allLocalizedSlugs(): string[] {
  const slugs = new Set<string>();
  for (const translations of Object.values(pathMapping)) {
    for (const s of translations) slugs.add(s);
  }
  return Array.from(slugs);
}
