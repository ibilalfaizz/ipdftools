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
  const { t } = useLanguage();
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<ImageWorkflowStep[]>([]);
  const [pendingTool, setPendingTool] = useState<PendingTool>("compress");
  const [pendingRotate, setPendingRotate] = useState<ImageWorkflowRotateDegrees>(90);
  const [pendingWidth, setPendingWidth] = useState("1920");
  const [pendingHeight, setPendingHeight] = useState("1080");
  const [files, setFiles] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
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
            <h2 className="text-sm font-semibold text-foreground mb-4">
              {t("image_workflow.preview_heading")}
            </h2>

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

