import React, { useState, useRef, useCallback } from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import FileUploadZone from './FileUploadZone';
import PdfToolOffcanvasShell, {
  type PdfToolSidebarReserveProps,
} from "./PdfToolOffcanvasShell";
import { extractTextFromPdf } from '@/lib/pdf-extract-text';

const PDFToTextConverter = ({
  onSidebarReserveChange,
}: PdfToolSidebarReserveProps = {}) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{ filename: string; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (acceptedFiles: File[]) => {
    const pdfs = acceptedFiles.filter((f) => f.type === 'application/pdf');
    if (pdfs.length === 0) return;
    setFiles((prev) => [...prev, ...pdfs]);
    setConvertedFiles([]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const clearAll = useCallback(() => {
    setFiles([]);
    setConvertedFiles([]);
  }, []);

  async function handleConvert() {
    if (files.length === 0) return;
    setIsConverting(true);
    setConvertedFiles([]);

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const textContent = await extractTextFromPdf(file);
          return {
            filename: file.name.replace('.pdf', '.txt'),
            content: textContent,
          };
        })
      );
      setConvertedFiles(results);
    } catch (error) {
      console.error('Conversion failed', error);
    } finally {
      setIsConverting(false);
    }
  }

  function handleDownload(file: { filename: string; content: string }) {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const hasFiles = files.length > 0;

  return (
    <PdfToolOffcanvasShell
      onSidebarReserveChange={onSidebarReserveChange}
      intro={
        <div className="text-center mb-8">
          <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('pdf_to_text.title')}</h1>
          <p className="text-xl text-muted-foreground">{t('pdf_to_text.description')}</p>
        </div>
      }
      hasFiles={hasFiles}
      onClear={clearAll}
      sidebar={
        <>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('common.files_added')}
            </p>
            <ul className="text-sm max-h-40 overflow-y-auto space-y-1.5 tool-list-box p-3">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex justify-between items-center gap-2">
                  <span className="truncate" title={file.name}>{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                    {t('common.remove')}
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
            {isConverting ? t('common.converting') : t('pdf_to_text.convert_button')}
          </Button>

          {convertedFiles.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#d6ffd2]/15">
              <p className="text-sm font-medium text-foreground">{t('common.conversion_complete')}</p>
              <ul className="text-sm max-h-48 overflow-y-auto space-y-2 tool-list-box p-3">
                {convertedFiles.map((file, index) => (
                  <li key={index} className="flex justify-between items-center gap-2">
                    <span className="truncate">{file.filename}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      {t('common.download')}
                    </Button>
                  </li>
                ))}
              </ul>
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
              title={t('pdf_to_text.title')}
              description={t('pdf_to_text.description')}
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

export default PDFToTextConverter;
