
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, GripVertical, Download, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import FileUploadZone from './FileUploadZone';
import PdfToolOffcanvasShell, {
  type PdfToolSidebarReserveProps,
} from "./PdfToolOffcanvasShell";
import { mergePdfFiles } from "@/lib/pdf-merge-client";

interface FileWithId {
  id: string;
  file: File;
}

const PDFMerger = ({
  onSidebarReserveChange,
}: PdfToolSidebarReserveProps = {}) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const mergedUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const revokeMerged = useCallback(() => {
    if (mergedUrlRef.current) {
      URL.revokeObjectURL(mergedUrlRef.current);
      mergedUrlRef.current = null;
    }
  }, []);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const pdfs = acceptedFiles.filter((f) => f.type === 'application/pdf');
    if (pdfs.length === 0) return;
    const newFiles = pdfs.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    revokeMerged();
    setMergedPdfUrl(null);
  }, [revokeMerged]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleRemoveFile = useCallback(
    (id: string) => {
      revokeMerged();
      setMergedPdfUrl(null);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [revokeMerged]
  );

  const moveFile = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      revokeMerged();
      setMergedPdfUrl(null);
      setFiles((prev) => {
        const newFiles = [...prev];
        const draggedFile = newFiles[dragIndex];
        newFiles.splice(dragIndex, 1);
        newFiles.splice(hoverIndex, 0, draggedFile);
        return newFiles;
      });
    },
    [revokeMerged]
  );

  const clearAll = useCallback(() => {
    revokeMerged();
    setFiles([]);
    setMergedPdfUrl(null);
  }, [revokeMerged]);

  const handleMerge = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    try {
      const fileArray = files.map((f) => f.file);
      revokeMerged();
      const bytes = await mergePdfFiles(fileArray);
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      mergedUrlRef.current = url;
      setMergedPdfUrl(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (mergedPdfUrl) {
      const link = document.createElement('a');
      link.href = mergedPdfUrl;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const hasFiles = files.length > 0;

  return (
    <PdfToolOffcanvasShell
      onSidebarReserveChange={onSidebarReserveChange}
      intro={
        <div className="text-center mb-8">
          <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('merge.title')}</h1>
          <p className="text-xl text-muted-foreground">{t('merge.description')}</p>
        </div>
      }
      hasFiles={hasFiles}
      onClear={clearAll}
      sidebar={
        <>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('common.selected_files')}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((fileWithId, index) => (
                <div
                  key={fileWithId.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#d6ffd2]/15 bg-[#103c44]/50"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium shrink-0">{index + 1}.</span>
                    <span className="text-sm text-foreground truncate" title={fileWithId.file.name}>
                      {fileWithId.file.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(fileWithId.id)}
                    className="text-red-500 hover:text-red-700 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={() => void handleMerge()}
            disabled={files.length < 2 || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.processing')}
              </>
            ) : (
              t('merge.merge_button')
            )}
          </Button>

          {mergedPdfUrl && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#d6ffd2]/15">
              <p className="text-sm font-medium text-primary">{t('common.success')}</p>
              <Button type="button" className="w-full" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('common.download')}
              </Button>
            </div>
          )}
        </>
      }>
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0">
            <FileUploadZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              acceptedFormats=".pdf,application/pdf"
              title={t('merge.title')}
              description={t('merge.description')}
              className={
                hasFiles
                  ? 'min-h-[220px] py-8'
                  : 'min-h-[min(420px,52vh)] py-12 flex flex-col justify-center'
              }
            />
          </CardContent>
        </Card>
      </PdfToolOffcanvasShell>
  );
};

export default PDFMerger;
