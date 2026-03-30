import { sanitizeStem } from "@/lib/image-zip-helpers";
import type {
  ClientImageProcessResult,
  ClientImageResultFile,
} from "@/lib/client-image-jobs";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = r.result as string;
      const i = dataUrl.indexOf(",");
      resolve(i >= 0 ? dataUrl.slice(i + 1) : dataUrl);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export type WatermarkTextLayerJob = {
  kind: "text";
  text: string;
  textColor: string;
  fontSizeRatio: number;
  anchorX: number;
  anchorY: number;
  opacity: number;
};

export type WatermarkImageLayerJob = {
  kind: "image";
  file: File;
  imageWidthRatio: number;
  anchorX: number;
  anchorY: number;
  opacity: number;
};

export type WatermarkLayerJob =
             WatermarkTextLayerJob
  | WatermarkImageLayerJob;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Same rules as the UI: accept common raster types even when `file.type` is missing. */
export function isImageFileForWatermark(
  file: File | null | undefined
): boolean {
  if (!file) return false;
  const t = file.type.toLowerCase();
  if (t.startsWith("image/")) return true;
  if (t !== "" && t !== "application/octet-stream") return false;
  return /\.(png|apng|jpe?g|gif|webp|bmp|svg|ico|tif?f|avif)$/i.test(
    file.name
  );
}

/**
 * `createImageBitmap(File)` fails on some browsers or formats; fall back via `<img>`.
 */
async function loadBitmapFromFile(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      const decoded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("IMAGE_DECODE_FAIL"));
        img.src = url;
      });
      await decoded;
      return await createImageBitmap(img);
    } catch {
      throw new Error("IMAGE_DECODE_FAIL");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/**
 * Renders watermarked image (full resolution). Layers are drawn in order:
 * first = bottom, last = top. Output is PNG.
 */
export async function processWatermarkExport(
  mainFile: File,
  layers: WatermarkLayerJob[]
): Promise<ClientImageProcessResult> {
  if (!isImageFileForWatermark(mainFile)) {
    throw new Error("NO_VALID_IMAGES");
  }

  const drawable: WatermarkLayerJob[] = [];
  for (const L of layers) {
    if (L.kind === "text") {
      if (L.text.trim()) drawable.push(L);
    } else if (isImageFileForWatermark(L.file)) {
      drawable.push(L);
    }
  }

  if (drawable.length === 0) {
    throw new Error("NO_WATERMARK_LAYERS");
  }

  let mainBm: ImageBitmap | null = null;
  const bitmaps: ImageBitmap[] = [];

  try {
    mainBm = await loadBitmapFromFile(mainFile);
    const iw = mainBm.width;
    const ih = mainBm.height;

    const canvas = document.createElement("canvas");
    canvas.width = iw;
    canvas.height = ih;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("NO_CANVAS");
    }

    ctx.drawImage(mainBm, 0, 0);

    for (const L of drawable) {
      const opacity = clamp01(L.opacity);
      ctx.save();
      ctx.globalAlpha = opacity;

      if (L.kind === "text") {
        const ax = clamp01(L.anchorX);
        const ay = clamp01(L.anchorY);
        const t = L.text.trim();
        const fs = Math.max(
          8,
          Math.round(
            Math.min(iw, ih) *
              Math.min(0.35, Math.max(0.01, L.fontSizeRatio))
          )
        );
        ctx.fillStyle = L.textColor || "#ffffff";
        ctx.font = `bold ${fs}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = t.split(/\r?\n/);
        const lh = fs * 1.15;
        const totalH = lines.length * lh;
        let y0 = ay * ih - totalH / 2 + lh / 2;
        for (const line of lines) {
          ctx.fillText(line, ax * iw, y0, iw * 0.95);
          y0 += lh;
        }
      } else {
        const wmBm = await loadBitmapFromFile(L.file);
        bitmaps.push(wmBm);
        const ax = clamp01(L.anchorX);
        const ay = clamp01(L.anchorY);
        const ratio = Math.min(0.95, Math.max(0.03, L.imageWidthRatio));
        const dw = Math.round(iw * ratio);
        const dh = Math.round((wmBm.height / wmBm.width) * dw);
        const dx = ax * iw - dw / 2;
        const dy = ay * ih - dh / 2;
        ctx.drawImage(wmBm, dx, dy, dw, dh);
      }

      ctx.restore();
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/png"
      );
    });
    const data = await blobToBase64(blob);
    const stem = sanitizeStem(mainFile.name);
    const file: ClientImageResultFile = {
      name: `${stem}_watermarked.png`,
      contentType: "image/png",
      data,
    };
    return { files: [file], zipSuggestedName: "watermarked.zip" };
  } finally {
    mainBm?.close();
    for (const b of bitmaps) b.close();
  }
}
