"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import FileUploadZone from "./FileUploadZone";
import PdfToolOffcanvasShell from "./PdfToolOffcanvasShell";
import {
  convertPdfFileToDocxBlob,
  docxDownloadNameFromPdf,
} from "@/lib/pdf-to-word";

type ConvertedItem = { url: string; downloadName: string };

const PDFToWordConverter = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const item of convertedFiles) {
        URL.revokeObjectURL(item.url);
      }
    };
  }, [convertedFiles]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const pdfs = acceptedFiles.filter((f) => f.type === "application/pdf");
    if (pdfs.length === 0) return;
    setFiles((prev) => [...prev, ...pdfs]);
    setConvertedFiles((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.url);
      return [];
    });
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const clearAll = useCallback(() => {
    setFiles([]);
    setConvertedFiles((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.url);
      return [];
    });
  }, []);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setConvertedFiles((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.url);
      return [];
    });

    const next: ConvertedItem[] = [];
    try {
      for (const file of files) {
        try {
          const blob = await convertPdfFileToDocxBlob(file);
          const url = URL.createObjectURL(blob);
          next.push({
            url,
            downloadName: docxDownloadNameFromPdf(file.name),
          });
        } catch (err) {
          console.error("PDF to Word conversion failed", err);
          toast({
            title: t("pdf_to_word.convert_failed"),
            description: file.name,
            variant: "destructive",
          });
        }
      }
      if (next.length > 0) {
        setConvertedFiles(next);
        toast({ title: t("pdf_to_word.success") });
      }
    } catch (error) {
      console.error("Conversion failed", error);
      toast({
        title: t("pdf_to_word.convert_failed"),
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (url: string, downloadName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFiles = files.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {t("pdf_to_word.title")}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t("pdf_to_word.description")}
        </p>
        <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
          {t("pdf_to_word.format_note")}
        </p>
      </div>

      <PdfToolOffcanvasShell
        hasFiles={hasFiles}
        onClear={clearAll}
        sidebar={
          <>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t("common.files_added")}
              </p>
              <ul className="text-sm max-h-40 overflow-y-auto space-y-1.5 tool-list-box p-3">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex justify-between items-center gap-2"
                  >
                    <span className="truncate" title={file.name}>
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      {t("common.remove")}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={() => void handleConvert()}
              disabled={files.length === 0 || isConverting}
            >
              {isConverting ? t("common.converting") : t("pdf_to_word.convert_button")}
            </Button>

            {convertedFiles.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#d6ffd2]/15">
                <p className="text-sm font-medium text-foreground">
                  {t("common.conversion_complete")}
                </p>
                <ul className="text-sm max-h-48 overflow-y-auto space-y-2 tool-list-box p-3">
                  {convertedFiles.map((item, index) => (
                    <li
                      key={`${item.url}-${index}`}
                      className="flex justify-between items-center gap-2"
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline truncate"
                      >
                        {item.downloadName}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDownload(item.url, item.downloadName)
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t("common.download")}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        }
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0">
            <FileUploadZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              acceptedFormats=".pdf,application/pdf"
              title={t("pdf_to_word.title")}
              description={t("pdf_to_word.description")}
              className={
                hasFiles
                  ? "min-h-[220px] py-8"
                  : "min-h-[min(420px,52vh)] py-12 flex flex-col justify-center"
              }
            />
          </CardContent>
        </Card>
      </PdfToolOffcanvasShell>
    </div>
  );
};

export default PDFToWordConverter;
