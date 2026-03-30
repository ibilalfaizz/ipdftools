"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import JSZip from "jszip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import FileUploadZone from "./FileUploadZone";
import type { ClientImageProcessResult } from "@/lib/client-image-jobs";

type TranslationPrefix = "image_resize" | "image_compress" | "image_webp";

type Props = {
  /** Runs in the browser — no server upload (avoids serverless body limits). */
  processFiles: (files: File[]) => Promise<ClientImageProcessResult>;
  translationPrefix: TranslationPrefix;
  children?: React.ReactNode;
};

type ResultFile = { name: string; contentType: string; data: string };

type ProcessResult = { files: ResultFile[]; zipSuggestedName: string };

function base64ToBlob(base64: string, contentType: string): Blob {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
}

export default function ImageToolsBatchForm({
  processFiles,
  translationPrefix,
  children,
}: Props) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setResult(null);
  }, []);

  const onDrop = useCallback((incoming: File[]) => {
    const imgs = incoming.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setFiles((prev) => [...prev, ...imgs]);
    setResult(null);
  }, []);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadImages = useCallback(async () => {
    if (!result) return;
    for (let i = 0; i < result.files.length; i++) {
      const item = result.files[i];
      const blob = base64ToBlob(item.data, item.contentType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
      if (i < result.files.length - 1) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    toast({ title: t("image_tools.success") });
  }, [result, t, toast]);

  const downloadZip = useCallback(async () => {
    if (!result) return;
    try {
      const zip = new JSZip();
      for (const item of result.files) {
        const blob = base64ToBlob(item.data, item.contentType);
        const buf = await blob.arrayBuffer();
        zip.file(item.name, buf);
      }
      const out = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
      });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.zipSuggestedName;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("image_tools.success") });
    } catch {
      toast({ title: t("image_tools.error"), variant: "destructive" });
    }
  }, [result, t, toast]);

  const submit = async () => {
    if (files.length === 0) {
      toast({ title: t("image_tools.no_files"), variant: "destructive" });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const body = await processFiles(files);
      if (!Array.isArray(body.files) || body.files.length === 0) {
        toast({
          title: t("image_tools.error"),
          variant: "destructive",
        });
        return;
      }
      setResult({
        files: body.files,
        zipSuggestedName: body.zipSuggestedName ?? "images.zip",
      });
      toast({ title: t("image_tools.result_ready") });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "WEBP_ENCODE_UNSUPPORTED") {
        toast({
          title: t("image_tools.webp_unsupported"),
          variant: "destructive",
        });
      } else if (msg === "NO_VALID_IMAGES") {
        toast({
          title: t("image_tools.error"),
          variant: "destructive",
        });
      } else {
        toast({ title: t("image_tools.error"), variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  };

  const hasFiles = files.length > 0;
  const sheetControlledOpen = hasFiles;

  const sidebarInner = (
    <div className="flex flex-col gap-5 px-6 pb-8 pt-14">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <h3 className="text-sm font-semibold tracking-tight text-gray-900">
          {t("image_tools.sidebar_heading")}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground"
          onClick={clearFiles}
        >
          {t("image_tools.clear")}
        </Button>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {t("image_tools.files_added")}: {files.length}
        </p>
        <ul className="text-sm text-muted-foreground max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-gray-100 bg-white/90 p-3">
          {files.map((f) => (
            <li
              key={`${f.name}-${f.size}-${f.lastModified}`}
              className="truncate"
              title={f.name}
            >
              {f.name}
            </li>
          ))}
        </ul>
      </div>

      {children}

      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={busy}
        onClick={() => void submit()}
      >
        {busy ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
        ) : null}
        {busy
          ? t("image_tools.processing")
          : t(`${translationPrefix}.process`)}
      </Button>

      {result && (
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => void downloadImages()}
          >
            {t("image_tools.download_images")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => void downloadZip()}
          >
            {t("image_tools.download_zip")}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full relative">
      {/* Main: drop zone only — always in page flow */}
      <div className="mx-auto w-full max-w-3xl p-2">
        <FileUploadZone
          acceptedFormats="image/png,image/jpeg,image/webp,image/gif,image/tiff,.png,.jpg,.jpeg,.webp,.gif,.tif,.tiff"
          title={t(`${translationPrefix}.drop_title`)}
          description={t(`${translationPrefix}.drop_desc`)}
          fileInputRef={fileInputRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onFileSelect={onFileSelect}
          className={
            hasFiles
              ? "min-h-[220px] py-8"
              : "min-h-[min(420px,52vh)] py-12 flex flex-col justify-center"
          }
        />
      </div>

      {/* Offcanvas: fixed to viewport, outside the card column */}
      <Sheet
        open={sheetControlledOpen}
        onOpenChange={() => {
          // Never close while files are present (uploads should never dismiss the panel).
        }}
      >
        <SheetContent
          side="right"
          hideOverlay
          hideCloseButton
          className="w-full sm:max-w-md p-0 gap-0 flex flex-col border-l bg-gradient-to-b from-slate-50 to-white overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t("image_tools.sidebar_heading")}</SheetTitle>
          </SheetHeader>
          {sidebarInner}
        </SheetContent>
      </Sheet>
    </div>
  );
}
