/** Session keys: survive redirect to login and back in the same tab. */
export const PENDING_PDF_WORKFLOW_KEY = "ipdf-pending-pdf-workflow-v1";
export const PENDING_IMAGE_WORKFLOW_KEY = "ipdf-pending-image-workflow-v1";

/** `next` / return paths use English canonical routes (see LanguageContext getLocalizedPath). */
export const RETURN_PATH = {
  pdfWorkflow: "/pdf-workflow",
  imageWorkflow: "/image-workflow",
} as const;

export function writePendingPdfWorkflow(payload: { name: string; steps: unknown }) {
  sessionStorage.setItem(PENDING_PDF_WORKFLOW_KEY, JSON.stringify(payload));
}

export function writePendingImageWorkflow(payload: { name: string; steps: unknown }) {
  sessionStorage.setItem(PENDING_IMAGE_WORKFLOW_KEY, JSON.stringify(payload));
}

export function readPendingPdfWorkflow(): { name: string; steps: unknown } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_PDF_WORKFLOW_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { name?: unknown; steps?: unknown };
    if (typeof data.name !== "string" || !Array.isArray(data.steps)) return null;
    return { name: data.name, steps: data.steps };
  } catch {
    return null;
  }
}

export function readPendingImageWorkflow(): { name: string; steps: unknown } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_IMAGE_WORKFLOW_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { name?: unknown; steps?: unknown };
    if (typeof data.name !== "string" || !Array.isArray(data.steps)) return null;
    return { name: data.name, steps: data.steps };
  } catch {
    return null;
  }
}

export function clearPendingPdfWorkflow() {
  sessionStorage.removeItem(PENDING_PDF_WORKFLOW_KEY);
}

export function clearPendingImageWorkflow() {
  sessionStorage.removeItem(PENDING_IMAGE_WORKFLOW_KEY);
}
