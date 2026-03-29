"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import JSZip from "jszip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-6">
      <FileUploadZone
        acceptedFormats="image/png,image/jpeg,image/webp,image/gif,image/tiff,.png,.jpg,.jpeg,.webp,.gif,.tif,.tiff"
        title={t(`${translationPrefix}.drop_title`)}
        description={t(`${translationPrefix}.drop_desc`)}
        fileInputRef={fileInputRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onFileSelect={onFileSelect}
      />
      {files.length > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {t("image_tools.files_added")}: {files.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFiles}
            >
              {t("image_tools.clear")}
            </Button>
          </div>
          <ul className="text-sm text-muted-foreground max-h-32 overflow-y-auto space-y-1">
            {files.map((f) => (
              <li key={`${f.name}-${f.size}-${f.lastModified}`}>{f.name}</li>
            ))}
          </ul>
        </div>
      )}
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
        {busy ? t("image_tools.processing") : t(`${translationPrefix}.process`)}
      </Button>
      {result && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void downloadImages()}
          >
            {t("image_tools.download_images")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void downloadZip()}
          >
            {t("image_tools.download_zip")}
          </Button>
        </div>
      )}
    </div>
  );
}
