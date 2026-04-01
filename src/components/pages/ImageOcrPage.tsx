"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronsUpDown,
  ClipboardCopy,
  Download,
  Loader2,
} from "lucide-react";
import JSZip from "jszip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Header from "../Header";
import Footer from "../Footer";
import FileUploadZone from "../FileUploadZone";
import { ImageSidebarFileRow } from "../ImageToolsBatchForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import {
  extractTextFromImages,
  formatOcrResultsAsPlainText,
  OCR_LANG_MULTI,
  type OcrFileResult,
  type OcrProgress,
  type OcrWorkerLang,
} from "@/lib/client-image-ocr";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

type FileEntry = { id: string; file: File };

type OcrLangOption = {
  value: OcrWorkerLang;
  label: string;
  /** Space-separated tokens for cmdk search (Latin + common names). */
  search: string;
};

export default function ImageOcrPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [results, setResults] = useState<OcrFileResult[] | null>(null);
  const [ocrLang, setOcrLang] = useState<OcrWorkerLang | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  const langOptions: OcrLangOption[] = useMemo(
    () => [
      {
        value: OCR_LANG_MULTI,
        label: t("image_ocr.lang_auto"),
        search:
          "auto multilingual slower eng spa fra english spanish french español français",
      },
      {
        value: "eng",
        label: t("image_ocr.lang_eng"),
        search: "eng english anglais inglés ingles",
      },
      {
        value: "spa",
        label: t("image_ocr.lang_spa"),
        search: "spa spanish español espagnol castellano",
      },
      {
        value: "fra",
        label: t("image_ocr.lang_fra"),
        search: "fra french français francais français",
      },
    ],
    [t]
  );

  const selectedLangLabel = useMemo(() => {
    if (!ocrLang) return null;
    return langOptions.find((o) => o.value === ocrLang)?.label ?? null;
  }, [ocrLang, langOptions]);

  const files = useMemo(
    () => fileEntries.map((e) => e.file),
    [fileEntries]
  );

  const clearFiles = useCallback(() => {
    setFileEntries([]);
    setResults(null);
    setProgress(null);
  }, []);

  const removeFileEntry = useCallback((id: string) => {
    setFileEntries((prev) => prev.filter((e) => e.id !== id));
    setResults(null);
    setProgress(null);
  }, []);

  const onDrop = useCallback((incoming: File[]) => {
    const imgs = incoming.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setFileEntries((prev) => [
      ...prev,
      ...imgs.map((file) => ({ id: crypto.randomUUID(), file })),
    ]);
    setResults(null);
    setProgress(null);
  }, []);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runOcr = async () => {
    if (files.length === 0) {
      toast({ title: t("image_tools.no_files"), variant: "destructive" });
      return;
    }
    if (ocrLang == null) {
      toast({
        title: t("image_ocr.select_language_first"),
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    setResults(null);
    setProgress(null);
    try {
      const out = await extractTextFromImages(files, {
        lang: ocrLang,
        onProgress: (p) => setProgress(p),
      });
      setResults(out);
      toast({ title: t("image_ocr.success") });
    } catch {
      toast({
        title: t("image_tools.error"),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const combinedText = useMemo(
    () =>
      results
        ? formatOcrResultsAsPlainText(results, t("image_ocr.empty_result"))
        : "",
    [results, t]
  );

  const copyAll = async () => {
    if (!combinedText) return;
    try {
      await navigator.clipboard.writeText(combinedText);
      toast({ title: t("image_ocr.copied") });
    } catch {
      toast({
        title: t("image_tools.error"),
        variant: "destructive",
      });
    }
  };

  const downloadMergedTxt = () => {
    if (!combinedText) return;
    const blob = new Blob([combinedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t("image_tools.success") });
  };

  const downloadZip = async () => {
    if (!results?.length) return;
    try {
      const zip = new JSZip();
      for (const r of results) {
        zip.file(r.downloadName, r.text || " ");
      }
      const out = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
      });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ocr-text.zip";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("image_tools.success") });
    } catch {
      toast({ title: t("image_tools.error"), variant: "destructive" });
    }
  };

  const hasFiles = fileEntries.length > 0;
  const sheetOpen = hasFiles;
  const showResultPanel = busy || results !== null;
  const canExtract = hasFiles && ocrLang != null && !busy;

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
          {t("image_tools.files_added")}: {fileEntries.length}
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

      <div className="space-y-2">
        <Label htmlFor="ocr-lang-trigger" className="text-xs font-medium text-muted-foreground">
          {t("image_ocr.language_label")}
        </Label>
        <Popover open={langOpen} onOpenChange={setLangOpen}>
          <PopoverTrigger asChild>
            <Button
              id="ocr-lang-trigger"
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={langOpen}
              disabled={busy}
              className="w-full justify-between border-[#d6ffd2]/25 bg-background font-normal text-foreground"
            >
              <span className="truncate text-left">
                {selectedLangLabel ?? t("image_ocr.combobox_placeholder")}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(calc(100vw-2rem),22rem)] p-0 z-[80]"
            align="start"
          >
            <Command>
              <CommandInput placeholder={t("image_ocr.combobox_search")} />
              <CommandList>
                <CommandEmpty>{t("image_ocr.combobox_empty")}</CommandEmpty>
                <CommandGroup>
                  {langOptions.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={`${opt.value} ${opt.search} ${opt.label}`}
                      onSelect={() => {
                        setOcrLang(opt.value);
                        setLangOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          ocrLang === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {ocrLang == null ? (
          <p className="text-xs text-[#3bd62b]/90">{t("image_ocr.select_language_first")}</p>
        ) : null}
      </div>

      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={!canExtract}
        onClick={() => void runOcr()}
      >
        {busy ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
        ) : null}
        {busy ? t("image_ocr.processing") : t("image_ocr.process")}
      </Button>

      {results && results.length > 0 ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-[#d6ffd2]/15">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => void copyAll()}
          >
            <ClipboardCopy className="mr-2 h-4 w-4" />
            {t("image_ocr.copy_all")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={downloadMergedTxt}
          >
            <Download className="mr-2 h-4 w-4" />
            {t("image_ocr.download_txt")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => void downloadZip()}
          >
            <Download className="mr-2 h-4 w-4" />
            {t("image_ocr.download_zip")}
          </Button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="tool-page-card">
            <CardContent className="p-0">
              <div
                className={cn(
                  "w-full min-w-0 relative transition-[padding]",
                  hasFiles && IMAGE_TOOL_SHEET_RESERVE
                )}
              >
                <div className="px-4 sm:px-6 pt-6 pb-2 md:px-8">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("image_ocr.title")}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {t("image_ocr.description")}
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
                    title={t("image_ocr.drop_title")}
                    description={t("image_ocr.drop_desc")}
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

                {showResultPanel ? (
                  <div className="mx-auto w-full max-w-3xl px-4 pb-8 min-w-0">
                    {busy ? (
                      <div className="mb-4 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("image_ocr.progress_label")}
                        </p>
                        {progress ? (
                          <>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#103c44]/80 ring-1 ring-[#d6ffd2]/15">
                              <div
                                className="h-full bg-[#3bd62b] transition-[width] duration-300"
                                style={{
                                  width: `${Math.round(
                                    Math.min(
                                      1,
                                      Math.max(0, progress.overallProgress)
                                    ) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {progress.status}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("image_ocr.extracting_wait")}
                          </p>
                        )}
                      </div>
                    ) : null}

                    {results ? (
                      <div className="rounded-lg border border-[#d6ffd2]/15 bg-[#103c44]/35 p-4 min-h-[8rem]">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-[#d6ffd2]">
                            {t("image_ocr.result_heading")}
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-[#d6ffd2]/80 hover:bg-[#d6ffd2]/10 hover:text-[#d6ffd2]"
                            disabled={!combinedText}
                            aria-label={t("image_ocr.copy_all")}
                            title={t("image_ocr.copy_all")}
                            onClick={() => void copyAll()}
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="max-h-[min(52vh,480px)] overflow-y-auto whitespace-pre-wrap break-words text-sm text-[#d6ffd2]/90 font-sans">
                          {combinedText || t("image_ocr.empty_result")}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <Sheet modal={false} open={sheetOpen} onOpenChange={() => {}}>
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
