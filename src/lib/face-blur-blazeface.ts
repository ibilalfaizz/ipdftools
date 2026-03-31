/**
 * Browser-only face detection (BlazeFace) + canvas blur for privacy.
 * Loaded on demand to keep initial bundle smaller.
 */

import type { NormalizedFace } from "@tensorflow-models/blazeface";

let modelPromise: Promise<import("@tensorflow-models/blazeface").BlazeFaceModel> | null =
  null;

export async function loadBlazeFace() {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        const tf = await import("@tensorflow/tfjs");
        await tf.ready();
        const blazeface = await import("@tensorflow-models/blazeface");
        return await blazeface.load({
          maxFaces: 8,
          scoreThreshold: 0.45,
        });
      } catch {
        throw new Error("FACE_BLUR_MODEL_FAILED");
      }
    })();
  }
  return modelPromise;
}

function vec2(v: NormalizedFace["topLeft"]): [number, number] {
  if (Array.isArray(v) && v.length >= 2) {
    const a = Number(v[0]);
    const b = Number(v[1]);
    if (Number.isFinite(a) && Number.isFinite(b)) return [a, b];
  }
  return [0, 0];
}

function faceBoxes(
  faces: NormalizedFace[],
  iw: number,
  ih: number
): { x: number; y: number; w: number; h: number }[] {
  const out: { x: number; y: number; w: number; h: number }[] = [];
  for (const f of faces) {
    const [x1, y1] = vec2(f.topLeft);
    const [x2, y2] = vec2(f.bottomRight);
    let x = Math.min(x1, x2);
    let y = Math.min(y1, y2);
    let w = Math.abs(x2 - x1);
    let h = Math.abs(y2 - y1);
    if (w < 2 || h < 2) continue;
    const pad = 0.14 * Math.max(w, h);
    x = Math.max(0, Math.floor(x - pad));
    y = Math.max(0, Math.floor(y - pad));
    w = Math.min(iw - x, Math.ceil(w + 2 * pad));
    h = Math.min(ih - y, Math.ceil(h + 2 * pad));
    if (w >= 2 && h >= 2) out.push({ x, y, w, h });
  }
  return out;
}

export type FaceBlurBox = { x: number; y: number; w: number; h: number };

/** Run BlazeFace once; use with `blurBitmapWithBoxes` for fast slider previews. */
export async function getFaceBoxesFromBitmap(
  bitmap: ImageBitmap
): Promise<FaceBlurBox[]> {
  const iw = bitmap.width;
  const ih = bitmap.height;
  const prep = document.createElement("canvas");
  prep.width = iw;
  prep.height = ih;
  const pctx = prep.getContext("2d");
  if (!pctx) {
    throw new Error("NO_CONTEXT");
  }
  pctx.drawImage(bitmap, 0, 0);

  const model = await loadBlazeFace();
  let faces: NormalizedFace[];
  try {
    faces = await model.estimateFaces(prep, false, false, false);
  } catch {
    throw new Error("FACE_DETECT_FAILED");
  }

  return faceBoxes(faces, iw, ih);
}

/** Canvas-only blur using precomputed boxes (no ML). */
export function blurBitmapWithBoxes(
  bitmap: ImageBitmap,
  boxes: FaceBlurBox[],
  blurPx: number
): HTMLCanvasElement {
  const iw = bitmap.width;
  const ih = bitmap.height;

  const prep = document.createElement("canvas");
  prep.width = iw;
  prep.height = ih;
  const pctx = prep.getContext("2d");
  if (!pctx) {
    throw new Error("NO_CONTEXT");
  }
  pctx.drawImage(bitmap, 0, 0);

  if (boxes.length === 0) {
    return prep;
  }

  const b = Math.min(72, Math.max(4, blurPx));

  let work: HTMLCanvasElement = prep;
  for (const box of boxes) {
    const temp = document.createElement("canvas");
    temp.width = iw;
    temp.height = ih;
    const tctx = temp.getContext("2d");
    if (!tctx) continue;
    tctx.drawImage(work, 0, 0);
    tctx.save();
    tctx.beginPath();
    tctx.rect(box.x, box.y, box.w, box.h);
    tctx.clip();
    tctx.filter = `blur(${b}px)`;
    tctx.drawImage(work, 0, 0);
    tctx.restore();
    work = temp;
  }

  return work;
}

/**
 * Detects faces with BlazeFace and applies a strong Gaussian-style blur inside each box.
 * Returns a canvas with the same dimensions as the bitmap (unchanged if no faces).
 */
export async function blurBitmapFaces(
  bitmap: ImageBitmap,
  blurPx: number
): Promise<HTMLCanvasElement> {
  const boxes = await getFaceBoxesFromBitmap(bitmap);
  return blurBitmapWithBoxes(bitmap, boxes, blurPx);
}
