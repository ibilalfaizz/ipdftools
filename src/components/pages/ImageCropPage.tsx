"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import JSZip from "jszip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Header from "../Header";
import Footer from "../Footer";
import FileUploadZone from "../FileUploadZone";
import ImageCropCanvas, {
  defaultCenteredCrop,
  type PixelCrop,
} from "../ImageCropCanvas";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { processCropBatch } from "@/lib/client-image-jobs";
import type { ClientImageProcessResult } from "@/lib/client-image-jobs";

function clampCrop(c: PixelCrop, iw: number, ih: number): PixelCrop {
  let { x, y, w, h } = c;
  w = Math.max(2, Math.min(Math.round(w), iw));
  h = Math.max(2, Math.min(Math.round(h), ih));
  x = Math.max(0, Math.min(Math.round(x), iw - w));
  y = Math.max(0, Math.min(Math.round(y), ih - h));
  return { x, y, w, h };
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

type ResultFile = { name: string; contentType: string; data: string };
type ProcessResult = { files: ResultFile[]; zipSuggestedName: string };

export default function ImageCropPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [crop, setCrop] = useState<PixelCrop>({ x: 0, y: 0, w: 0, h: 0 });

  const previewUrl = useMemo(() => {
    if (files.length === 0) return null;
    return URL.createObjectURL(files[0]);
  }, [files]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onImageDimensions = useCallback((w: number, h: number) => {
    setNaturalW(w);
    setNaturalH(h);
    setCrop(defaultCenteredCrop(w, h));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setResult(null);
    setNaturalW(0);
    setNaturalH(0);
    setCrop({ x: 0, y: 0, w: 0, h: 0 });
  }, []);

  const onDrop = useCallback((incoming: File[]) => {
    const imgs = incoming.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setFiles([imgs[0]]);
    setResult(null);
  }, []);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setCropField = (patch: Partial<PixelCrop>) => {
    if (naturalW < 1 || naturalH < 1) return;
    setCrop((prev) => clampCrop({ ...prev, ...patch }, naturalW, naturalH));
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
    if (naturalW < 1 || naturalH < 1 || crop.w < 2 || crop.h < 2) {
      toast({ title: t("image_tools.error"), variant: "destructive" });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const norm = {
        nx: crop.x / naturalW,
        ny: crop.y / naturalH,
        nw: crop.w / naturalW,
        nh: crop.h / naturalH,
      };
      const body: ClientImageProcessResult = await processCropBatch(files, norm);
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
      if (msg === "INVALID_CROP") {
        toast({
          title: t("image_tools.error"),
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
          {t("image_tools.files_added")}
        </p>
        <div className="text-sm text-muted-foreground tool-list-box p-3 truncate">
          <span title={files[0]?.name}>{files[0]?.name}</span>
        </div>
      </div>

      <div className="space-y-3 border-t border-[#d6ffd2]/15 pt-4">
        <p className="text-sm font-semibold text-foreground">
          {t("image_crop.options_heading")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="crop-w">{t("image_crop.width")}</Label>
            <Input
              id="crop-w"
              type="number"
              min={2}
              max={naturalW || 8192}
              value={naturalW > 0 ? crop.w : ""}
              onChange={(e) =>
                setCropField({
                  w: parseInt(e.target.value, 10) || 2,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crop-h">{t("image_crop.height")}</Label>
            <Input
              id="crop-h"
              type="number"
              min={2}
              max={naturalH || 8192}
              value={naturalH > 0 ? crop.h : ""}
              onChange={(e) =>
                setCropField({
                  h: parseInt(e.target.value, 10) || 2,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crop-x">{t("image_crop.x")}</Label>
            <Input
              id="crop-x"
              type="number"
              min={0}
              max={Math.max(0, naturalW - 2)}
              value={crop.x}
              onChange={(e) =>
                setCropField({
                  x: parseInt(e.target.value, 10) || 0,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crop-y">{t("image_crop.y")}</Label>
            <Input
              id="crop-y"
              type="number"
              min={0}
              max={Math.max(0, naturalH - 2)}
              value={crop.y}
              onChange={(e) =>
                setCropField({
                  y: parseInt(e.target.value, 10) || 0,
                })
              }
            />
          </div>
        </div>
      </div>

      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={busy || naturalW < 1}
        onClick={() => void submit()}
      >
        {busy ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
        ) : null}
        {busy ? t("image_tools.processing") : t("image_crop.process")}
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
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="tool-page-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {t("image_crop.title")}
              </CardTitle>
              <p className="text-muted-foreground">{t("image_crop.description")}</p>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className={`w-full relative transition-[padding] ${hasFiles ? "lg:pr-[min(28rem,calc(100%-1.5rem))]" : ""}`}
              >
                <div
                  className={`mx-auto w-full max-w-3xl p-2 ${hasFiles ? "hidden" : ""}`}
                >
                  <FileUploadZone
                    acceptedFormats="image/png,image/jpeg,image/webp,image/gif,image/tiff,.png,.jpg,.jpeg,.webp,.gif,.tif,.tiff"
                    title={t("image_crop.drop_title")}
                    description={t("image_crop.drop_desc")}
                    fileInputRef={fileInputRef}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onFileSelect={onFileSelect}
                    multiple={false}
                    className="min-h-[min(420px,52vh)] py-12 flex flex-col justify-center"
                  />
                </div>

                {hasFiles && previewUrl ? (
                  <div className="px-4 pb-6 flex justify-center">
                    <ImageCropCanvas
                      key={previewUrl}
                      imageUrl={previewUrl}
                      naturalW={naturalW}
                      naturalH={naturalH}
                      crop={crop}
                      onCropChange={(c) =>
                        naturalW > 0 && naturalH > 0
                          ? setCrop(clampCrop(c, naturalW, naturalH))
                          : undefined
                      }
                      onImageDimensions={onImageDimensions}
                      className="rounded-lg border border-[#d6ffd2]/15 bg-[#103c44]/50 p-2"
                    />
                  </div>
                ) : null}

                <Sheet modal={false} open={sheetControlledOpen} onOpenChange={() => {}}>
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
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
