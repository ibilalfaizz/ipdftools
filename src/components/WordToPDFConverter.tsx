import React, { useState, useRef, useCallback } from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import FileUploadZone from './FileUploadZone';
import PdfToolOffcanvasShell from './PdfToolOffcanvasShell';

const WordToPDFConverter = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const docs = acceptedFiles.filter(
      (f) =>
        f.type === 'application/msword' ||
        f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        /\.docx?$/i.test(f.name)
    );
    if (docs.length === 0) return;
    setFiles((prev) => [...prev, ...docs]);
    setConvertedFiles([]);
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = useCallback(() => {
    setFiles([]);
    setConvertedFiles([]);
  }, []);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setConvertedFiles([]);

    try {
      const converted = files.map((file) => URL.createObjectURL(file));
      setConvertedFiles(converted);
    } catch (error) {
      console.error('Conversion failed', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFiles = files.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('word_to_pdf.title')}</h1>
        <p className="text-xl text-gray-600">{t('word_to_pdf.description')}</p>
      </div>

      <PdfToolOffcanvasShell hasFiles={hasFiles} onClear={clearAll} sidebar={
        <>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('common.files_added')}
            </p>
            <ul className="text-sm max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-gray-100 bg-white/90 p-3">
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
            {isConverting ? t('common.converting') : t('word_to_pdf.convert_button')}
          </Button>

          {convertedFiles.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-900">{t('common.conversion_complete')}</p>
              <ul className="text-sm max-h-48 overflow-y-auto space-y-2 rounded-lg border border-gray-100 bg-white p-3">
                {convertedFiles.map((url, index) => (
                  <li key={index} className="flex justify-between items-center gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline truncate"
                    >
                      {`converted_${index + 1}.pdf`}
                    </a>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(url)}>
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
              acceptedFormats=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              title="Drop Word files here or click to browse"
              description="Support for .doc and .docx files • Maximum 50MB per file"
              className={
                hasFiles
                  ? 'min-h-[220px] py-8'
                  : 'min-h-[min(420px,52vh)] py-12 flex flex-col justify-center'
              }
            />
          </CardContent>
        </Card>
      </PdfToolOffcanvasShell>
    </div>
  );
};

export default WordToPDFConverter;
