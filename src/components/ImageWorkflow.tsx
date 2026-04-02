"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImageIcon,
  Loader2,
  Play,
  RotateCw,
  Shrink,
  Maximize,
  FileImage,
  Trash2,
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
import {
  loadImageWorkflowFromStorage,
  newImageStepId,
  saveImageWorkflowToStorage,
  type ImageWorkflowRotateDegrees,
  type ImageWorkflowStep,
} from "@/lib/image-workflow-types";
import { runImageWorkflow, zipImageWorkflowResult } from "@/lib/image-workflow-run";
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
  PENDING_IMAGE_WORKFLOW_KEY,
  RETURN_PATH,
  clearPendingImageWorkflow,
  readPendingImageWorkflow,
  writePendingImageWorkflow,
} from "@/lib/workflows/pending-workflow-storage";

type PendingTool = "resize" | "compress" | "rotate" | "to_webp" | "to_jpg";

function stepIcon(step: ImageWorkflowStep) {
  switch (step.kind) {
    case "resize":
      return <Maximize className="h-5 w-5" />;
    case "compress":
      return <Shrink className="h-5 w-5" />;
    case "rotate":
      return <RotateCw className="h-5 w-5" />;
    case "to_webp":
    case "to_jpg":
      return <FileImage className="h-5 w-5" />;
    default:
      return null;
  }
}

function stepSummary(t: (k: string) => string, step: ImageWorkflowStep): string {
  switch (step.kind) {
    case "resize":
      return `${t("image_workflow.step_resize")} ${step.width}×${step.height}`;
    case "compress":
      return t("image_workflow.step_compress");
    case "rotate":
      return t(`image_workflow.step_rotate_${step.degrees}`);
    case "to_webp":
      return t("image_workflow.step_to_webp");
    case "to_jpg":
      return t("image_workflow.step_to_jpg");
    default:
      return "";
  }
}

export default function ImageWorkflow() {
  const { t, getLocalizedPath } = useLanguage();
  const router = useRouter();
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<ImageWorkflowStep[]>([]);
  const [saved, setSaved] = useState<WorkflowRow[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string>("");
  const [signedIn, setSignedIn] = useState(false);
  const [pendingTool, setPendingTool] = useState<PendingTool>("compress");
  const [pendingRotate, setPendingRotate] = useState<ImageWorkflowRotateDegrees>(90);
  const [pendingWidth, setPendingWidth] = useState("1920");
  const [pendingHeight, setPendingHeight] = useState("1080");
  const [files, setFiles] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wf = new URLSearchParams(window.location.search).get("wf");
    if (wf) {
      clearPendingImageWorkflow();
      hydratedRef.current = true;
      return;
    }
    const pending = readPendingImageWorkflow();
    if (pending) {
      setWorkflowName(pending.name);
      setSteps(pending.steps as ImageWorkflowStep[]);
      hydratedRef.current = true;
      return;
    }
    const stored = loadImageWorkflowFromStorage();
    if (stored) {
      setWorkflowName(stored.name);
      setSteps(stored.steps);
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveImageWorkflowToStorage({ name: workflowName, steps });
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
      const rows = await listWorkflows("image_workflows");
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
        const row = await getWorkflowById("image_workflows", wf);
        if (cancelled || !row) return;
        setWorkflowName(row.name);
        setSteps((row.steps as ImageWorkflowStep[]) || []);
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
    const raw = sessionStorage.getItem(PENDING_IMAGE_WORKFLOW_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_IMAGE_WORKFLOW_KEY);
    void (async () => {
      try {
        const data = JSON.parse(raw) as { name: string; steps: ImageWorkflowStep[] };
        setWorkflowName(data.name);
        setSteps(data.steps);
        const row = await upsertWorkflow("image_workflows", {
          name: data.name.trim(),
          steps: data.steps,
        });
        setSelectedSavedId(row.id);
        await refreshSaved();
        toast.success(t("workflow.saved_after_signin"));
      } catch {
        sessionStorage.setItem(PENDING_IMAGE_WORKFLOW_KEY, raw);
        toast.error(t("workflow.save_failed_after_signin"));
      }
    })();
  }, [signedIn, refreshSaved, t]);

  const addStepOptions = useMemo(
    () => [
      { value: "resize" as const, label: t("image_workflow.tool_resize") },
      { value: "compress" as const, label: t("image_workflow.tool_compress") },
      { value: "rotate" as const, label: t("image_workflow.tool_rotate") },
      { value: "to_webp" as const, label: t("image_workflow.tool_to_webp") },
      { value: "to_jpg" as const, label: t("image_workflow.tool_to_jpg") },
    ],
    [t]
  );

  const addStep = useCallback(() => {
    let step: ImageWorkflowStep | null = null;
    if (pendingTool === "compress") {
      step = { id: newImageStepId(), kind: "compress" };
    } else if (pendingTool === "rotate") {
      step = { id: newImageStepId(), kind: "rotate", degrees: pendingRotate };
    } else if (pendingTool === "to_webp") {
      step = { id: newImageStepId(), kind: "to_webp" };
    } else if (pendingTool === "to_jpg") {
      step = { id: newImageStepId(), kind: "to_jpg" };
    } else if (pendingTool === "resize") {
      const w = parseInt(pendingWidth, 10);
      const h = parseInt(pendingHeight, 10);
      if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
        toast.error(t("image_workflow.error_resize_dims"));
        return;
      }
      step = { id: newImageStepId(), kind: "resize", width: w, height: h };
    }

    if (step) setSteps((prev) => [...prev, step]);
  }, [pendingTool, pendingRotate, pendingWidth, pendingHeight, t]);

  const removeStep = (id: string) => setSteps((prev) => prev.filter((s) => s.id !== id));

  const clearFiles = useCallback(() => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleDrop = useCallback((accepted: File[]) => {
    const imgs = accepted.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setFiles((prev) => [...prev, ...imgs]);
  }, []);

  const runWorkflow = async () => {
    if (steps.length === 0) {
      toast.error(t("image_workflow.error_no_steps"));
      return;
    }
    if (files.length === 0) {
      toast.error(t("image_workflow.error_need_images"));
      return;
    }

    setRunning(true);
    try {
      const out = await runImageWorkflow(files, steps);

      if (out.files.length === 1) {
        const item = out.files[0];
        const bytes = Uint8Array.from(atob(item.data), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: item.contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const zipBlob = await zipImageWorkflowResult(out);
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = out.zipSuggestedName;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast.success(t("image_workflow.success"));
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      if (code === "WEBP_ENCODE_UNSUPPORTED") {
        toast.error(t("image_tools.webp_unsupported"));
      } else {
        toast.error(t("image_workflow.error_run"));
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
          <ImageIcon className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {t("image_workflow.title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("image_workflow.description")}
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
                      setSteps((row.steps as ImageWorkflowStep[]) || []);
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
                          await deleteWorkflow("image_workflows", selectedSavedId);
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
              <Label htmlFor="iwf-name" className="text-foreground">
                {t("image_workflow.name_label")}
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                {t("image_workflow.name_hint")}
              </p>
              <Input
                id="iwf-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder={t("image_workflow.name_placeholder")}
                className="bg-background/80"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">
                {t("image_workflow.select_tool")}
              </Label>
              <Select
                value={pendingTool}
                onValueChange={(v) => setPendingTool(v as PendingTool)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("image_workflow.select_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {addStepOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {pendingTool === "resize" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {t("image_workflow.resize_width")}
                    </Label>
                    <Input
                      className="mt-1"
                      inputMode="numeric"
                      value={pendingWidth}
                      onChange={(e) => setPendingWidth(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {t("image_workflow.resize_height")}
                    </Label>
                    <Input
                      className="mt-1"
                      inputMode="numeric"
                      value={pendingHeight}
                      onChange={(e) => setPendingHeight(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {pendingTool === "rotate" && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("image_workflow.rotate_angle")}
                  </Label>
                  <Select
                    value={String(pendingRotate)}
                    onValueChange={(v) =>
                      setPendingRotate(parseInt(v, 10) as ImageWorkflowRotateDegrees)
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

              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/40 text-primary hover:bg-primary/10"
                onClick={addStep}
              >
                {t("image_workflow.add_step")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d6ffd2]/20 bg-card/40">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                {t("image_workflow.preview_heading")}
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
                          const row = await upsertWorkflow("image_workflows", {
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
                      writePendingImageWorkflow({
                        name: workflowName.trim(),
                        steps,
                      });
                      router.push(
                        `${getLocalizedPath("/login")}?next=${encodeURIComponent(RETURN_PATH.imageWorkflow)}`
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
                {t("image_workflow.preview_empty")}
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
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#d6ffd2]/20 bg-card/40">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t("image_workflow.files_heading")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("image_workflow.files_hint")}
              </p>
            </div>
            {files.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFiles}>
                {t("image_workflow.clear_files")}
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
            acceptedFormats="image/*"
            multiple
            title={t("image_workflow.drop_title")}
            description={t("image_workflow.drop_desc")}
            className={cn(
              "min-h-[200px]",
              files.length === 0 &&
                "min-h-[min(320px,40vh)] py-10 flex flex-col justify-center"
            )}
          />

          {files.length > 0 && (
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
                {t("image_workflow.running")}
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2 inline" />
                {t("image_workflow.run")}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t("image_workflow.privacy")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

