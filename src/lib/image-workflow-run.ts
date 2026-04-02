import JSZip from "jszip";
import type {
  ClientImageProcessResult,
  ClientImageResultFile,
} from "@/lib/client-image-jobs";
import {
  processCompressBatch,
  processJpgBatch,
  processResizeBatch,
  processRotateBatch,
  processWebpBatch,
} from "@/lib/client-image-jobs";
import type { ImageWorkflowStep } from "@/lib/image-workflow-types";

function base64ToBlob(base64: string, contentType: string): Blob {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
}

function resultFilesToFileInputs(files: ClientImageResultFile[]): File[] {
  return files.map((f) => {
    const blob = base64ToBlob(f.data, f.contentType);
    return new File([blob], f.name, { type: f.contentType });
  });
}

export type ImageWorkflowRunResult = {
  files: ClientImageResultFile[];
  zipSuggestedName: string;
};

export async function runImageWorkflow(
  files: File[],
  steps: ImageWorkflowStep[]
): Promise<ImageWorkflowRunResult> {
  if (steps.length === 0) throw new Error("no_steps");
  if (files.length === 0) throw new Error("need_images");

  let currentFiles = files;
  let lastResult: ClientImageProcessResult | null = null;

  for (const step of steps) {
    if (step.kind === "resize") {
      lastResult = await processResizeBatch(
        currentFiles,
        step.width,
        step.height
      );
    } else if (step.kind === "compress") {
      lastResult = await processCompressBatch(currentFiles);
    } else if (step.kind === "rotate") {
      lastResult = await processRotateBatch(currentFiles, step.degrees);
    } else if (step.kind === "to_jpg") {
      lastResult = await processJpgBatch(currentFiles);
    } else if (step.kind === "to_webp") {
      lastResult = await processWebpBatch(currentFiles);
    }

    currentFiles = resultFilesToFileInputs(lastResult.files);
  }

  return {
    files: lastResult?.files ?? [],
    zipSuggestedName: lastResult?.zipSuggestedName ?? "images.zip",
  };
}

export async function zipImageWorkflowResult(
  result: ImageWorkflowRunResult
): Promise<Blob> {
  const zip = new JSZip();
  for (const item of result.files) {
    const blob = base64ToBlob(item.data, item.contentType);
    const buf = await blob.arrayBuffer();
    zip.file(item.name, buf);
  }
  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });
}

