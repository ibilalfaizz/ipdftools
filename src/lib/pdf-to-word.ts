import { Document, Packer, Paragraph, TextRun } from "docx";
import { extractTextFromPdf } from "@/lib/pdf-extract-text";

/** Output filename: `report.pdf` → `report.docx` */
export function docxDownloadNameFromPdf(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, "").trim() || "document";
  return `${base}.docx`;
}

/**
 * Client-side PDF → Word: extracts text with PDF.js, builds a real .docx via `docx`.
 * Layout and images are not preserved (text only).
 */
export async function convertPdfFileToDocxBlob(file: File): Promise<Blob> {
  const raw = (await extractTextFromPdf(file))
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trimEnd();

  const placeholder =
    "[No extractable text — this PDF may be image-only, scanned, or protected.]";
  const body = raw.length > 0 ? raw : placeholder;
  const lines = body.split("\n");

  const paragraphs = lines.map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line.length > 0 ? line : "\u00A0",
          }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  return Packer.toBlob(doc);
}
