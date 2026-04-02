import { PDFDocument, degrees } from "pdf-lib";
import type { WorkflowRotateAngle } from "./pdf-workflow-types";

export async function compressPdfBytes(bytes: Uint8Array): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes);
  return new Uint8Array(
    await pdf.save({ useObjectStreams: false, addDefaultPage: false })
  );
}

export async function rotatePdfBytes(
  bytes: Uint8Array,
  angleDeg: WorkflowRotateAngle
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes);
  for (const page of pdf.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees(current + angleDeg));
  }
  return new Uint8Array(
    await pdf.save({ useObjectStreams: false, addDefaultPage: false })
  );
}

export function parsePageRanges(
  rangesStr: string,
  pageCount: number
): number[][] {
  const ranges: number[][] = [];
  const parts = rangesStr.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
      if (
        Number.isFinite(a) &&
        Number.isFinite(b) &&
        a >= 1 &&
        b >= a &&
        b <= pageCount
      ) {
        const range: number[] = [];
        for (let i = a; i <= b; i++) {
          range.push(i - 1);
        }
        ranges.push(range);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (pageNum >= 1 && pageNum <= pageCount) {
        ranges.push([pageNum - 1]);
      }
    }
  }

  return ranges;
}

export async function splitPdfToParts(
  bytes: Uint8Array,
  mode: "individual" | "range",
  rangesStr: string | undefined,
  baseStem: string
): Promise<{ name: string; bytes: Uint8Array }[]> {
  const originalPdf = await PDFDocument.load(bytes);
  const pageCount = originalPdf.getPageCount();

  let pagesToSplit: number[][];

  if (mode === "individual") {
    pagesToSplit = Array.from({ length: pageCount }, (_, i) => [i]);
  } else {
    pagesToSplit = parsePageRanges(rangesStr || "", pageCount);
    if (pagesToSplit.length === 0) {
      throw new Error("invalid_ranges");
    }
  }

  const out: { name: string; bytes: Uint8Array }[] = [];
  const safeStem = baseStem.replace(/\.pdf$/i, "") || "document";

  for (let i = 0; i < pagesToSplit.length; i++) {
    const newPdf = await PDFDocument.create();
    const pageIndices = pagesToSplit[i];
    const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save({
      useObjectStreams: false,
      addDefaultPage: false,
    });
    const u8 = new Uint8Array(pdfBytes);

    let name: string;
    if (mode === "individual") {
      name = `${safeStem}_page_${pageIndices[0] + 1}.pdf`;
    } else {
      const rangeStr =
        pageIndices.length === 1
          ? `page_${pageIndices[0] + 1}`
          : `pages_${pageIndices[0] + 1}-${pageIndices[pageIndices.length - 1] + 1}`;
      name = `${safeStem}_${rangeStr}.pdf`;
    }
    out.push({ name, bytes: u8 });
  }

  return out;
}
