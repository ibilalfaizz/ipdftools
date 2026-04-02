import JSZip from "jszip";
import { mergePdfFiles } from "./pdf-merge-client";
import {
  compressPdfBytes,
  rotatePdfBytes,
  splitPdfToParts,
} from "./pdf-workflow-ops";
import type { PdfWorkflowStep } from "./pdf-workflow-types";

export type PdfWorkflowRunResult =
  | { result: "single"; bytes: Uint8Array; downloadName: string }
  | { result: "zip"; blob: Blob; downloadName: string };

function stemFromFiles(files: File[]): string {
  const first = files[0]?.name;
  if (!first) return "document";
  return first.replace(/\.pdf$/i, "") || "document";
}

export async function runPdfWorkflow(
  files: File[],
  steps: PdfWorkflowStep[],
  baseStem?: string
): Promise<PdfWorkflowRunResult> {
  if (steps.length === 0) {
    throw new Error("no_steps");
  }

  const stem = baseStem ?? stemFromFiles(files);
  let bytes: Uint8Array;
  let i = 0;

  if (steps[0].kind === "merge") {
    if (files.length < 2) {
      throw new Error("merge_needs_two");
    }
    bytes = await mergePdfFiles(files);
    i = 1;
  } else {
    if (files.length < 1) {
      throw new Error("need_pdf");
    }
    bytes = new Uint8Array(await files[0].arrayBuffer());
  }

  for (; i < steps.length; i++) {
    const s = steps[i];
    if (s.kind === "merge") {
      throw new Error("merge_not_first");
    }
    if (s.kind === "compress") {
      bytes = await compressPdfBytes(bytes);
    } else if (s.kind === "rotate") {
      bytes = await rotatePdfBytes(bytes, s.angle);
    } else if (s.kind === "split") {
      const parts = await splitPdfToParts(bytes, s.mode, s.ranges, stem);
      const zip = new JSZip();
      for (const p of parts) {
        zip.file(p.name, p.bytes);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      return {
        result: "zip",
        blob,
        downloadName: `${stem}-split.zip`,
      };
    }
  }

  return {
    result: "single",
    bytes,
    downloadName: `${stem}-workflow.pdf`,
  };
}
