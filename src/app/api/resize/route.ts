import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  finishImageJobJson,
  type ImageOutputItem,
} from "@/lib/build-image-download-response";
import { sanitizeStem } from "@/lib/image-zip-helpers";

export const runtime = "nodejs";

const MIN = 1;
const MAX = 8192;
const DEFAULT_W = 1920;
const DEFAULT_H = 1080;

function parseDimension(raw: FormDataEntryValue | null, fallback: number): number {
  const n = parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX, Math.max(MIN, n));
}

function outputKind(
  format: string | undefined
): "png" | "webp" | "jpeg" {
  switch (format) {
    case "png":
    case "gif":
      return "png";
    case "webp":
      return "webp";
    default:
      return "jpeg";
  }
}

async function resizeOne(
  buffer: Buffer,
  originalName: string,
  width: number,
  height: number
): Promise<{ fileName: string; data: Buffer }> {
  const pipeline = sharp(buffer).rotate();
  const meta = await pipeline.metadata();
  const resized = pipeline.resize(width, height, {
    fit: "cover",
    position: "centre",
  });
  const kind = outputKind(meta.format);
  let data: Buffer;
  if (kind === "png") {
    data = await resized.png({ compressionLevel: 9 }).toBuffer();
  } else if (kind === "webp") {
    data = await resized.webp({ quality: 90 }).toBuffer();
  } else {
    data = await resized.jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  }
  const ext = kind === "jpeg" ? "jpg" : kind;
  const fileName = `${sanitizeStem(originalName)}_${width}x${height}.${ext}`;
  return { fileName, data };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const width = parseDimension(formData.get("width"), DEFAULT_W);
    const height = parseDimension(formData.get("height"), DEFAULT_H);
    const entries = formData.getAll("images");
    const items: ImageOutputItem[] = [];

    for (const entry of entries) {
      if (!(entry instanceof File) || !entry.type.startsWith("image/")) {
        continue;
      }
      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      try {
        const { fileName, data } = await resizeOne(
          buffer,
          entry.name,
          width,
          height
        );
        items.push({ fileName, data });
      } catch {
        // skip unreadable or unsupported images
      }
    }

    return finishImageJobJson(items, `resized-${width}x${height}.zip`);
  } catch {
    return NextResponse.json(
      { error: "Server could not process the upload." },
      { status: 500 }
    );
  }
}
