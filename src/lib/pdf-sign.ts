import { PDFDocument } from "pdf-lib";

export type SignPageScope = "last" | "all" | "first";

export type SignPdfOptions = {
  pageScope: SignPageScope;
  /** Signature width in PDF points (72 per inch). */
  widthPt: number;
  /** Margin from page edges (points). */
  marginPt: number;
};

const FONT_LINK_ID = "ipdf-sign-google-fonts";

export const SIGNATURE_STYLE_FONTS = [
  { id: "dancing", label: "Dancing Script", family: '"Dancing Script", cursive' },
  { id: "great", label: "Great Vibes", family: '"Great Vibes", cursive' },
  { id: "pacifico", label: "Pacifico", family: '"Pacifico", cursive' },
  { id: "satisfy", label: "Satisfy", family: '"Satisfy", cursive' },
] as const;

export type SignatureStyleId = (typeof SIGNATURE_STYLE_FONTS)[number]["id"];

export const SIGN_COLORS = [
  { id: "black", hex: "#0f172a" },
  { id: "slate", hex: "#475569" },
  { id: "red", hex: "#dc2626" },
  { id: "orange", hex: "#ea580c" },
  { id: "amber", hex: "#d97706" },
  { id: "yellow", hex: "#ca8a04" },
  { id: "green", hex: "#16a34a" },
  { id: "teal", hex: "#0d9488" },
  { id: "cyan", hex: "#0891b2" },
  { id: "blue", hex: "#2563eb" },
  { id: "indigo", hex: "#4f46e5" },
  { id: "violet", hex: "#7c3aed" },
  { id: "fuchsia", hex: "#c026d3" },
  { id: "pink", hex: "#db2777" },
  { id: "brown", hex: "#92400e" },
] as const;

export type SignColorId = (typeof SIGN_COLORS)[number]["id"];

/** Load handwriting fonts once (for canvas preview + rasterization). */
export function ensureSignFontsLoaded(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (document.getElementById(FONT_LINK_ID)) {
    return document.fonts.ready.then(() => {});
  }
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Satisfy&display=swap";
  document.head.appendChild(link);
  return new Promise((resolve) => {
    link.onload = () => {
      void document.fonts.ready.then(() => resolve());
    };
    link.onerror = () => resolve();
  });
}

/** Rasterize any canvas (e.g. freehand drawing) to PNG bytes. */
export function rasterizeCanvasToPng(
  canvas: HTMLCanvasElement
): Promise<Uint8Array> {
  return canvasToPngBytes(canvas);
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("toBlob failed"));
          return;
        }
        void blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      },
      "image/png",
      1
    );
  });
}

/** Plain typed signature (sans-serif). */
export async function renderTypeSignaturePng(
  text: string,
  colorHex: string,
  fontSize = 36
): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  const pad = 12;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("NO_CONTEXT");
  ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  const w = Math.max(64, Math.ceil(ctx.measureText(text).width + pad * 2));
  const h = Math.ceil(fontSize * 1.4 + pad * 2);
  canvas.width = w;
  canvas.height = h;
  ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = colorHex;
  ctx.textBaseline = "middle";
  ctx.fillText(text, pad, h / 2);
  return canvasToPngBytes(canvas);
}

/** Handwriting style from {@link SIGNATURE_STYLE_FONTS}. */
export async function renderStyleSignaturePng(
  text: string,
  styleId: SignatureStyleId,
  colorHex: string,
  fontSize = 42
): Promise<Uint8Array> {
  await ensureSignFontsLoaded();
  const meta = SIGNATURE_STYLE_FONTS.find((s) => s.id === styleId);
  const family = meta?.family ?? SIGNATURE_STYLE_FONTS[0].family;
  const canvas = document.createElement("canvas");
  const pad = 14;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("NO_CONTEXT");
  ctx.font = `${fontSize}px ${family}`;
  const w = Math.max(80, Math.ceil(ctx.measureText(text).width + pad * 2));
  const h = Math.ceil(fontSize * 1.45 + pad * 2);
  canvas.width = w;
  canvas.height = h;
  ctx.font = `${fontSize}px ${family}`;
  ctx.fillStyle = colorHex;
  ctx.textBaseline = "middle";
  ctx.fillText(text, pad, h / 2);
  return canvasToPngBytes(canvas);
}

/** Simple company stamp: double border + centered text. */
export async function renderCompanyStampPng(
  text: string,
  colorHex: string
): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("NO_CONTEXT");
  const fontSize = 22;
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = 20;
  const w = Math.ceil(tw + pad * 2);
  const h = Math.ceil(fontSize + pad * 2);
  canvas.width = w;
  canvas.height = h;
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  ctx.lineWidth = 1;
  ctx.strokeRect(7, 7, w - 14, h - 14);
  ctx.fillStyle = colorHex;
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, w / 2, h / 2);
  return canvasToPngBytes(canvas);
}

async function embedRaster(
  pdfDoc: PDFDocument,
  bytes: Uint8Array
): Promise<Awaited<ReturnType<PDFDocument["embedPng"]>>> {
  try {
    return await pdfDoc.embedPng(bytes);
  } catch {
    return await pdfDoc.embedJpg(bytes);
  }
}

/**
 * Draws signature image bottom-right on chosen page(s). pdf-lib origin is bottom-left.
 */
export async function applySignatureToPdf(
  pdfBytes: Uint8Array,
  imageBytes: Uint8Array,
  options: SignPdfOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const image = await embedRaster(pdfDoc, imageBytes);
  const pages = pdfDoc.getPages();
  if (pages.length === 0) {
    throw new Error("NO_PAGES");
  }

  let targets: typeof pages;
  if (options.pageScope === "all") {
    targets = pages;
  } else if (options.pageScope === "last") {
    targets = [pages[pages.length - 1]!];
  } else {
    targets = [pages[0]!];
  }

  const iw = image.width;
  const ih = image.height;
  const targetW = options.widthPt;
  const scale = targetW / iw;
  const targetH = ih * scale;
  const m = options.marginPt;

  for (const page of targets) {
    const { width, height } = page.getSize();
    const x = width - targetW - m;
    const y = m;
    page.drawImage(image, {
      x,
      y,
      width: targetW,
      height: targetH,
      opacity: 1,
    });
  }

  const out = await pdfDoc.save();
  return out;
}

/** Page count for preview navigation (e.g. `#page=N`). */
export async function getPdfPageCount(pdfBytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(pdfBytes);
  return doc.getPageCount();
}
