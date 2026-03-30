import { sanitizeStem, uniqueZipName } from "@/lib/image-zip-helpers";

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
