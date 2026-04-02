import { PDFDocument } from "pdf-lib";

/** Merge one or more PDFs in order; runs entirely in the browser. */
export async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
  if (files.length < 1) {
    throw new Error("merge_needs_files");
  }
  const merged = await PDFDocument.create();
  for (const file of files) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const pdf = await PDFDocument.load(buf);
    const copied = await merged.copyPages(pdf, pdf.getPageIndices());
    copied.forEach((p) => merged.addPage(p));
  }
  return new Uint8Array(
    await merged.save({ useObjectStreams: false, addDefaultPage: false })
  );
}
