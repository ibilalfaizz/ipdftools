import React, { useState, useRef, useCallback } from 'react';
import { Image, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from "@/components/ui/use-toast";
import FileUploadZone from './FileUploadZone';
import PdfToolOffcanvasShell from './PdfToolOffcanvasShell';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ConvertedFile {
  name: string;
  url: string;
  pageNumber: number;
}

const PDFToJPGConverter = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      toast({
        variant: "destructive",
        title: "Invalid Files",
        description: "Please select PDF files only.",
      });
    }
    if (pdfFiles.length > 0) {
      setFiles((prev) => [...prev, ...pdfFiles]);
      setConvertedFiles([]);
      toast({
        title: t('common.files_added'),
        description: `${pdfFiles.length} PDF file(s) added`,
      });
    }
  };

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

  const convertPDFToJPG = async (file: File): Promise<ConvertedFile[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
      }).promise;

      const convertedPages: ConvertedFile[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page
          .render({
            canvasContext: context,
            viewport,
            canvas,
          })
          .promise;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
        });

        const url = URL.createObjectURL(blob);
        const fileName = `${file.name.replace('.pdf', '')}_page_${pageNum}.jpg`;

        convertedPages.push({
          name: fileName,
          url: url,
          pageNumber: pageNum,
        });
      }

      return convertedPages;
    } catch (error) {
      console.error('Error in convertPDFToJPG:', error);
      throw error;
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: t('common.no_files_selected'),
        description: "Please select PDF files to convert.",
      });
      return;
    }

    setIsConverting(true);
    setConvertedFiles([]);

    try {
      const allConvertedFiles: ConvertedFile[] = [];

      for (const file of files) {
        const convertedPages = await convertPDFToJPG(file);
        allConvertedFiles.push(...convertedPages);
      }

      setConvertedFiles(allConvertedFiles);
      toast({
        title: t('common.conversion_complete'),
        description: `${allConvertedFiles.length} JPG image(s) created`,
      });
    } catch (error) {
      console.error('Conversion failed:', error);
      toast({
        variant: "destructive",
        title: t('common.conversion_failed'),
        description: "Failed to convert PDF to JPG. Please try again.",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    convertedFiles.forEach((file) => {
      handleDownload(file.url, file.name);
    });
  };

  const hasFiles = files.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
          <Image className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('pdf_to_jpg.title')}</h1>
        <p className="text-xl text-muted-foreground">{t('pdf_to_jpg.description')}</p>
      </div>

      <PdfToolOffcanvasShell hasFiles={hasFiles} onClear={clearAll} sidebar={
        <>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('common.files_added')}
            </p>
            <ul className="text-sm max-h-40 overflow-y-auto space-y-1.5 tool-list-box p-3">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex justify-between items-center gap-2">
                  <span className="truncate text-foreground" title={file.name}>{file.name}</span>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveFile(index)}>
                    {t('common.remove')}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <Button
            type="button"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            onClick={() => void handleConvert()}
            disabled={files.length === 0 || isConverting}
          >
            {isConverting ? t('common.converting') : t('pdf_to_jpg.convert_button')}
          </Button>

          {convertedFiles.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#d6ffd2]/15">
              <div className="flex justify-between items-center gap-2">
                <p className="text-sm font-medium text-foreground">{t('common.conversion_complete')}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadAll}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.download_all')}
                </Button>
              </div>
              <ul className="text-sm max-h-48 overflow-y-auto space-y-2 tool-list-box p-3">
                {convertedFiles.map((file, index) => (
                  <li key={index} className="flex justify-between items-center gap-2">
                    <span className="text-primary truncate">{file.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file.url, file.name)}
                    >
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
              title="Drop PDF files here or click to browse"
              description="Support for multiple PDF files • Each page will be converted to JPG"
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

export default PDFToJPGConverter;
