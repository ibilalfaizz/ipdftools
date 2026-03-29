import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  finishImageJobJson,
  type ImageOutputItem,
} from "@/lib/build-image-download-response";
import { sanitizeStem } from "@/lib/image-zip-helpers";

export const runtime = "nodejs";

async function compressLossless(
  buffer: Buffer,
  originalName: string
): Promise<{ fileName: string; data: Buffer }> {
  const pipeline = sharp(buffer).rotate();
  const meta = await pipeline.metadata();
  const format = meta.format;

  let data: Buffer;
  let ext: string;

  switch (format) {
    case "png":
    case "gif":
    case "tiff":
    case "raw":
      data = await pipeline
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: false,
        })
        .toBuffer();
      ext = "png";
      break;
    case "webp":
      data = await pipeline.webp({ lossless: true, effort: 6 }).toBuffer();
      ext = "webp";
      break;
    case "jpeg":
    case "jpg":
      data = await pipeline.webp({ lossless: true, effort: 6 }).toBuffer();
      ext = "webp";
      break;
    default:
      data = await pipeline
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: false,
        })
        .toBuffer();
      ext = "png";
  }

  const fileName = `${sanitizeStem(originalName)}_lossless.${ext}`;
  return { fileName, data };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const entries = formData.getAll("images");
    const items: ImageOutputItem[] = [];

    for (const entry of entries) {
      if (!(entry instanceof File) || !entry.type.startsWith("image/")) {
        continue;
      }
      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      try {
        const { fileName, data } = await compressLossless(buffer, entry.name);
        items.push({ fileName, data });
      } catch {
        // skip unreadable or unsupported images
      }
    }

    return finishImageJobJson(items, "compressed-lossless.zip");
  } catch {
    return NextResponse.json(
      { error: "Server could not process the upload." },
      { status: 500 }
    );
  }
}
