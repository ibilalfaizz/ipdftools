import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  finishImageJobJson,
  type ImageOutputItem,
} from "@/lib/build-image-download-response";
import { sanitizeStem } from "@/lib/image-zip-helpers";

export const runtime = "nodejs";

const WEBP_QUALITY = 90;

async function toWebp(
  buffer: Buffer,
  originalName: string
): Promise<{ fileName: string; data: Buffer }> {
  const data = await sharp(buffer)
    .rotate()
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      alphaQuality: 100,
    })
    .toBuffer();

  const fileName = `${sanitizeStem(originalName)}.webp`;
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
        const { fileName, data } = await toWebp(buffer, entry.name);
        items.push({ fileName, data });
      } catch {
        // skip unreadable or unsupported images
      }
    }

    return finishImageJobJson(items, "converted-webp.zip");
  } catch {
    return NextResponse.json(
      { error: "Server could not process the upload." },
      { status: 500 }
    );
  }
}
