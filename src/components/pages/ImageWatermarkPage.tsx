"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";
import JSZip from "jszip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Header from "../Header";
import Footer from "../Footer";
import FileUploadZone from "../FileUploadZone";
import ImageWatermarkCanvas, {
  type WatermarkPreviewLayer,
} from "../ImageWatermarkCanvas";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import {
  isImageFileForWatermark,
  processWatermarkExport,
  type WatermarkLayerJob,
} from "@/lib/client-image-watermark";
import type { ClientImageProcessResult } from "@/lib/client-image-jobs";
import { cn } from "@/lib/utils";

function base64ToBlob(base64: string, contentType: string): Blob {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
}

type TextLayerState = {
  kind: "text";
  id: string;
  text: string;
  textColor: string;
  fontSizeRatio: number;
  anchorX: number;
  anchorY: number;
  opacity: number;
};

type ImageLayerState = {
  kind: "image";
  id: string;
  file: File | null;
  previewUrl: string | null;
  imageWidthRatio: number;
  anchorX: number;
  anchorY: number;
  opacity: number;
};

type LayerState = TextLayerState | ImageLayerState;

function staggerAnchor(index: number): { x: number; y: number } {
  const row = Math.floor(index / 2);
  const col = index % 2;
  return {
    x: Math.min(0.92, Math.max(0.08, 0.5 + (col - 0.5) * 0.22)),
    y: Math.min(0.9, Math.max(0.1, 0.48 + row * 0.12)),
  };
}

function createTextLayer(index: number): TextLayerState {
  const { x, y } = staggerAnchor(index);
  return {
    kind: "text",
    id: crypto.randomUUID(),
    text: index === 0 ? "Watermark" : "Text",
    textColor: "#ffffff",
    fontSizeRatio: 0.08,
    anchorX: x,
    anchorY: y,
    opacity: 0.85,
  };
}

function createImageLayer(index: number): ImageLayerState {
  const { x, y } = staggerAnchor(index);
  return {
    kind: "image",
    id: crypto.randomUUID(),
    file: null,
    previewUrl: null,
    imageWidthRatio: 0.28,
    anchorX: x,
    anchorY: y,
    opacity: 0.85,
  };
}

type ResultFile = { name: string; contentType: string; data: string };
type ProcessResult = { files: ResultFile[]; zipSuggestedName: string };

function buildJobsFromLayers(layers: LayerState[]): WatermarkLayerJob[] {
  const out: WatermarkLayerJob[] = [];
  for (const L of layers) {
    if (L.kind === "text") {
      if (L.text.trim()) {
        out.push({
          kind: "text",
          text: L.text,
          textColor: L.textColor,
          fontSizeRatio: L.fontSizeRatio,
          anchorX: L.anchorX,
          anchorY: L.anchorY,
          opacity: L.opacity,
        });
      }
    } else if (isImageFileForWatermark(L.file)) {
      out.push({
        kind: "image",
        file: L.file,
        imageWidthRatio: L.imageWidthRatio,
        anchorX: L.anchorX,
        anchorY: L.anchorY,
        opacity: L.opacity,
      });
    }
  }
  return out;
}

export default function ImageWatermarkPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wmFileInputRef = useRef<HTMLInputElement>(null);
  const imagePickTargetId = useRef<string | null>(null);

  const initialLayer = useMemo(() => createTextLayer(0), []);
  const [layers, setLayers] = useState<LayerState[]>(() => [initialLayer]);
  const [activeLayerId, setActiveLayerId] = useState(() => initialLayer.id);

  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  const previewUrl = useMemo(() => {
    if (files.length === 0) return null;
    return URL.createObjectURL(files[0]);
  }, [files]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (layers.length > 0 && !layers.some((l) => l.id === activeLayerId)) {
      setActiveLayerId(layers[0].id);
    }
  }, [layers, activeLayerId]);

  const onImageDimensions = useCallback((w: number, h: number) => {
    setNaturalW(w);
    setNaturalH(h);
  }, []);

  const clearFiles = useCallback(() => {
    const fresh = createTextLayer(0);
    setLayers((prev) => {
      for (const L of prev) {
        if (L.kind === "image" && L.previewUrl) {
          URL.revokeObjectURL(L.previewUrl);
        }
      }
      return [fresh];
    });
    setActiveLayerId(fresh.id);
    setFiles([]);
    setResult(null);
    setNaturalW(0);
    setNaturalH(0);
  }, []);

  const onDrop = useCallback((incoming: File[]) => {
    const imgs = incoming.filter((f) => isImageFileForWatermark(f));
    if (imgs.length === 0) return;
    setFiles([imgs[0]]);
    setResult(null);
  }, []);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addTextLayer = useCallback(() => {
    let newId = "";
    setLayers((prev) => {
      const L = createTextLayer(prev.length);
      newId = L.id;
      return [...prev, L];
    });
    setActiveLayerId(newId);
    setResult(null);
  }, []);

  const addImageLayer = useCallback(() => {
    let newId = "";
    setLayers((prev) => {
      const L = createImageLayer(prev.length);
      newId = L.id;
      return [...prev, L];
    });
    setActiveLayerId(newId);
    setResult(null);
  }, []);

  const removeLayer = useCallback((id: string) => {
    let firstId = "";
    setLayers((prev) => {
      const victim = prev.find((x) => x.id === id);
      if (victim?.kind === "image" && victim.previewUrl) {
        URL.revokeObjectURL(victim.previewUrl);
      }
      const next = prev.filter((x) => x.id !== id);
      if (next.length === 0) {
        const L = createTextLayer(0);
        firstId = L.id;
        return [L];
      }
      firstId = next[0].id;
      return next;
    });
    setActiveLayerId((a) => {
      if (a !== id) return a;
      return firstId;
    });
    setResult(null);
  }, []);

  const moveLayer = useCallback((id: string, dir: -1 | 1) => {
    setLayers((prev) => {
      const i = prev.findIndex((x) => x.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const updateLayer = useCallback(
    (id: string, patch: Partial<TextLayerState> | Partial<ImageLayerState>) => {
      setLayers((prev) =>
        prev.map((L) => (L.id === id ? { ...L, ...patch } as LayerState : L))
      );
    },
    []
  );

  const setImageFileForLayer = useCallback((id: string, file: File) => {
    setLayers((prev) =>
      prev.map((L) => {
        if (L.kind !== "image" || L.id !== id) return L;
        if (L.previewUrl) URL.revokeObjectURL(L.previewUrl);
        return {
          ...L,
          file,
          previewUrl: URL.createObjectURL(file),
        };
      })
    );
    setResult(null);
  }, []);

  const onWatermarkImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    const id = imagePickTargetId.current;
    e.target.value = "";
    imagePickTargetId.current = null;
    if (!f || !id || !isImageFileForWatermark(f)) return;
    setImageFileForLayer(id, f);
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? layers[0];

  const previewLayers: WatermarkPreviewLayer[] = useMemo(
    () =>
      layers.map((L) =>
        L.kind === "text"
          ? {
              id: L.id,
              kind: "text",
              text: L.text,
              textColor: L.textColor,
              fontSizeRatio: L.fontSizeRatio,
              imageUrl: null,
              imageWidthRatio: 0.25,
              anchorX: L.anchorX,
              anchorY: L.anchorY,
              opacity: L.opacity,
            }
          : {
              id: L.id,
              kind: "image",
              text: "",
              textColor: "#ffffff",
              fontSizeRatio: 0.08,
              imageUrl: L.previewUrl,
              imageWidthRatio: L.imageWidthRatio,
              anchorX: L.anchorX,
              anchorY: L.anchorY,
              opacity: L.opacity,
            }
      ),
    [layers]
  );

  const fontSizePercent = activeLayer && activeLayer.kind === "text"
    ? [Math.round(activeLayer.fontSizeRatio * 100)]
    : [8];
  const opacityPercent = activeLayer
    ? [Math.round(activeLayer.opacity * 100)]
    : [85];
  const imageWidthPercent =
    activeLayer && activeLayer.kind === "image"
      ? [Math.round(activeLayer.imageWidthRatio * 100)]
      : [28];

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
      const jobs = buildJobsFromLayers(layers);
      if (jobs.length === 0) {
        toast({
          title: t("image_watermark.error_no_layers"),
          variant: "destructive",
        });
        setBusy(false);
        return;
      }
      const body: ClientImageProcessResult = await processWatermarkExport(
        files[0],
        jobs
      );
      if (!Array.isArray(body.files) || body.files.length === 0) {
        toast({
          title: t("image_tools.error"),
          variant: "destructive",
        });
        return;
      }
      setResult({
        files: body.files,
        zipSuggestedName: body.zipSuggestedName ?? "watermarked.zip",
      });
      toast({ title: t("image_tools.result_ready") });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "NO_WATERMARK_LAYERS") {
        toast({
          title: t("image_watermark.error_no_layers"),
          variant: "destructive",
        });
      } else if (msg === "IMAGE_DECODE_FAIL") {
        toast({
          title: t("image_watermark.error_decode"),
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

      <p className="text-xs text-muted-foreground">
        {t("image_watermark.canvas_hint")}
      </p>

      <div className="space-y-3 border-t border-[#d6ffd2]/15 pt-4">
        <p className="text-sm font-semibold text-foreground">
          {t("image_watermark.layers_heading")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("image_watermark.layers_order_hint")}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 border-[#d6ffd2]/25"
            onClick={addTextLayer}
          >
            {t("image_watermark.add_text")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 border-[#d6ffd2]/25"
            onClick={addImageLayer}
          >
            {t("image_watermark.add_image")}
          </Button>
        </div>

        <ul className="space-y-1.5">
          {layers.map((L, idx) => {
            const isSel = L.id === activeLayerId;
            const kindLabel =
              L.kind === "text"
                ? t("image_watermark.mode_text")
                : t("image_watermark.mode_image");
            return (
              <li key={L.id}>
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-1 rounded-md border px-2 py-1.5 text-sm",
                    isSel
                      ? "border-[#d6ffd2]/50 bg-[#103c44]/70"
                      : "border-[#d6ffd2]/15 bg-transparent"
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left font-medium text-[#d6ffd2]"
                    onClick={() => setActiveLayerId(L.id)}
                  >
                    {idx + 1}. {kindLabel}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    disabled={idx >= layers.length - 1}
                    aria-label={t("image_watermark.bring_forward")}
                    title={t("image_watermark.bring_forward")}
                    onClick={() => moveLayer(L.id, 1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    disabled={idx === 0}
                    aria-label={t("image_watermark.send_backward")}
                    title={t("image_watermark.send_backward")}
                    onClick={() => moveLayer(L.id, -1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive"
                    aria-label={t("image_watermark.remove_layer")}
                    title={t("image_watermark.remove_layer")}
                    onClick={() => removeLayer(L.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {activeLayer?.kind === "text" ? (
        <div className="space-y-3 border-t border-[#d6ffd2]/15 pt-4">
          <p className="text-sm font-semibold text-foreground">
            {t("image_watermark.edit_text_layer")}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="wm-txt">{t("image_watermark.text_label")}</Label>
            <textarea
              id="wm-txt"
              value={activeLayer.text}
              onChange={(e) =>
                updateLayer(activeLayer.id, { text: e.target.value })
              }
              rows={3}
              className="w-full rounded-md border border-[#d6ffd2]/25 bg-[#103c44]/50 px-3 py-2 text-sm text-[#d6ffd2] placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wm-color">{t("image_watermark.color_label")}</Label>
            <Input
              id="wm-color"
              type="color"
              value={activeLayer.textColor}
              onChange={(e) =>
                updateLayer(activeLayer.id, { textColor: e.target.value })
              }
              className="h-10 w-full cursor-pointer border-[#d6ffd2]/25 bg-[#103c44]/50 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("image_watermark.font_size_label")}</Label>
            <Slider
              value={fontSizePercent}
              onValueChange={(v) =>
                updateLayer(activeLayer.id, {
                  fontSizeRatio: v[0] / 100,
                })
              }
              min={3}
              max={22}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              {t("image_watermark.font_size_value").replace(
                "{n}",
                String(fontSizePercent[0])
              )}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("image_watermark.opacity_label")}</Label>
            <Slider
              value={opacityPercent}
              onValueChange={(v) =>
                updateLayer(activeLayer.id, { opacity: v[0] / 100 })
              }
              min={15}
              max={100}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              {t("image_watermark.opacity_value").replace(
                "{n}",
                String(opacityPercent[0])
              )}
            </p>
          </div>
        </div>
      ) : activeLayer?.kind === "image" ? (
        <div className="space-y-3 border-t border-[#d6ffd2]/15 pt-4">
          <p className="text-sm font-semibold text-foreground">
            {t("image_watermark.edit_image_layer")}
          </p>
          <div className="space-y-2">
            <Label>{t("image_watermark.wm_image_label")}</Label>
            <input
              ref={wmFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onWatermarkImagePick}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-[#d6ffd2]/25"
              onClick={() => {
                imagePickTargetId.current = activeLayer.id;
                wmFileInputRef.current?.click();
              }}
            >
              {activeLayer.file
                ? t("image_watermark.wm_image_replace")
                : t("image_watermark.wm_image_pick")}
            </Button>
            {activeLayer.file ? (
              <p className="text-xs text-muted-foreground truncate">
                {activeLayer.file.name}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>{t("image_watermark.image_size_label")}</Label>
            <Slider
              value={imageWidthPercent}
              onValueChange={(v) =>
                updateLayer(activeLayer.id, {
                  imageWidthRatio: v[0] / 100,
                })
              }
              min={5}
              max={70}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              {t("image_watermark.image_size_value").replace(
                "{n}",
                String(imageWidthPercent[0])
              )}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("image_watermark.opacity_label")}</Label>
            <Slider
              value={opacityPercent}
              onValueChange={(v) =>
                updateLayer(activeLayer.id, { opacity: v[0] / 100 })
              }
              min={15}
              max={100}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              {t("image_watermark.opacity_value").replace(
                "{n}",
                String(opacityPercent[0])
              )}
            </p>
          </div>
        </div>
      ) : null}

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
        {busy ? t("image_tools.processing") : t("image_watermark.process")}
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
            {t("image_watermark.download_png")}
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
                {t("image_watermark.title")}
              </CardTitle>
              <p className="text-muted-foreground">
                {t("image_watermark.description")}
              </p>
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
                    title={t("image_watermark.drop_title")}
                    description={t("image_watermark.drop_desc")}
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
                    <ImageWatermarkCanvas
                      key={previewUrl}
                      imageUrl={previewUrl}
                      naturalW={naturalW}
                      naturalH={naturalH}
                      layers={previewLayers}
                      activeLayerId={activeLayerId}
                      onSelectLayer={setActiveLayerId}
                      onLayerAnchorChange={(id, x, y) =>
                        updateLayer(id, { anchorX: x, anchorY: y })
                      }
                      onLayerImageWidthRatioChange={(id, r) =>
                        updateLayer(id, { imageWidthRatio: r })
                      }
                      onImageDimensions={onImageDimensions}
                      className="rounded-lg border border-[#d6ffd2]/15 bg-[#103c44]/50 p-2"
                    />
                  </div>
                ) : null}

                <Sheet
                  modal={false}
                  open={sheetControlledOpen}
                  onOpenChange={() => {}}
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
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
