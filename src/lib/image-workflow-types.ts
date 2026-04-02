export type ImageWorkflowRotateDegrees = 0 | 90 | 180 | 270;

export type ImageWorkflowStep =
  | { id: string; kind: "resize"; width: number; height: number }
  | { id: string; kind: "compress" }
  | { id: string; kind: "rotate"; degrees: ImageWorkflowRotateDegrees }
  | { id: string; kind: "to_jpg" }
  | { id: string; kind: "to_webp" };

const STORAGE_KEY = "ipdf-image-workflow-v1";

export type StoredImageWorkflow = {
  name: string;
  steps: ImageWorkflowStep[];
};

export function loadImageWorkflowFromStorage(): StoredImageWorkflow | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredImageWorkflow;
    if (!data || typeof data.name !== "string" || !Array.isArray(data.steps)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveImageWorkflowToStorage(data: StoredImageWorkflow): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function newImageStepId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `is-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

