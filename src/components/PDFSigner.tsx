"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CaseSensitive,
  Loader2,
  Pencil,
  PenTool,
  Stamp,
  Type,
  Upload,
  User,
} from "lucide-react";
import { saveAs } from "file-saver";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import FileUploadZone from "./FileUploadZone";
import PdfToolOffcanvasShell, {
  type PdfToolSidebarReserveProps,
} from "./PdfToolOffcanvasShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import {
  SIGNATURE_STYLE_FONTS,
  SIGN_COLORS,
  applySignatureToPdf,
  ensureSignFontsLoaded,
  getPdfPageCount,
  rasterizeCanvasToPng,
  renderCompanyStampPng,
  renderStyleSignaturePng,
  renderTypeSignaturePng,
  type SignColorId,
  type SignPageScope,
  type SignatureStyleId,
} from "@/lib/pdf-sign";

type SignTab = "signature" | "initials" | "stamp";
type InputMode = "type" | "style" | "upload" | "draw";

const DRAW_CSS_W = 280;
const DRAW_CSS_H = 130;

export default function PDFSigner({
  onSidebarReserveChange,
}: PdfToolSidebarReserveProps = {}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signUploadRef = useRef<HTMLInputElement>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [signTab, setSignTab] = useState<SignTab>("signature");
  const [inputMode, setInputMode] = useState<InputMode>("style");
  const [styleId, setStyleId] = useState<SignatureStyleId>("dancing");
  const [colorPresetId, setColorPresetId] = useState<SignColorId>("black");
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [customColorHex, setCustomColorHex] = useState("#0f172a");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [drawLineWidth, setDrawLineWidth] = useState(3);
  const [drawHasInk, setDrawHasInk] = useState(false);
  const [drawEpoch, setDrawEpoch] = useState(0);
  const [previewPdfPageCount, setPreviewPdfPageCount] = useState<number | null>(
    null
  );
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawBoardInitRef = useRef(false);
  const isDrawingStroke = useRef(false);
  const lastDrawPoint = useRef<{ x: number; y: number } | null>(null);
  const [pageScope, setPageScope] = useState<SignPageScope>("last");
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(true);
  const [signedPdfPreviewUrl, setSignedPdfPreviewUrl] = useState<string | null>(
    null
  );
  const signedPdfPreviewRef = useRef<string | null>(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);
  const [pdfPreviewError, setPdfPreviewError] = useState(false);

  useEffect(() => {
    void ensureSignFontsLoaded();
  }, []);

  const clearDrawCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    setDrawHasInk(false);
    setDrawEpoch((n) => n + 1);
  }, []);

  useLayoutEffect(() => {
    if (inputMode !== "draw") return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!drawBoardInitRef.current) {
      canvas.style.width = `${DRAW_CSS_W}px`;
      canvas.style.height = `${DRAW_CSS_H}px`;
      canvas.width = Math.round(DRAW_CSS_W * dpr);
      canvas.height = Math.round(DRAW_CSS_H * dpr);
      drawBoardInitRef.current = true;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }, [inputMode]);

  const canvasPointerCoords = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = e.currentTarget;
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDrawPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (inputMode !== "draw") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingStroke.current = true;
    lastDrawPoint.current = canvasPointerCoords(e);
  };

  const onDrawPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingStroke.current || !lastDrawPoint.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = canvasPointerCoords(e);
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = drawLineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastDrawPoint.current.x, lastDrawPoint.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastDrawPoint.current = p;
  };

  const onDrawPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawingStroke.current) {
      isDrawingStroke.current = false;
      lastDrawPoint.current = null;
      setDrawHasInk(true);
      setDrawEpoch((n) => n + 1);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const colorHex = useMemo(() => {
    if (useCustomColor) {
      const h = customColorHex.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(h)) return h;
      return "#0f172a";
    }
    return (
      SIGN_COLORS.find((c) => c.id === colorPresetId)?.hex ?? "#0f172a"
    );
  }, [useCustomColor, customColorHex, colorPresetId]);

  const displayText = useMemo(() => {
    if (signTab === "signature") {
      const s = fullName.trim();
      return s || t("sign_pdf.placeholder_signature");
    }
    if (signTab === "initials") {
      const s = initials.trim().slice(0, 8);
      return s || t("sign_pdf.placeholder_initials");
    }
    const s = companyName.trim();
    return s || t("sign_pdf.placeholder_company");
  }, [signTab, fullName, initials, companyName, t]);

  const buildRasterBytes = useCallback(async (): Promise<Uint8Array> => {
    if (inputMode === "draw") {
      const canvas = drawCanvasRef.current;
      if (!canvas) {
        throw new Error("NO_DRAW_CANVAS");
      }
      return rasterizeCanvasToPng(canvas);
    }

    if (signTab === "stamp") {
      if (inputMode === "upload" && uploadFile) {
        const buf = new Uint8Array(await uploadFile.arrayBuffer());
        return buf;
      }
      return renderCompanyStampPng(displayText, colorHex);
    }

    if (inputMode === "upload" && uploadFile) {
      return new Uint8Array(await uploadFile.arrayBuffer());
    }
    if (inputMode === "type") {
      const size = signTab === "initials" ? 30 : 34;
      return renderTypeSignaturePng(displayText, colorHex, size);
    }
    await ensureSignFontsLoaded();
    const size = signTab === "initials" ? 36 : 44;
    return renderStyleSignaturePng(displayText, styleId, colorHex, size);
  }, [
    signTab,
    inputMode,
    uploadFile,
    displayText,
    colorHex,
    styleId,
    drawEpoch,
  ]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const bytes = await buildRasterBytes();
        if (!alive) return;
        const u = URL.createObjectURL(new Blob([new Uint8Array(bytes)]));
        if (!alive) {
          URL.revokeObjectURL(u);
          return;
        }
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        previewRef.current = u;
        setPreviewUrl(u);
      } catch {
        if (!alive) return;
        if (previewRef.current) {
          URL.revokeObjectURL(previewRef.current);
          previewRef.current = null;
        }
        setPreviewUrl(null);
      }
    })();
    return () => {
      alive = false;
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setPreviewUrl(null);
    };
  }, [buildRasterBytes]);

  const uploadReadyForSign = useCallback(() => {
    if (inputMode === "upload") return uploadFile !== null;
    if (inputMode === "draw") return drawHasInk;
    return true;
  }, [inputMode, uploadFile, drawHasInk]);

  useEffect(() => {
    if (!pdfFile || !showPdfPreview) {
      if (signedPdfPreviewRef.current) {
        URL.revokeObjectURL(signedPdfPreviewRef.current);
        signedPdfPreviewRef.current = null;
      }
      setSignedPdfPreviewUrl(null);
      setPreviewPdfPageCount(null);
      setPdfPreviewLoading(false);
      setPdfPreviewError(false);
      return;
    }

    if (!uploadReadyForSign()) {
      if (signedPdfPreviewRef.current) {
        URL.revokeObjectURL(signedPdfPreviewRef.current);
        signedPdfPreviewRef.current = null;
      }
      setSignedPdfPreviewUrl(null);
      setPreviewPdfPageCount(null);
      setPdfPreviewLoading(false);
      setPdfPreviewError(false);
      return;
    }

    let cancelled = false;
    setPdfPreviewLoading(true);
    setPdfPreviewError(false);

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const pdfBytes = new Uint8Array(await pdfFile.arrayBuffer());
          const imageBytes = await buildRasterBytes();
          const out = await applySignatureToPdf(pdfBytes, imageBytes, {
            pageScope,
            widthPt: signTab === "stamp" ? 120 : 140,
            marginPt: 40,
          });
          if (cancelled) return;
          const pageCount = await getPdfPageCount(new Uint8Array(out));
          if (cancelled) return;
          const blob = new Blob([new Uint8Array(out)], {
            type: "application/pdf",
          });
          const u = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(u);
            return;
          }
          if (signedPdfPreviewRef.current) {
            URL.revokeObjectURL(signedPdfPreviewRef.current);
          }
          signedPdfPreviewRef.current = u;
          setPreviewPdfPageCount(pageCount);
          setSignedPdfPreviewUrl(u);
        } catch {
          if (!cancelled) {
            setPdfPreviewError(true);
            setSignedPdfPreviewUrl(null);
            setPreviewPdfPageCount(null);
          }
        } finally {
          if (!cancelled) setPdfPreviewLoading(false);
        }
      })();
    }, 550);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    pdfFile,
    showPdfPreview,
    pageScope,
    signTab,
    buildRasterBytes,
    uploadReadyForSign,
  ]);

  const handlePdfDrop = useCallback((files: File[]) => {
    const pdf = files.find((f) => f.type === "application/pdf");
    if (pdf) setPdfFile(pdf);
  }, []);

  const clearAll = useCallback(() => {
    setPdfFile(null);
    setUploadFile(null);
    setPreviewUrl(null);
    setInputMode("style");
    setDrawHasInk(false);
    setPreviewPdfPageCount(null);
    drawBoardInitRef.current = false;
    if (signedPdfPreviewRef.current) {
      URL.revokeObjectURL(signedPdfPreviewRef.current);
      signedPdfPreviewRef.current = null;
    }
    setSignedPdfPreviewUrl(null);
    setPdfPreviewError(false);
    queueMicrotask(() => {
      const c = drawCanvasRef.current;
      if (c) {
        c.width = 0;
        c.height = 0;
        c.removeAttribute("style");
      }
    });
  }, []);

  const onSignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) setUploadFile(f);
    e.target.value = "";
  };

  const handleApply = async () => {
    if (!pdfFile) {
      toast({
        title: t("sign_pdf.error_no_pdf"),
        variant: "destructive",
      });
      return;
    }
    if (signTab !== "stamp" && inputMode === "upload" && !uploadFile) {
      toast({
        title: t("sign_pdf.error_no_image"),
        variant: "destructive",
      });
      return;
    }
    if (signTab === "stamp" && inputMode === "upload" && !uploadFile) {
      toast({
        title: t("sign_pdf.error_no_image"),
        variant: "destructive",
      });
      return;
    }
    if (inputMode === "draw" && !drawHasInk) {
      toast({
        title: t("sign_pdf.error_no_drawing"),
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      const pdfBytes = new Uint8Array(await pdfFile.arrayBuffer());
      const imageBytes = await buildRasterBytes();
      const out = await applySignatureToPdf(pdfBytes, imageBytes, {
        pageScope,
        widthPt: signTab === "stamp" ? 120 : 140,
        marginPt: 40,
      });
      const stem = pdfFile.name.replace(/\.pdf$/i, "");
      saveAs(
        new Blob([new Uint8Array(out)], { type: "application/pdf" }),
        `${stem}_signed.pdf`
      );
      toast({ title: t("sign_pdf.success") });
    } catch {
      toast({
        title: t("sign_pdf.error_process"),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const hasPdf = pdfFile !== null;

  const previewPdfHash = useMemo(() => {
    if (!previewPdfPageCount || previewPdfPageCount < 1) {
      return "view=FitH";
    }
    const page = pageScope === "first" ? 1 : previewPdfPageCount;
    return `page=${page}&view=FitH`;
  }, [previewPdfPageCount, pageScope]);

  const modeButtons: { mode: InputMode; icon: React.ReactNode; label: string }[] = [
    { mode: "type", icon: <Type className="h-5 w-5" />, label: t("sign_pdf.mode_type") },
    { mode: "style", icon: <PenTool className="h-5 w-5" />, label: t("sign_pdf.mode_style") },
    { mode: "draw", icon: <Pencil className="h-5 w-5" />, label: t("sign_pdf.mode_draw") },
    { mode: "upload", icon: <Upload className="h-5 w-5" />, label: t("sign_pdf.mode_upload") },
  ];

  return (
    <PdfToolOffcanvasShell
      onSidebarReserveChange={onSidebarReserveChange}
      hasFiles={hasPdf}
      onClear={clearAll}
      intro={
        <div className="text-center mb-8">
          <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
            <PenTool className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("sign_pdf.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("sign_pdf.description")}
          </p>
        </div>
      }
      sidebar={
        <>
          <div className="space-y-1 border-b border-primary/15 pb-3">
            <h4 className="text-sm font-semibold text-foreground">
              {t("sign_pdf.details_heading")}
            </h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="sign-full-name" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                {t("sign_pdf.full_name")}
              </Label>
              <Input
                id="sign-full-name"
                placeholder={t("sign_pdf.full_name_ph")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sign-initials">{t("sign_pdf.initials")}</Label>
              <Input
                id="sign-initials"
                placeholder={t("sign_pdf.initials_ph")}
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                maxLength={12}
              />
            </div>
          </div>

          <div className="flex gap-2 border-t border-primary/10 pt-3">
            <div className="flex flex-col gap-1 border-r border-primary/15 pr-2 shrink-0">
              {modeButtons.map(({ mode, icon, label }) => (
                <Button
                  key={mode}
                  type="button"
                  variant={inputMode === mode ? "default" : "ghost"}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  title={label}
                  onClick={() => setInputMode(mode)}
                >
                  <span className="sr-only">{label}</span>
                  {icon}
                </Button>
              ))}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <input
                ref={signUploadRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onSignUpload}
              />
              <Tabs value={signTab} onValueChange={(v) => setSignTab(v as SignTab)}>
                <TabsList className="grid w-full grid-cols-3 h-auto gap-0.5 p-1">
                  <TabsTrigger value="signature" className="text-xs gap-1 px-1 py-2">
                    <PenTool className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t("sign_pdf.tab_signature")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="initials" className="text-xs gap-1 px-1 py-2">
                    <CaseSensitive className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t("sign_pdf.tab_initials")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="stamp" className="text-xs gap-1 px-1 py-2">
                    <Stamp className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t("sign_pdf.tab_stamp")}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signature" className="mt-3 space-y-3">
                  {inputMode === "style" ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {t("sign_pdf.pick_style")}
                      </p>
                      <ScrollArea className="h-[min(200px,28vh)] rounded-md border border-primary/15 p-2">
                        <RadioGroup
                          value={styleId}
                          onValueChange={(v) => setStyleId(v as SignatureStyleId)}
                          className="space-y-2"
                        >
                          {SIGNATURE_STYLE_FONTS.map((s) => (
                            <label
                              key={s.id}
                              className="flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-2 py-2 hover:bg-card/60 has-[[data-state=checked]]:border-primary/40"
                            >
                              <RadioGroupItem value={s.id} id={`style-${s.id}`} />
                              <span
                                className="text-lg leading-none truncate flex-1 min-w-0"
                                style={{ fontFamily: s.family }}
                              >
                                {displayText}
                              </span>
                            </label>
                          ))}
                        </RadioGroup>
                      </ScrollArea>
                    </>
                  ) : null}
                  {inputMode === "type" ? (
                    <p className="text-xs text-muted-foreground">
                      {t("sign_pdf.type_hint")}
                    </p>
                  ) : null}
                  {inputMode === "upload" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-primary/25"
                      onClick={() => signUploadRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadFile ? uploadFile.name : t("sign_pdf.upload_pick")}
                    </Button>
                  ) : null}
                  {inputMode === "draw" ? (
                    <p className="text-xs text-muted-foreground">
                      {t("sign_pdf.draw_use_panel")}
                    </p>
                  ) : null}
                </TabsContent>

                <TabsContent value="initials" className="mt-3 space-y-3">
                  {inputMode === "style" ? (
                    <ScrollArea className="h-[min(180px,24vh)] rounded-md border border-primary/15 p-2">
                      <RadioGroup
                        value={styleId}
                        onValueChange={(v) => setStyleId(v as SignatureStyleId)}
                        className="space-y-2"
                      >
                        {SIGNATURE_STYLE_FONTS.map((s) => (
                          <label
                            key={s.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-card/60"
                          >
                            <RadioGroupItem value={s.id} id={`ini-${s.id}`} />
                            <span
                              className="text-2xl leading-none"
                              style={{ fontFamily: s.family }}
                            >
                              {displayText}
                            </span>
                          </label>
                        ))}
                      </RadioGroup>
                    </ScrollArea>
                  ) : null}
                  {inputMode === "type" ? (
                    <p className="text-xs text-muted-foreground">
                      {t("sign_pdf.initials_type_hint")}
                    </p>
                  ) : null}
                  {inputMode === "upload" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-primary/25"
                      onClick={() => signUploadRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadFile ? uploadFile.name : t("sign_pdf.upload_pick")}
                    </Button>
                  ) : null}
                  {inputMode === "draw" ? (
                    <p className="text-xs text-muted-foreground">
                      {t("sign_pdf.draw_use_panel")}
                    </p>
                  ) : null}
                </TabsContent>

                <TabsContent value="stamp" className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="company-name">{t("sign_pdf.company_name")}</Label>
                    <Input
                      id="company-name"
                      placeholder={t("sign_pdf.company_ph")}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  {inputMode === "upload" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-primary/25"
                      onClick={() => signUploadRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadFile ? uploadFile.name : t("sign_pdf.upload_stamp")}
                    </Button>
                  ) : inputMode === "draw" ? (
                    <p className="text-xs text-muted-foreground">
                      {t("sign_pdf.draw_stamp_hint")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t("sign_pdf.stamp_vector_hint")}
                    </p>
                  )}
                </TabsContent>
              </Tabs>

              {inputMode === "draw" ? (
                <div className="space-y-2 rounded-md border border-primary/15 bg-card/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("sign_pdf.draw_hint")}
                  </p>
                  <canvas
                    ref={drawCanvasRef}
                    className="touch-none cursor-crosshair rounded-md border border-primary/25 bg-white block max-w-full dark:bg-zinc-950"
                    onPointerDown={onDrawPointerDown}
                    onPointerMove={onDrawPointerMove}
                    onPointerUp={onDrawPointerUp}
                    onPointerCancel={onDrawPointerUp}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <Label className="text-xs shrink-0 whitespace-nowrap">
                        {t("sign_pdf.pen_size")}
                      </Label>
                      <Slider
                        className="flex-1 py-1"
                        min={1}
                        max={8}
                        step={1}
                        value={[drawLineWidth]}
                        onValueChange={(v) => setDrawLineWidth(v[0] ?? 3)}
                      />
                      <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">
                        {drawLineWidth}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-primary/25"
                      onClick={clearDrawCanvas}
                    >
                      {t("sign_pdf.clear_drawing")}
                    </Button>
                  </div>
                </div>
              ) : null}

              {(signTab !== "stamp" || inputMode !== "upload") && (
                <div className="space-y-2">
                  <Label>{t("sign_pdf.color")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {SIGN_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.id}
                        className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background ${
                          !useCustomColor && colorPresetId === c.id
                            ? "ring-primary"
                            : "ring-transparent"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => {
                          setUseCustomColor(false);
                          setColorPresetId(c.id);
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      title={t("sign_pdf.color_custom")}
                      className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background ${
                        useCustomColor ? "ring-primary" : "ring-transparent"
                      }`}
                      style={{
                        background:
                          "conic-gradient(from 180deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)",
                      }}
                      onClick={() => setUseCustomColor(true)}
                    />
                  </div>
                  {useCustomColor ? (
                    <div className="flex items-center gap-3 pt-1">
                      <Label
                        htmlFor="sign-color-picker"
                        className="text-xs shrink-0 text-muted-foreground"
                      >
                        {t("sign_pdf.color_picker_label")}
                      </Label>
                      <input
                        id="sign-color-picker"
                        type="color"
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test(customColorHex)
                            ? customColorHex
                            : "#0f172a"
                        }
                        onChange={(e) => {
                          setCustomColorHex(e.target.value);
                          setUseCustomColor(true);
                        }}
                        className="h-9 w-14 cursor-pointer rounded-md border border-input bg-background p-0.5"
                      />
                    </div>
                  ) : null}
                </div>
              )}

              <div className="rounded-md border border-primary/15 bg-card/40 p-2">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("sign_pdf.preview_graphic_label")}
                </p>
                <div className="flex min-h-[56px] items-center justify-center bg-background/60 rounded">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="" className="max-h-20 max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("sign_pdf.pages_label")}</Label>
                <Select
                  value={pageScope}
                  onValueChange={(v) => setPageScope(v as SignPageScope)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last">{t("sign_pdf.pages_last")}</SelectItem>
                    <SelectItem value="first">{t("sign_pdf.pages_first")}</SelectItem>
                    <SelectItem value="all">{t("sign_pdf.pages_all")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={!hasPdf || busy}
            onClick={() => void handleApply()}
          >
            {busy ? t("sign_pdf.processing") : t("sign_pdf.apply")}
          </Button>
        </>
      }
    >
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <FileUploadZone
            onDrop={handlePdfDrop}
            onDragOver={(e) => e.preventDefault()}
            onFileSelect={() => {
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            fileInputRef={fileInputRef}
            acceptedFormats=".pdf,application/pdf"
            title={t("sign_pdf.drop_title")}
            description={t("sign_pdf.drop_desc")}
            className={
              hasPdf
                ? "min-h-[220px] py-8"
                : "min-h-[min(420px,52vh)] py-12 flex flex-col justify-center"
            }
            multiple={false}
          />
          {pdfFile ? (
            <>
              <div className="mt-4 rounded-lg border border-primary/15 bg-card/30 px-4 py-3">
                <p className="text-sm truncate" title={pdfFile.name}>
                  {pdfFile.name}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-primary/15 bg-card/25 px-4 py-3">
                <div className="min-w-0">
                  <Label
                    htmlFor="sign-pdf-preview-toggle"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    {t("sign_pdf.preview_pdf_toggle")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("sign_pdf.preview_pdf_hint")}
                  </p>
                </div>
                <Switch
                  id="sign-pdf-preview-toggle"
                  checked={showPdfPreview}
                  onCheckedChange={setShowPdfPreview}
                />
              </div>

              {showPdfPreview ? (
                <div className="mt-3 rounded-xl border border-primary/20 bg-card/20 overflow-hidden shadow-sm">
                  <div className="border-b border-primary/10 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-primary/80">
                    {t("sign_pdf.preview_pdf_heading")}
                  </div>
                  <div className="relative w-full bg-muted/20">
                    {pdfPreviewLoading ? (
                      <div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/75 backdrop-blur-[2px]"
                        aria-busy
                      >
                        <Loader2
                          className="h-8 w-8 animate-spin text-primary"
                          aria-hidden
                        />
                        <span className="text-xs text-muted-foreground">
                          {t("sign_pdf.preview_pdf_loading")}
                        </span>
                      </div>
                    ) : null}
                    {!uploadReadyForSign() ? (
                      <p className="p-8 text-center text-sm text-muted-foreground">
                        {inputMode === "draw"
                          ? t("sign_pdf.preview_pdf_need_draw")
                          : t("sign_pdf.preview_pdf_need_upload")}
                      </p>
                    ) : pdfPreviewError ? (
                      <p className="p-8 text-center text-sm text-destructive">
                        {t("sign_pdf.preview_pdf_error")}
                      </p>
                    ) : signedPdfPreviewUrl ? (
                      <iframe
                        key={`${signedPdfPreviewUrl}-${previewPdfHash}-${pageScope}`}
                        title={t("sign_pdf.preview_pdf_heading")}
                        src={`${signedPdfPreviewUrl}#${previewPdfHash}`}
                        className="h-[min(72vh,680px)] w-full min-h-[320px] border-0 bg-background"
                      />
                    ) : (
                      <p className="p-8 text-center text-sm text-muted-foreground">
                        {t("sign_pdf.preview_pdf_loading")}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </PdfToolOffcanvasShell>
  );
}
