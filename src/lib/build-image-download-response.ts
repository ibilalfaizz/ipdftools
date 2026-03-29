import { NextResponse } from "next/server";
import { uniqueZipName } from "@/lib/image-zip-helpers";

export type ImageOutputItem = { fileName: string; data: Buffer };

function contentTypeForFilename(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}

/** Always JSON so the client can offer ZIP vs separate downloads without reprocessing. */
export function finishImageJobJson(
  items: ImageOutputItem[],
  zipSuggestedName: string
): NextResponse {
  if (items.length === 0) {
    return NextResponse.json(
      { error: "No valid image files were processed." },
      { status: 400 }
    );
  }

  const used = new Set<string>();
  const uniqueItems: ImageOutputItem[] = items.map(({ fileName, data }) => ({
    fileName: uniqueZipName(used, fileName),
    data,
  }));

  return NextResponse.json(
    {
      files: uniqueItems.map(({ fileName, data }) => ({
        name: fileName,
        contentType: contentTypeForFilename(fileName),
        data: data.toString("base64"),
      })),
      zipSuggestedName: zipSuggestedName.replace(/"/g, ""),
    },
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
