/**
 * PDF.js cannot be bundled by Next/Webpack — both `build/pdf.mjs` and `legacy/build/pdf.mjs`
 * are pre-webpacked modules; wrapping them again causes:
 * `Object.defineProperty called on non-object` in __webpack_require__.r.
 *
 * We copy `legacy/build/pdf.min.mjs` + `pdf.worker.min.mjs` to `/public/` via
 * `scripts/copy-pdf-worker.mjs` (postinstall / prebuild) and load the library with a
 * dynamic `import()` that **webpack must not rewrite**. Magic-comment `webpackIgnore`
 * on `import()` is not reliable with SWC; `new Function("return import(u)")(url)` avoids static analysis
 * so the browser loads `/pdf.min.mjs` as a real ES module from `public/`.
 */
type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let cached: PdfJsModule | null = null;

export async function getPdfJs(): Promise<PdfJsModule> {
  if (typeof window === "undefined") {
    throw new Error("PDF.js is only available in the browser.");
  }
  if (cached) return cached;

  const origin = window.location.origin;
  const libUrl = `${origin}/pdf.min.mjs`;

  // eslint-disable-next-line no-new-func -- intentional: hide dynamic import from bundler
  const importUncached = new Function(
    "specifier",
    "return import(specifier)"
  ) as (specifier: string) => Promise<PdfJsModule>;

  const mod = await importUncached(libUrl);

  mod.GlobalWorkerOptions.workerSrc = `${origin}/pdf.worker.min.mjs`;
  cached = mod;
  return mod;
}
