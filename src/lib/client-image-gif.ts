import { GIFEncoder, quantize, applyPalette } from "gifenc";

export type ClientImageResultFile = {
  name: string;
  contentType: string;
  data: string;
};

export type ClientImageProcessResult = {
  files: ClientImageResultFile[];
  zipSuggestedName: string;
};

export type GifEncodeOptions = {
  /** Display time for each frame (delay between frames). */
  secondsPerImage: number;
  /** If true, GIF loops forever; if false, plays once. */
  loop: boolean;
};

const GIF_CAP = 1280;

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

function capDimensions(w: number, h: number): { W: number; H: number } {
  if (w <= GIF_CAP && h <= GIF_CAP) return { W: w, H: h };
  const s = GIF_CAP / Math.max(w, h);
  return { W: Math.max(1, Math.round(w * s)), H: Math.max(1, Math.round(h * s)) };
}

/** Build one animated GIF from multiple images (browser only). */
export async function processGifBatch(
  files: File[],
  options: GifEncodeOptions
): Promise<ClientImageProcessResult> {
  const secs = Math.min(30, Math.max(0.05, Number(options.secondsPerImage) || 1));
  const delayMs = secs * 1000;
  const loopForever = options.loop;
  const repeat = loopForever ? 0 : -1;

  const imageFiles = files.filter((f) => f.type.startsWith("image/"));
  if (imageFiles.length === 0) {
    throw new Error("NO_VALID_IMAGES");
  }

  const bitmaps: ImageBitmap[] = [];
  try {
    for (const f of imageFiles) {
      bitmaps.push(await createImageBitmap(f));
    }

    let maxW = 0;
    let maxH = 0;
    for (const b of bitmaps) {
      maxW = Math.max(maxW, b.width);
      maxH = Math.max(maxH, b.height);
    }
    const { W, H } = capDimensions(maxW, maxH);

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("NO_CANVAS");
    }

    const gif = GIFEncoder();

    for (let i = 0; i < bitmaps.length; i++) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      const b = bitmaps[i];
      const scale = Math.min(W / b.width, H / b.height);
      const dw = Math.round(b.width * scale);
      const dh = Math.round(b.height * scale);
      const ox = Math.floor((W - dw) / 2);
      const oy = Math.floor((H - dh) / 2);
      ctx.drawImage(b, ox, oy, dw, dh);

      const imageData = ctx.getImageData(0, 0, W, H);
      const palette = quantize(imageData.data, 256);
      const index = applyPalette(imageData.data, palette);

      gif.writeFrame(index, W, H, {
        palette,
        delay: delayMs,
        repeat: i === 0 ? repeat : undefined,
      });
    }

    gif.finish();
    const bytes = gif.bytes();
    const buf = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([buf], { type: "image/gif" });
    const data = await blobToBase64(blob);

    return {
      files: [
        {
          name: "animation.gif",
          contentType: "image/gif",
          data,
        },
      ],
      zipSuggestedName: "animation.zip",
    };
  } finally {
    for (const b of bitmaps) {
      b.close();
    }
  }
}
