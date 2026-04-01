"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

/** Passed to `renderWhenHasFiles` so previews can reflect processing state. */
export type ImageBatchPreviewContext = {
  result: ClientImageProcessResult | null;
  busy: boolean;
};

type TranslationPrefix =
  | "image_resize"
  | "image_compress"
  | "image_webp"
  | "image_jpg"
  | "image_gif"
  | "image_rotate"
  | "image_blur_face"
  | "image_remove_bg";

type Props = {
  /** Runs in the browser — no server upload (avoids serverless body limits). */
  processFiles: (files: File[]) => Promise<ClientImageProcessResult>;
  translationPrefix: TranslationPrefix;
  children?: ReactNode;
  /** Override first download button label (e.g. GIF tool uses “Download GIF”). */
  downloadPrimaryLabelKey?: string;
  /** Main column content when files are present (e.g. live preview beside the sheet). */
  renderWhenHasFiles?: (
    files: File[],
    ctx?: ImageBatchPreviewContext
  ) => ReactNode;
  /** Called whenever the file list changes (e.g. clear all → reset rotation in parent). */
  onFilesChange?: (files: File[]) => void;
  /** When the right file sidebar is open — parent can reserve horizontal space for the whole card. */
  onSidebarReserveChange?: (active: boolean) => void;
};

type ResultFile = { name: string; contentType: string; data: string };

type ProcessResult = { files: ResultFile[]; zipSuggestedName: string };

type FileEntry = { id: string; file: File };

const thumbBoxClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#103c44]/60 ring-1 ring-[#d6ffd2]/15";

function BlobImagePreview({
  src,
  className,
  onError,
}: {
  src: string;
  className?: string;
  onError?: () => void;
}) {
  // eslint-disable-next-line @next/next/no-img-element -- object URL from File
  return <img src={src} alt="" className={className} onError={onError} />;
}

export function ImageSidebarFileRow({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [decodeFailed, setDecodeFailed] = useState(false);

  useEffect(() => {
    setDecodeFailed(false);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <li className="flex items-center gap-2 rounded-md border border-[#d6ffd2]/10 bg-[#103c44]/35 p-2">
      {previewUrl && !decodeFailed ? (
        <BlobImagePreview
          src={previewUrl}
          className="h-11 w-11 shrink-0 rounded-md object-cover ring-1 ring-[#d6ffd2]/15"
          onError={() => setDecodeFailed(true)}
        />
      ) : (
        <div className={thumbBoxClass} aria-hidden>
          <ImageIcon className="h-5 w-5 text-[#d6ffd2]/45" />
        </div>
      )}
      <span
        className="min-w-0 flex-1 truncate text-[#d6ffd2]/90"
        title={file.name}
      >
        {file.name}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`${t("common.remove")}: ${file.name}`}
      >
        <X className="h-4 w-4" aria-hidden />
      </Button>
    </li>
  );
}

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
  downloadPrimaryLabelKey = "image_tools.download_images",
  renderWhenHasFiles,
  onFilesChange,
  onSidebarReserveChange,
}: Props) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const files = useMemo(
    () => fileEntries.map((e) => e.file),
    [fileEntries]
  );

  useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  const hasFiles = fileEntries.length > 0;
  useEffect(() => {
    onSidebarReserveChange?.(hasFiles);
    return () => onSidebarReserveChange?.(false);
  }, [hasFiles, onSidebarReserveChange]);

  const clearFiles = useCallback(() => {
    setFileEntries([]);
    setResult(null);
  }, []);

  const removeFileEntry = useCallback((id: string) => {
    setFileEntries((prev) => prev.filter((e) => e.id !== id));
    setResult(null);
  }, []);

  const onDrop = useCallback((incoming: File[]) => {
    const imgs = incoming.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setFileEntries((prev) => [
      ...prev,
      ...imgs.map((file) => ({ id: crypto.randomUUID(), file })),
    ]);
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
      } else if (msg === "FACE_BLUR_MODEL_FAILED") {
        toast({
          title: t("image_tools.face_blur_model_failed"),
          variant: "destructive",
        });
      } else if (msg === "REMOVE_BG_FAILED") {
        toast({
          title: t("image_tools.remove_bg_failed"),
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

  const sheetOpen = hasFiles;

  const sidebarInner = (
    <div className="flex flex-col gap-5 px-6 pb-8 pt-14">
      <div className="flex items-center justify-between gap-2 border-b border-[#d6ffd2]/15 pb-3">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
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
        <ul className="max-h-52 space-y-2 overflow-y-auto text-sm tool-list-box p-2">
          {fileEntries.map((entry) => (
            <ImageSidebarFileRow
              key={entry.id}
              file={entry.file}
              onRemove={() => removeFileEntry(entry.id)}
            />
          ))}
        </ul>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full border-[#d6ffd2]/25"
          onClick={() => fileInputRef.current?.click()}
        >
          {t("image_tools.add_more")}
        </Button>
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
        <div className="flex flex-col gap-2 pt-2 border-t border-[#d6ffd2]/15">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => void downloadImages()}
          >
            {t(downloadPrimaryLabelKey)}
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
    <div className="w-full min-w-0 relative">
      <div className="px-4 sm:px-6 pt-6 pb-2 md:px-8">
        <h2 className="text-2xl font-bold text-foreground">
          {t(`${translationPrefix}.title`)}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t(`${translationPrefix}.description`)}
        </p>
      </div>

      <div
        className={cn(
          "mx-auto w-full max-w-3xl p-2",
          hasFiles && "border-b border-[#d6ffd2]/10 pb-4 mb-2"
        )}
      >
        <FileUploadZone
          acceptedFormats="image/png,image/jpeg,image/webp,image/gif,image/tiff,.png,.jpg,.jpeg,.webp,.gif,.tif,.tiff"
          title={t(`${translationPrefix}.drop_title`)}
          description={t(`${translationPrefix}.drop_desc`)}
          fileInputRef={fileInputRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onFileSelect={onFileSelect}
          className={cn(
            "flex flex-col justify-center",
            hasFiles
              ? "min-h-[min(200px,28vh)] py-6"
              : "min-h-[min(420px,52vh)] py-12"
          )}
        />
      </div>

      {hasFiles && renderWhenHasFiles ? (
        <div className="mx-auto w-full max-w-5xl min-w-0 px-3 py-2 sm:px-4 sm:py-4">
          {renderWhenHasFiles(files, { result, busy })}
        </div>
      ) : null}

      <Sheet
        modal={false}
        open={sheetOpen}
        onOpenChange={() => {
          // Never close while files are present (uploads should never dismiss the panel).
        }}
      >
        <SheetContent
          side="rightBelowHeader"
          hideOverlay
          hideCloseButton
          className="w-full sm:max-w-md p-0 gap-0 flex flex-col overflow-y-auto tool-side-panel"
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
