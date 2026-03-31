import { getPdfJs } from "@/lib/pdfjs-client";

/** Extract plain text from a PDF (all pages) using PDF.js. */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: unknown) => {
        if (item && typeof item === "object" && "str" in item) {
          return String((item as { str: string }).str);
        }
        return "";
      })
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}
