export type WorkflowRotateAngle = 90 | 180 | 270;

export type PdfWorkflowStep =
  | { id: string; kind: "merge" }
  | { id: string; kind: "compress" }
  | { id: string; kind: "rotate"; angle: WorkflowRotateAngle }
  | {
      id: string;
      kind: "split";
      mode: "individual" | "range";
      ranges?: string;
    };

const STORAGE_KEY = "ipdf-pdf-workflow-v1";

export type StoredWorkflow = {
  name: string;
  steps: PdfWorkflowStep[];
};

export function loadWorkflowFromStorage(): StoredWorkflow | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredWorkflow;
    if (!data || typeof data.name !== "string" || !Array.isArray(data.steps)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveWorkflowToStorage(data: StoredWorkflow): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

export function newStepId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** After a split step, no further PDF steps apply. */
export function workflowHasTerminalSplit(steps: PdfWorkflowStep[]): boolean {
  return steps.some((s) => s.kind === "split");
}

export function canAddMergeAsFirst(steps: PdfWorkflowStep[]): boolean {
  return steps.length === 0;
}
