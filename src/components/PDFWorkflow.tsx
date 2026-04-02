"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Trash2,
  Loader2,
  GitBranch,
  Merge,
  Minimize,
  RotateCw,
  Scissors,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileUploadZone from "@/components/FileUploadZone";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { runPdfWorkflow } from "@/lib/pdf-workflow-run";
import type { PdfWorkflowStep, WorkflowRotateAngle } from "@/lib/pdf-workflow-types";
import {
  canAddMergeAsFirst,
  loadWorkflowFromStorage,
  newStepId,
  saveWorkflowToStorage,
  workflowHasTerminalSplit,
} from "@/lib/pdf-workflow-types";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteWorkflow,
  getWorkflowById,
  listWorkflows,
  upsertWorkflow,
  type WorkflowRow,
} from "@/lib/workflows/supabase-workflow-store";
import {
  PENDING_PDF_WORKFLOW_KEY,
  RETURN_PATH,
  clearPendingPdfWorkflow,
  readPendingPdfWorkflow,
  writePendingPdfWorkflow,
} from "@/lib/workflows/pending-workflow-storage";

type PendingTool =
  | "merge"
  | "compress"
  | "rotate"
  | "split_individual"
  | "split_range";

function stepSummary(t: (k: string) => string, step: PdfWorkflowStep): string {
  switch (step.kind) {
    case "merge":
      return t("workflow.step_merge");
    case "compress":
      return t("workflow.step_compress");
    case "rotate":
      return t(`workflow.step_rotate_${step.angle}`);
    case "split":
      return step.mode === "individual"
        ? t("workflow.step_split_each")
        : `${t("workflow.step_split_ranges")}: ${step.ranges?.trim() || "—"}`;
    default:
      return "";
  }
}

function stepIcon(step: PdfWorkflowStep) {
  switch (step.kind) {
    case "merge":
      return <Merge className="h-5 w-5" />;
    case "compress":
      return <Minimize className="h-5 w-5" />;
    case "rotate":
      return <RotateCw className="h-5 w-5" />;
    case "split":
      return <Scissors className="h-5 w-5" />;
    default:
      return null;
  }
}

export default function PDFWorkflow() {
  const { t, getLocalizedPath } = useLanguage();
  const router = useRouter();
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<PdfWorkflowStep[]>([]);
  const [saved, setSaved] = useState<WorkflowRow[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string>("");
  const [signedIn, setSignedIn] = useState(false);
  const [pendingTool, setPendingTool] = useState<PendingTool>("compress");
  const [pendingAngle, setPendingAngle] = useState<WorkflowRotateAngle>(90);
  const [pendingRanges, setPendingRanges] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydratedRef = useRef(false);
  const prevMergeFirstRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wf = new URLSearchParams(window.location.search).get("wf");
    if (wf) {
      clearPendingPdfWorkflow();
      hydratedRef.current = true;
      return;
    }
    const stored = loadWorkflowFromStorage();
    if (stored) {
      setWorkflowName(stored.name);
      setSteps(stored.steps);
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveWorkflowToStorage({ name: workflowName, steps });
  }, [workflowName, steps]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setSignedIn(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshSaved = useCallback(async () => {
    if (!signedIn) {
      setSaved([]);
      setSelectedSavedId("");
      return;
    }
    try {
      const rows = await listWorkflows("pdf_workflows");
      setSaved(rows);
    } catch {
      // ignore until tables exist
    }
  }, [signedIn]);

  useEffect(() => {
    void refreshSaved();
  }, [refreshSaved]);

  useEffect(() => {
    if (!signedIn || typeof window === "undefined") return;
    const wf = new URLSearchParams(window.location.search).get("wf");
    if (!wf) return;
    let cancelled = false;
    void (async () => {
      try {
        const row = await getWorkflowById("pdf_workflows", wf);
        if (cancelled || !row) return;
        setWorkflowName(row.name);
        setSteps((row.steps as PdfWorkflowStep[]) || []);
        setSelectedSavedId(row.id);
        const url = new URL(window.location.href);
        url.searchParams.delete("wf");
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch {
        toast.error(t("workflow.load_remote_failed"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn, t]);

  useEffect(() => {
    if (!signedIn || typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("wf")) return;
    const raw = sessionStorage.getItem(PENDING_PDF_WORKFLOW_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_PDF_WORKFLOW_KEY);
    void (async () => {
      try {
        const data = JSON.parse(raw) as { name: string; steps: PdfWorkflowStep[] };
        setWorkflowName(data.name);
        setSteps(data.steps);
        const row = await upsertWorkflow("pdf_workflows", {
          name: data.name.trim(),
          steps: data.steps,
        });
        setSelectedSavedId(row.id);
        await refreshSaved();
        toast.success(t("workflow.saved_after_signin"));
      } catch {
        sessionStorage.setItem(PENDING_PDF_WORKFLOW_KEY, raw);
        toast.error(t("workflow.save_failed_after_signin"));
      }
    })();
  }, [signedIn, refreshSaved, t]);

  const mergeFirst = steps[0]?.kind === "merge";
  const terminalSplit = workflowHasTerminalSplit(steps);
  const canAddMore = !terminalSplit;

  useEffect(() => {
    if (prevMergeFirstRef.current && !mergeFirst) {
      setFiles((f) => (f.length > 1 ? f.slice(0, 1) : f));
    }
    prevMergeFirstRef.current = mergeFirst;
  }, [mergeFirst]);

  const addStepOptions = useMemo(() => {
    const opts: { value: PendingTool; label: string }[] = [];
    if (canAddMergeAsFirst(steps)) {
      opts.push({ value: "merge", label: t("workflow.tool_merge") });
    }
    if (canAddMore) {
      opts.push(
        { value: "compress", label: t("workflow.tool_compress") },
        { value: "rotate", label: t("workflow.tool_rotate") },
        { value: "split_individual", label: t("workflow.tool_split_each") },
        { value: "split_range", label: t("workflow.tool_split_range") }
      );
    }
    return opts;
  }, [steps, canAddMore, t]);

  useEffect(() => {
    if (!addStepOptions.find((o) => o.value === pendingTool)) {
      const next = addStepOptions[0]?.value;
      if (next) setPendingTool(next);
    }
  }, [addStepOptions, pendingTool]);

  const handleDrop = useCallback(
    (accepted: File[]) => {
      const pdfs = accepted.filter((f) => f.type === "application/pdf");
      if (pdfs.length === 0) return;
      if (mergeFirst) {
        setFiles((prev) => [...prev, ...pdfs]);
      } else {
        setFiles(pdfs.slice(0, 1));
      }
    },
    [mergeFirst]
  );

  const clearFiles = useCallback(() => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const addStep = useCallback(() => {
    if (!canAddMore && pendingTool !== "merge") {
      return;
    }

    let step: PdfWorkflowStep | null = null;
    if (pendingTool === "merge") {
      if (!canAddMergeAsFirst(steps)) return;
      step = { id: newStepId(), kind: "merge" };
    } else if (pendingTool === "compress") {
      step = { id: newStepId(), kind: "compress" };
    } else if (pendingTool === "rotate") {
      step = { id: newStepId(), kind: "rotate", angle: pendingAngle };
    } else if (pendingTool === "split_individual") {
      step = { id: newStepId(), kind: "split", mode: "individual" };
    } else if (pendingTool === "split_range") {
      const ranges = pendingRanges.trim();
      if (!ranges) {
        toast.error(t("workflow.error_ranges_required"));
        return;
      }
      step = { id: newStepId(), kind: "split", mode: "range", ranges };
    }

    if (step) {
      setSteps((prev) => [...prev, step!]);
      if (pendingTool === "split_range") setPendingRanges("");
    }
  }, [
    canAddMore,
    pendingTool,
    pendingAngle,
    pendingRanges,
    steps,
    t,
  ]);

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSplitRanges = (id: string, ranges: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.kind === "split" && s.mode === "range" && s.id === id
          ? { ...s, ranges }
          : s
      )
    );
  };

  const runWorkflow = async () => {
    if (steps.length === 0) {
      toast.error(t("workflow.error_no_steps"));
      return;
    }
    if (mergeFirst && files.length < 2) {
      toast.error(t("workflow.error_merge_files"));
      return;
    }
    if (!mergeFirst && files.length < 1) {
      toast.error(t("workflow.error_need_pdf"));
      return;
    }

    for (const s of steps) {
      if (s.kind === "split" && s.mode === "range" && !s.ranges?.trim()) {
        toast.error(t("workflow.error_ranges_required"));
        return;
      }
    }

    setRunning(true);
    try {
      const out = await runPdfWorkflow(files, steps);
      const url = URL.createObjectURL(
        out.result === "single"
          ? new Blob([new Uint8Array(out.bytes)], {
              type: "application/pdf",
            })
          : out.blob
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = out.downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("workflow.success"));
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      if (code === "invalid_ranges") {
        toast.error(t("workflow.error_invalid_ranges"));
      } else {
        toast.error(t("workflow.error_run"));
      }
    } finally {
      setRunning(false);
    }
  };

  const hasFiles = files.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
          <GitBranch className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {t("workflow.title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("workflow.description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 items-start">
        <Card className="border-[#d6ffd2]/20 bg-card/40">
          <CardContent className="p-4 sm:p-6 space-y-5">
            {signedIn && (
              <div className="space-y-2">
                <Label className="text-foreground">My saved workflows</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedSavedId}
                    onValueChange={(v) => setSelectedSavedId(v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {saved.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedSavedId}
                    onClick={() => {
                      const row = saved.find((s) => s.id === selectedSavedId);
                      if (!row) return;
                      setWorkflowName(row.name);
                      setSteps((row.steps as PdfWorkflowStep[]) || []);
                    }}
                  >
                    Load
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedSavedId}
                    onClick={() =>
                      void (async () => {
                        try {
                          await deleteWorkflow("pdf_workflows", selectedSavedId);
                          await refreshSaved();
                          setSelectedSavedId("");
                        } catch {
                          toast.error("Could not delete workflow.");
                        }
                      })()
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="wf-name" className="text-foreground">
                {t("workflow.name_label")}
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                {t("workflow.name_hint")}
              </p>
              <Input
                id="wf-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder={t("workflow.name_placeholder")}
                className="bg-background/80"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">{t("workflow.select_tool")}</Label>
              <Select
                value={pendingTool}
                onValueChange={(v) => setPendingTool(v as PendingTool)}
                disabled={addStepOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workflow.select_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {addStepOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {pendingTool === "rotate" && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("workflow.rotate_angle")}
                  </Label>
                  <Select
                    value={String(pendingAngle)}
                    onValueChange={(v) =>
                      setPendingAngle(parseInt(v, 10) as WorkflowRotateAngle)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">{t("rotate.90_clockwise")}</SelectItem>
                      <SelectItem value="180">{t("rotate.180")}</SelectItem>
                      <SelectItem value="270">{t("rotate.270_clockwise")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {pendingTool === "split_range" && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("workflow.ranges_label")}
                  </Label>
                  <Input
                    className="mt-1"
                    placeholder="1-3, 5, 7-9"
                    value={pendingRanges}
                    onChange={(e) => setPendingRanges(e.target.value)}
                  />
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/40 text-primary hover:bg-primary/10"
                onClick={addStep}
                disabled={addStepOptions.length === 0}
              >
                {t("workflow.add_step")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d6ffd2]/20 bg-card/40">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                {t("workflow.preview_heading")}
              </h2>
              <div className="flex flex-wrap gap-2 shrink-0">
                {signedIn ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={saving || !workflowName.trim() || steps.length === 0}
                    onClick={() =>
                      void (async () => {
                        setSaving(true);
                        try {
                          const row = await upsertWorkflow("pdf_workflows", {
                            name: workflowName.trim(),
                            steps,
                          });
                          await refreshSaved();
                          setSelectedSavedId(row.id);
                          toast.success(t("workflow.saved_toast"));
                        } catch {
                          toast.error(t("workflow.save_error"));
                        } finally {
                          setSaving(false);
                        }
                      })()
                    }
                  >
                    {saving ? t("workflow.saving") : t("workflow.save")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!workflowName.trim() || steps.length === 0}
                    onClick={() => {
                      writePendingPdfWorkflow({
                        name: workflowName.trim(),
                        steps,
                      });
                      router.push(
                        `${getLocalizedPath("/login")}?next=${encodeURIComponent(RETURN_PATH.pdfWorkflow)}`
                      );
                    }}
                  >
                    {t("workflow.save")}
                  </Button>
                )}
              </div>
            </div>

            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("workflow.preview_empty")}
              </p>
            ) : (
              <ol className="relative space-y-3 border-l border-primary/30 ml-3 pl-6 py-1">
                {steps.map((step, index) => (
                  <li key={step.id}>
                    <span
                      className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-[#d6ffd2]/15 bg-[#103c44]/40 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-primary shrink-0">
                          {stepIcon(step)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {stepSummary(t, step)}
                          </p>
                          {step.kind === "split" && step.mode === "range" && (
                            <Input
                              className="mt-2 h-8 text-xs"
                              value={step.ranges || ""}
                              onChange={(e) =>
                                updateSplitRanges(step.id, e.target.value)
                              }
                              placeholder="1-3, 5"
                            />
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeStep(step.id)}
                        aria-label={t("common.remove")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {terminalSplit && (
              <p className="mt-4 text-sm text-destructive">
                {t("workflow.no_more_after_split")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#d6ffd2]/20 bg-card/40">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t("workflow.files_heading")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {mergeFirst
                  ? t("workflow.files_hint_merge")
                  : t("workflow.files_hint_single")}
              </p>
            </div>
            {hasFiles && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFiles}>
                {t("workflow.clear_files")}
              </Button>
            )}
          </div>

          <FileUploadZone
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onFileSelect={() => {
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            fileInputRef={fileInputRef}
            acceptedFormats=".pdf,application/pdf"
            multiple={mergeFirst}
            title={t("workflow.drop_title")}
            description={t("workflow.drop_desc")}
            className={cn(
              "min-h-[200px]",
              !hasFiles && "min-h-[min(320px,40vh)] py-10 flex flex-col justify-center"
            )}
          />

          {hasFiles && (
            <ul className="text-sm space-y-1.5 tool-list-box p-3 max-h-32 overflow-y-auto">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="truncate text-foreground">
                  {f.name}
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={running || steps.length === 0}
            onClick={() => void runWorkflow()}
          >
            {running ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                {t("workflow.running")}
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2 inline" />
                {t("workflow.run")}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t("workflow.privacy")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
