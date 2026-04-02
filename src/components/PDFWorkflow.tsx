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
  const { t } = useLanguage();
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<PdfWorkflowStep[]>([]);
  const [pendingTool, setPendingTool] = useState<PendingTool>("compress");
  const [pendingAngle, setPendingAngle] = useState<WorkflowRotateAngle>(90);
  const [pendingRanges, setPendingRanges] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydratedRef = useRef(false);
  const prevMergeFirstRef = useRef(false);

  useEffect(() => {
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
            <h2 className="text-sm font-semibold text-foreground mb-4">
              {t("workflow.preview_heading")}
            </h2>

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
