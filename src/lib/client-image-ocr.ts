/**
 * Client-side text extraction from images in the browser.
 */

/** Matches `Language` in `LanguageContext` — site UI locales. */
export type OcrAppLocale = "en" | "es" | "fr";

/** Engine language codes (aligned with site locales). */
export const OCR_TESSERACT_LANGS = ["eng", "spa", "fra"] as const;
export type OcrTesseractLang = (typeof OCR_TESSERACT_LANGS)[number];

export function appLocaleToOcrLang(locale: OcrAppLocale): OcrTesseractLang {
  if (locale === "es") return "spa";
  if (locale === "fr") return "fra";
  return "eng";
}

/** Load English + Spanish + French at once (slower than a single language). */
export const OCR_LANG_MULTI = "eng+spa+fra" as const;

export type OcrWorkerLang = OcrTesseractLang | typeof OCR_LANG_MULTI;

/** Drop low-confidence noise (e.g. "® i | ®0" from smooth backgrounds). */
const MIN_LINE_CONFIDENCE = 60;
const MIN_WORD_CONFIDENCE = 68;

function countAlnum(s: string): number {
  const m = s.match(/[\p{L}\p{N}]/gu);
  return m ? m.length : 0;
}

/** Reject lines that are mostly symbols/punctuation with almost no real text. */
function passesTextHeuristic(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const nonSpace = t.replace(/\s+/g, "");
  const n = countAlnum(t);
  const denom = Math.max(nonSpace.length, 1);
  const ratio = n / denom;
  if (n >= 5) return true;
  if (n >= 2 && ratio >= 0.45) return true;
  return false;
}

type OcrPageData = {
  text?: string;
  confidence?: number;
  lines?: Array<{ text?: string; confidence?: number | null }>;
  words?: Array<{ text?: string; confidence?: number | null }>;
};

/**
 * Build plain text from structured OCR, ignoring junk lines on gradients,
 * borders, and compression artifacts.
 */
export function textFromFilteredOcr(data: OcrPageData): string {
  const lines = data.lines;
  if (Array.isArray(lines) && lines.length > 0) {
    const parts: string[] = [];
    for (const line of lines) {
      const t = (line.text ?? "").trim();
      if (!t) continue;
      const c = line.confidence;
      if (typeof c === "number" && c < MIN_LINE_CONFIDENCE) continue;
      if (!passesTextHeuristic(t)) continue;
      parts.push(t);
    }
    if (parts.length > 0) {
      return parts.join("\n").trim();
    }
  }

  const words = data.words;
  if (Array.isArray(words) && words.length > 0) {
    const kept: string[] = [];
    for (const w of words) {
      const t = (w.text ?? "").trim();
      if (!t) continue;
      const c = w.confidence;
      if (typeof c === "number" && c < MIN_WORD_CONFIDENCE) continue;
      if (!passesTextHeuristic(t)) continue;
      kept.push(t);
    }
    if (kept.length > 0) {
      return kept.join(" ").replace(/\s+/g, " ").trim();
    }
  }

  const raw = (data.text ?? "").trim();
  if (!raw || !passesTextHeuristic(raw)) return "";
  const pageConf = data.confidence;
  if (typeof pageConf === "number" && pageConf < 45) return "";
  return raw;
}

export type OcrProgress = {
  fileIndex: number;
  fileCount: number;
  /** Rough progress within the current image (0–1) when available */
  stageProgress: number;
  /** Progress across all images (0–1) */
  overallProgress: number;
  status: string;
};

export type OcrFileResult = {
  sourceName: string;
  downloadName: string;
  text: string;
};

export type ExtractTextFromImagesOptions = {
  /** One language, or `eng+spa+fra` for auto (all three). */
  lang: OcrWorkerLang;
  onProgress?: (p: OcrProgress) => void;
};

export async function extractTextFromImages(
  files: File[],
  options: ExtractTextFromImagesOptions
): Promise<OcrFileResult[]> {
  const { lang, onProgress } = options;
  const { createWorker } = await import("tesseract.js");
  const n = files.length;
  let forwardLog: (m: { status?: string; progress?: number }) => void =
    () => {};

  const worker = await createWorker(lang, undefined, {
    logger: (m) => forwardLog(m),
  });

  const out: OcrFileResult[] = [];

  try {
    for (let i = 0; i < n; i++) {
      const file = files[i];
      forwardLog = (m) => {
        const stage =
          typeof m.progress === "number" && !Number.isNaN(m.progress)
            ? m.progress
            : 0;
        onProgress?.({
          fileIndex: i,
          fileCount: n,
          stageProgress: stage,
          overallProgress: (i + stage) / n,
          status: m.status ?? "",
        });
      };

      const { data } = await worker.recognize(file);
      const text = textFromFilteredOcr(data ?? {});
      const base =
        file.name.replace(/\.[^./\\]+$/u, "").trim() || "extracted-text";

      out.push({
        sourceName: file.name,
        downloadName: `${base}.txt`,
        text,
      });
    }
  } finally {
    await worker.terminate();
  }

  return out;
}

/** Combined view / copy / merged .txt: extracted text only, no file-name headers. */
export function formatOcrResultsAsPlainText(
  results: OcrFileResult[],
  emptyPlaceholder: string
): string {
  return results
    .map((r) => (r.text.length > 0 ? r.text : emptyPlaceholder))
    .join("\n\n");
}
