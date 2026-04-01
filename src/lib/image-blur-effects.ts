/**
 * Full-image Gaussian and motion blur on canvas, plus optional background-only blur
 * using a segmentation mask (same pipeline as remove-background).
 */

import { removeBackgroundWithImgly } from "@/lib/imgly-remove-background";
import { removeSimpleBackgroundToCanvas } from "@/lib/simple-remove-background";

export type BlurMode = "gaussian" | "motion";

export type FullImageBlurParams = {
  mode: BlurMode;
  /** Motion blur direction (degrees). */
  angleDeg: number;
  /** Gaussian: blur radius (px). Motion: streak length (px). */
  distancePx: number;
  /** Motion: sample count along the streak (≥ 2). */
  samples: number;
};

function applyGaussianFull(
  bitmap: ImageBitmap,
  radiusPx: number
): HTMLCanvasElement {
  const w = bitmap.width;
  const h = bitmap.height;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) {
    throw new Error("NO_CONTEXT");
  }
  const r = Math.min(100, Math.max(0, radiusPx));
  if (r <= 0.5) {
    ctx.drawImage(bitmap, 0, 0);
    return c;
  }
  ctx.filter = `blur(${r}px)`;
  ctx.drawImage(bitmap, 0, 0);
  ctx.filter = "none";
  return c;
}

function applyMotionFull(
  bitmap: ImageBitmap,
  angleDeg: number,
  distancePx: number,
  samples: number
): HTMLCanvasElement {
  const w = bitmap.width;
  const h = bitmap.height;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) {
    throw new Error("NO_CONTEXT");
  }
  const dist = Math.max(0, distancePx);
  const n = Math.max(2, Math.min(64, Math.round(samples)));
  if (dist <= 0.5) {
    ctx.drawImage(bitmap, 0, 0);
    return c;
  }
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad) * dist;
  const dy = Math.sin(rad) * dist;
  ctx.globalAlpha = 1 / n;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    ctx.drawImage(bitmap, t * dx, t * dy);
  }
  ctx.globalAlpha = 1;
  return c;
}

/** Apply Gaussian or motion blur to the entire image. */
export function applyFullImageBlur(
  bitmap: ImageBitmap,
  p: FullImageBlurParams
): HTMLCanvasElement {
  if (p.mode === "gaussian") {
    return applyGaussianFull(bitmap, p.distancePx);
  }
  return applyMotionFull(bitmap, p.angleDeg, p.distancePx, p.samples);
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png"
    );
  });
}

/**
 * Per-pixel subject alpha 0–255 (opaque foreground). Same dimensions as target width/height.
 */
export async function getSubjectAlphaMask(
  file: File,
  width: number,
  height: number
): Promise<Uint8ClampedArray> {
  let maskBitmap: ImageBitmap | null = null;
  let sourceBitmap: ImageBitmap | null = null;
  try {
    let blob: Blob | null = null;
    try {
      blob = await removeBackgroundWithImgly(file);
    } catch {
      blob = null;
    }
    if (!blob || blob.size === 0) {
      sourceBitmap = await createImageBitmap(file);
      const canvas = removeSimpleBackgroundToCanvas(
        sourceBitmap,
        sourceBitmap.width,
        sourceBitmap.height
      );
      blob = await canvasToPngBlob(canvas);
    }
    maskBitmap = await createImageBitmap(blob);
    const mc = document.createElement("canvas");
    mc.width = width;
    mc.height = height;
    const mctx = mc.getContext("2d");
    if (!mctx) {
      throw new Error("NO_CONTEXT");
    }
    mctx.drawImage(maskBitmap, 0, 0, width, height);
    const { data } = mctx.getImageData(0, 0, width, height);
    const alpha = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) {
      alpha[i] = data[i * 4 + 3]!;
    }
    return alpha;
  } finally {
    maskBitmap?.close();
    sourceBitmap?.close();
  }
}

/** Composite: blurred background + sharp subject using mask alpha. */
export function compositeBackgroundBlur(
  originalBitmap: ImageBitmap,
  blurredCanvas: HTMLCanvasElement,
  subjectAlpha: Uint8ClampedArray
): HTMLCanvasElement {
  const w = originalBitmap.width;
  const h = originalBitmap.height;
  const oc = document.createElement("canvas");
  oc.width = w;
  oc.height = h;
  const octx = oc.getContext("2d");
  if (!octx) {
    throw new Error("NO_CONTEXT");
  }
  octx.drawImage(originalBitmap, 0, 0);
  const orig = octx.getImageData(0, 0, w, h);

  const bc = document.createElement("canvas");
  bc.width = w;
  bc.height = h;
  const bctx = bc.getContext("2d");
  if (!bctx) {
    throw new Error("NO_CONTEXT");
  }
  bctx.drawImage(blurredCanvas, 0, 0);
  const blur = bctx.getImageData(0, 0, w, h);

  const d = orig.data;
  const bd = blur.data;
  for (let i = 0; i < w * h; i++) {
    const m = subjectAlpha[i]! / 255;
    const j = i * 4;
    d[j] = bd[j]! * (1 - m) + d[j]! * m;
    d[j + 1] = bd[j + 1]! * (1 - m) + d[j + 1]! * m;
    d[j + 2] = bd[j + 2]! * (1 - m) + d[j + 2]! * m;
    d[j + 3] = 255;
  }

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ox = out.getContext("2d");
  if (!ox) {
    throw new Error("NO_CONTEXT");
  }
  ox.putImageData(orig, 0, 0);
  return out;
}
