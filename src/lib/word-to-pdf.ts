import mammoth from "mammoth";
import { jsPDF } from "jspdf";

function isDocxFile(file: File): boolean {
  const n = file.name.toLowerCase();
  if (n.endsWith(".docx")) return true;
  return (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function isLegacyDocFile(file: File): boolean {
  const n = file.name.toLowerCase();
  if (n.endsWith(".doc") && !n.endsWith(".docx")) return true;
  return file.type === "application/msword";
}

/** Output filename: `report.docx` → `report.pdf` */
export function pdfDownloadNameFromWord(fileName: string): string {
  const base = fileName.replace(/\.(docx?|DOCX?)$/i, "").trim() || "document";
  return `${base}.pdf`;
}

/**
 * Client-side Word → PDF: extracts text from .docx via mammoth, lays out with jsPDF.
 * Legacy `.doc` (binary) is not supported in the browser.
 */
export async function convertWordFileToPdfBlob(file: File): Promise<Blob> {
  if (isLegacyDocFile(file)) {
    throw new Error("DOC_LEGACY_UNSUPPORTED");
  }
  if (!isDocxFile(file)) {
    throw new Error("INVALID_WORD_FILE");
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value.trim() || " ";

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Converted from: ${file.name}`, margin, margin);
  let y = margin + 8;

  doc.setFontSize(11);
  doc.setTextColor(0);
  const lines = doc.splitTextToSize(text, maxLineWidth);
  const lineHeight = 6;

  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  return doc.output("blob");
}
