/**
 * Edge-based solid-background removal: estimates background from border pixels
 * and makes similar colors transparent. Works best when the backdrop is fairly
 * uniform and visible along the edges (studio white/gray, walls, green screen).
 */

type RGB = [number, number, number];

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function pixelAt(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): RGB {
  const cx = clamp(Math.floor(x), 0, width - 1);
  const cy = clamp(Math.floor(y), 0, height - 1);
  const i = (cy * width + cx) * 4;
  return [data[i], data[i + 1], data[i + 2]];
}

function colorDistance(a: RGB, b: RGB): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** Quantize to 4-bit channels and pick the most common bucket on the image border. */
function dominantEdgeColor(samples: RGB[]): RGB {
  if (samples.length === 0) return [255, 255, 255];
  const map = new Map<string, { n: number; sum: RGB }>();
  for (const s of samples) {
    const key = `${s[0] >> 4}_${s[1] >> 4}_${s[2] >> 4}`;
    const cur = map.get(key);
    if (cur) {
      cur.n += 1;
      cur.sum[0] += s[0];
      cur.sum[1] += s[1];
      cur.sum[2] += s[2];
    } else {
      map.set(key, { n: 1, sum: [s[0], s[1], s[2]] });
    }
  }
  let best = map.values().next().value as { n: number; sum: RGB };
  for (const v of map.values()) {
    if (v.n > best.n) best = v;
  }
  return [
    best.sum[0] / best.n,
    best.sum[1] / best.n,
    best.sum[2] / best.n,
  ];
}

function collectEdgeSamples(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  stride: number
): RGB[] {
  const out: RGB[] = [];
  for (let x = 0; x < width; x += stride) {
    out.push(pixelAt(data, width, height, x, 0));
    out.push(pixelAt(data, width, height, x, height - 1));
  }
  for (let y = 0; y < height; y += stride) {
    out.push(pixelAt(data, width, height, 0, y));
    out.push(pixelAt(data, width, height, width - 1, y));
  }
  return out;
}

export type SimpleRemoveBgOptions = {
  /** Euclidean RGB distance below (minus softness) → fully transparent. Default 38. */
  tolerance?: number;
  /** Feather band width for partial transparency. Default 10. */
  edgeSoftness?: number;
};

/**
 * Draw `source` (full `sw`×`sh`) into a new canvas and remove background-like pixels.
 */
export function removeSimpleBackgroundToCanvas(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  options?: SimpleRemoveBgOptions
): HTMLCanvasElement {
  const tolerance = options?.tolerance ?? 38;
  const edgeSoftness = Math.max(1, options?.edgeSoftness ?? 10);

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("NO_CONTEXT");
  }
  ctx.drawImage(source, 0, 0, sw, sh);
  const imageData = ctx.getImageData(0, 0, sw, sh);
  const d = imageData.data;

  const stride = Math.max(1, Math.floor(Math.min(sw, sh) / 64));
  const edgeSamples = collectEdgeSamples(d, sw, sh, stride);
  const bg = dominantEdgeColor(edgeSamples);

  const inner = tolerance - edgeSoftness;
  const outer = tolerance + edgeSoftness;
  const band = outer - inner || 1;

  for (let i = 0; i < d.length; i += 4) {
    const dist = colorDistance([d[i], d[i + 1], d[i + 2]], bg);
    const baseA = d[i + 3];
    if (dist <= inner) {
      d[i + 3] = 0;
    } else if (dist >= outer) {
      /* keep */
    } else {
      const t = (dist - inner) / band;
      d[i + 3] = Math.round(clamp(baseA * t, 0, 255));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
