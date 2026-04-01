import { sanitizeStem, uniqueZipName } from "@/lib/image-zip-helpers";
import type { FaceBlurBox } from "@/lib/face-blur-blazeface";
import { imageFileKey } from "@/lib/image-file-key";
import { removeBackgroundWithImgly } from "@/lib/imgly-remove-background";
import { removeSimpleBackgroundToCanvas } from "@/lib/simple-remove-background";
import type { FullImageBlurParams } from "@/lib/image-blur-effects";
import {
  applyFullImageBlur,
  compositeBackgroundBlur,
  getSubjectAlphaMask,
} from "@/lib/image-blur-effects";

export type ClientImageResultFile = {
  name: string;
  contentType: string;
  data: string;
};

export type ClientImageProcessResult = {
  files: ClientImageResultFile[];
  zipSuggestedName: string;
};

const MIN = 1;
const MAX = 8192;
const WEBP_ENCODE_QUALITY = 0.9;
const JPEG_QUALITY = 0.92;

function clampDim(n: number): number {
  if (!Number.isFinite(n)) return 1920;
  return Math.min(MAX, Math.max(MIN, Math.round(n)));
}

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

function outputKindForMime(mime: string): "png" | "webp" | "jpeg" {
  if (mime === "image/png" || mime === "image/gif") return "png";
  if (mime === "image/webp") return "webp";
  return "jpeg";
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
      quality
    );
  });
}

let webpEncodeSupported: boolean | null = null;
function supportsWebpEncode(): boolean {
  if (webpEncodeSupported !== null) return webpEncodeSupported;
  if (typeof document === "undefined") return false;
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  webpEncodeSupported = c.toDataURL("image/webp").startsWith("data:image/webp");
  return webpEncodeSupported;
}

async function encodeResizeOutput(
  canvas: HTMLCanvasElement,
  kind: "png" | "webp" | "jpeg"
): Promise<Blob> {
  if (kind === "png") {
    return canvasToBlob(canvas, "image/png");
  }
  if (kind === "webp") {
    if (supportsWebpEncode()) {
      try {
        return await canvasToBlob(canvas, "image/webp", WEBP_ENCODE_QUALITY);
      } catch {
        /* fall through */
      }
    }
    return canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
  }
  return canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
}

/** Same idea as Sharp `cover` + `centre`. */
function drawCoverCentre(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sw: number,
  sh: number,
  W: number,
  H: number
): void {
  const scale = Math.max(W / sw, H / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const ox = (W - dw) / 2;
  const oy = (H - dh) / 2;
  ctx.drawImage(source, ox, oy, dw, dh);
}

export async function processResizeBatch(
  files: File[],
  width: number,
  height: number
): Promise<ClientImageProcessResult> {
  const W = clampDim(width);
  const H = clampDim(height);
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      drawCoverCentre(ctx, bitmap, bitmap.width, bitmap.height, W, H);

      const kind = outputKindForMime(file.type);
      const blob = await encodeResizeOutput(canvas, kind);
      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";
      const stem = sanitizeStem(file.name);
      const fileName = uniqueZipName(used, `${stem}_${W}x${H}.${ext}`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: blob.type || "application/octet-stream",
        data,
      });
    } catch {
      // skip unreadable
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: `resized-${W}x${H}.zip` };
}

/** Lossless-style recompression in the browser (canvas round-trip). */
export async function processCompressBatch(
  files: File[]
): Promise<ClientImageProcessResult> {
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(bitmap, 0, 0);

      const mime = file.type;
      let blob: Blob;
      let ext: string;

      if (
        mime === "image/png" ||
        mime === "image/gif" ||
        mime === "image/tiff"
      ) {
        blob = await canvasToBlob(canvas, "image/png");
        ext = "png";
      } else if (mime === "image/webp") {
        if (supportsWebpEncode()) {
          blob = await canvasToBlob(canvas, "image/webp", 1);
          ext = "webp";
        } else {
          blob = await canvasToBlob(canvas, "image/png");
          ext = "png";
        }
      } else if (mime === "image/jpeg" || mime === "image/jpg") {
        if (supportsWebpEncode()) {
          blob = await canvasToBlob(canvas, "image/webp", 1);
          ext = "webp";
        } else {
          blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
          ext = "jpg";
        }
      } else {
        blob = await canvasToBlob(canvas, "image/png");
        ext = "png";
      }

      const stem = sanitizeStem(file.name);
      const fileName = uniqueZipName(used, `${stem}_lossless.${ext}`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: blob.type || "application/octet-stream",
        data,
      });
    } catch {
      // skip
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: "compressed-lossless.zip" };
}

export async function processWebpBatch(
  files: File[]
): Promise<ClientImageProcessResult> {
  if (!supportsWebpEncode()) {
    throw new Error("WEBP_ENCODE_UNSUPPORTED");
  }

  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(bitmap, 0, 0);

      const blob = await canvasToBlob(
        canvas,
        "image/webp",
        WEBP_ENCODE_QUALITY
      );
      const stem = sanitizeStem(file.name);
      const fileName = uniqueZipName(used, `${stem}.webp`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: "image/webp",
        data,
      });
    } catch {
      // skip
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: "converted-webp.zip" };
}

/** Encode all raster images as JPEG (browser canvas). */
export async function processJpgBatch(
  files: File[]
): Promise<ClientImageProcessResult> {
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(bitmap, 0, 0);

      const blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
      const stem = sanitizeStem(file.name);
      const fileName = uniqueZipName(used, `${stem}.jpg`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: "image/jpeg",
        data,
      });
    } catch {
      // skip
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: "converted-jpg.zip" };
}

const HEIC_MIMES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

/** True for iPhone / macOS HEIC/HEIF uploads (MIME or extension). */
export function isHeicLike(file: File): boolean {
  const t = (file.type || "").toLowerCase().trim();
  if (HEIC_MIMES.has(t)) return true;
  const n = file.name.toLowerCase();
  return n.endsWith(".heic") || n.endsWith(".heif");
}

/** Decode HEIC/HEIF to JPEG in the browser (heic2any). */
export async function processHeicToJpgBatch(
  files: File[]
): Promise<ClientImageProcessResult> {
  const { default: heic2any } = await import("heic2any");
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];

  for (const file of files) {
    if (!isHeicLike(file)) continue;
    try {
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: JPEG_QUALITY,
      });
      const blobs = Array.isArray(converted) ? converted : [converted];
      let part = 0;
      for (const blob of blobs) {
        if (!(blob instanceof Blob) || blob.size === 0) continue;
        const data = await blobToBase64(blob);
        const stem = sanitizeStem(file.name);
        const suffix = blobs.length > 1 ? `-${part + 1}` : "";
        const fileName = uniqueZipName(used, `${stem}${suffix}.jpg`);
        filesOut.push({
          name: fileName,
          contentType: "image/jpeg",
          data,
        });
        part += 1;
      }
    } catch {
      /* skip file */
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: "heic-to-jpg.zip" };
}

/** Crop rectangle relative to each image (0–1), from the preview image’s pixel crop. */
export type NormalizedCrop = {
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

export async function processCropBatch(
  files: File[],
  norm: NormalizedCrop
): Promise<ClientImageProcessResult> {
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];

  const nx = Math.min(1, Math.max(0, norm.nx));
  const ny = Math.min(1, Math.max(0, norm.ny));
  let nw = Math.min(1 - nx, Math.max(0, norm.nw));
  let nh = Math.min(1 - ny, Math.max(0, norm.nh));
  if (nw <= 0 || nh <= 0) {
    throw new Error("INVALID_CROP");
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const iw = bitmap.width;
      const ih = bitmap.height;
      let x = Math.round(nx * iw);
      let y = Math.round(ny * ih);
      let w = Math.round(nw * iw);
      let h = Math.round(nh * ih);
      w = Math.max(1, Math.min(w, iw));
      h = Math.max(1, Math.min(h, ih));
      x = Math.max(0, Math.min(x, iw - w));
      y = Math.max(0, Math.min(y, ih - h));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(bitmap, x, y, w, h, 0, 0, w, h);

      const kind = outputKindForMime(file.type);
      const blob = await encodeResizeOutput(canvas, kind);
      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";
      const stem = sanitizeStem(file.name);
      const fileName = uniqueZipName(used, `${stem}_crop_${w}x${h}.${ext}`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: blob.type || "application/octet-stream",
        data,
      });
    } catch {
      // skip
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: "cropped-images.zip" };
}

/** Clockwise rotation applied in one shot (0 = unchanged pixels, still re-encoded). */
export type ImageRotateDegrees = 0 | 90 | 180 | 270;

function rotateToCanvas(
  bitmap: ImageBitmap,
  degrees: ImageRotateDegrees
): HTMLCanvasElement | null {
  const w = bitmap.width;
  const h = bitmap.height;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (degrees === 0) {
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bitmap, 0, 0);
    return canvas;
  }

  if (degrees === 90) {
    canvas.width = h;
    canvas.height = w;
    ctx.translate(h, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(bitmap, 0, 0);
  } else if (degrees === 180) {
    canvas.width = w;
    canvas.height = h;
    ctx.translate(w, h);
    ctx.rotate(Math.PI);
    ctx.drawImage(bitmap, 0, 0);
  } else {
    canvas.width = h;
    canvas.height = w;
    ctx.translate(0, w);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(bitmap, 0, 0);
  }
  return canvas;
}

/** Rotate each image by a multiple of 90° clockwise (0–270) in the browser. */
export async function processRotateBatch(
  files: File[],
  degrees: ImageRotateDegrees
): Promise<ClientImageProcessResult> {
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];
  const tag =
    degrees === 0 ? "0" : degrees === 90 ? "90" : degrees === 180 ? "180" : "270";

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const canvas = rotateToCanvas(bitmap, degrees);
      if (!canvas) continue;

      const mime = file.type;
      let blob: Blob;
      let ext: string;

      if (
        mime === "image/png" ||
        mime === "image/gif" ||
        mime === "image/tiff"
      ) {
        blob = await canvasToBlob(canvas, "image/png");
        ext = "png";
      } else if (mime === "image/webp") {
        if (supportsWebpEncode()) {
          blob = await canvasToBlob(canvas, "image/webp", 1);
          ext = "webp";
        } else {
          blob = await canvasToBlob(canvas, "image/png");
          ext = "png";
        }
      } else if (mime === "image/jpeg" || mime === "image/jpg") {
        if (supportsWebpEncode()) {
          blob = await canvasToBlob(canvas, "image/webp", 1);
          ext = "webp";
        } else {
          blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
          ext = "jpg";
        }
      } else {
        blob = await canvasToBlob(canvas, "image/png");
        ext = "png";
      }

      const stem = sanitizeStem(file.name);
      const fileName = uniqueZipName(used, `${stem}_r${tag}.${ext}`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: blob.type || "application/octet-stream",
        data,
      });
    } catch {
      // skip
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: `rotated-${tag}.zip` };
}

/** Blur face regions in the browser. Optional per-file box overrides from the preview editor. */
export async function processFaceBlurBatch(
  files: File[],
  blurPx: number,
  boxOverrides?: Readonly<Record<string, FaceBlurBox[]>>
): Promise<ClientImageProcessResult> {
  const { blurBitmapWithBoxes, getFaceBoxesFromBitmap } = await import(
    "@/lib/face-blur-blazeface"
  );
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const key = imageFileKey(file);
      const override = boxOverrides?.[key];
      const boxes: FaceBlurBox[] =
        override !== undefined
          ? override
          : await getFaceBoxesFromBitmap(bitmap);
      const canvas = blurBitmapWithBoxes(bitmap, boxes, blurPx);
      const kind = outputKindForMime(file.type);
      const blob = await encodeResizeOutput(canvas, kind);
      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";
      const stem = sanitizeStem(file.name);
      const fileName = uniqueZipName(used, `${stem}_faces_blurred.${ext}`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: blob.type || "application/octet-stream",
        data,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "FACE_BLUR_MODEL_FAILED") {
        throw e;
      }
      // skip unreadable / detection failure for this file
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: "faces-blurred.zip" };
}

/**
 * Remove backgrounds (transparent PNG) via @imgly/background-removal (ML).
 * Falls back to edge-based `simple-remove-background` if imgly fails (e.g. WASM/network).
 */
export async function processRemoveBackgroundBatch(
  files: File[]
): Promise<ClientImageProcessResult> {
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];
  let attemptedImage = false;

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    attemptedImage = true;
    let bitmap: ImageBitmap | null = null;
    try {
      let blob: Blob | null = null;
      try {
        blob = await removeBackgroundWithImgly(file);
      } catch {
        blob = null;
      }
      if (!blob || blob.size === 0) {
        bitmap = await createImageBitmap(file);
        const canvas = removeSimpleBackgroundToCanvas(
          bitmap,
          bitmap.width,
          bitmap.height
        );
        blob = await canvasToBlob(canvas, "image/png");
      }
      const stem = sanitizeStem(file.name);
      const fileName = uniqueZipName(used, `${stem}_nobg.png`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: "image/png",
        data,
      });
    } catch {
      /* skip unreadable */
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    if (attemptedImage) {
      throw new Error("REMOVE_BG_FAILED");
    }
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: "background-removed.zip" };
}

export type ImageBlurBatchOptions = FullImageBlurParams & {
  blurBackground: boolean;
};

/** Gaussian or motion blur; optional background-only blur via segmentation mask. */
export async function processImageBlurBatch(
  files: File[],
  options: ImageBlurBatchOptions
): Promise<ClientImageProcessResult> {
  const used = new Set<string>();
  const filesOut: ClientImageResultFile[] = [];
  const params: FullImageBlurParams = {
    mode: options.mode,
    angleDeg: options.angleDeg,
    distancePx: options.distancePx,
    samples: options.samples,
  };

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const w = bitmap.width;
      const h = bitmap.height;
      let canvas = applyFullImageBlur(bitmap, params);

      if (options.blurBackground) {
        try {
          const mask = await getSubjectAlphaMask(file, w, h);
          canvas = compositeBackgroundBlur(bitmap, canvas, mask);
        } catch {
          /* keep full-image blur if mask fails */
        }
      }

      const kind = outputKindForMime(file.type);
      const blob = await encodeResizeOutput(canvas, kind);
      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";
      const stem = sanitizeStem(file.name);
      const tag = options.mode === "gaussian" ? "gauss_blur" : "motion_blur";
      const fileName = uniqueZipName(used, `${stem}_${tag}.${ext}`);
      const data = await blobToBase64(blob);
      filesOut.push({
        name: fileName,
        contentType: blob.type || "application/octet-stream",
        data,
      });
    } catch {
      // skip unreadable
    } finally {
      bitmap?.close();
    }
  }

  if (filesOut.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }
  return { files: filesOut, zipSuggestedName: "blurred-images.zip" };
}
