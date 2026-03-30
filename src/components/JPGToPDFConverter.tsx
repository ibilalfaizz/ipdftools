import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from "@/components/ui/use-toast";
import FileUploadZone from './FileUploadZone';
import PdfToolOffcanvasShell from './PdfToolOffcanvasShell';

const JPGToPDFConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [convertedPdf, setConvertedPdf] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const images = acceptedFiles.filter((f) => f.type.startsWith('image/'));
      if (images.length === 0) return;
      setFiles((prevFiles) => [...prevFiles, ...images]);
      setConvertedPdf(null);
      toast({
        title: t('common.files_added'),
        description: `${images.length} ${t('common.files_added').toLowerCase()}`,
      });
    },
    [t, toast]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const clearAll = useCallback(() => {
    setFiles([]);
    setConvertedPdf(null);
  }, []);

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: t('common.no_files_selected'),
        description: t('common.no_files_selected').toLowerCase(),
      });
      return;
    }

    setConversionLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      pdf.deletePage(1);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await readFileAsDataURL(file);

        const img = new Image();
        img.src = imageUrl;

        await new Promise((resolve, reject) => {
          img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const aspectRatio = imgWidth / imgHeight;

            const a4Width = 595.28;
            const a4Height = 841.89;

            let pageWidth: number;
            let pageHeight: number;
            let imgDisplayWidth: number;
            let imgDisplayHeight: number;

            if (aspectRatio > 1) {
              pageWidth = a4Height;
              pageHeight = a4Width;
            } else {
              pageWidth = a4Width;
              pageHeight = a4Height;
            }

            const pageAspectRatio = pageWidth / pageHeight;

            if (aspectRatio > pageAspectRatio) {
              imgDisplayWidth = pageWidth;
              imgDisplayHeight = pageWidth / aspectRatio;
            } else {
              imgDisplayHeight = pageHeight;
              imgDisplayWidth = pageHeight * aspectRatio;
            }

            const x = (pageWidth - imgDisplayWidth) / 2;
            const y = (pageHeight - imgDisplayHeight) / 2;

            pdf.addPage([pageWidth, pageHeight]);
            const fmt = file.type === 'image/png' ? 'PNG' : 'JPEG';
            pdf.addImage(imageUrl, fmt, x, y, imgDisplayWidth, imgDisplayHeight);
            resolve(null);
          };

          img.onerror = (error) => {
            console.error('Error loading image:', error);
            reject(error);
          };
        });
      }

      setConversionLoading(false);
      setConvertedPdf(pdf);
      toast({
        title: t('common.conversion_complete'),
        description: t('common.conversion_complete').toLowerCase(),
      });
    } catch (error) {
      console.error('Error converting to PDF:', error);
      setConversionLoading(false);
      toast({
        variant: "destructive",
        title: t('common.conversion_failed'),
        description: t('common.conversion_failed').toLowerCase(),
      });
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as Data URL'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownload = () => {
    if (convertedPdf) {
      convertedPdf.save('converted.pdf');
    }
  };

  const hasFiles = files.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
          <Download className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('jpg_to_pdf.title')}</h1>
        <p className="text-xl text-muted-foreground">{t('jpg_to_pdf.description')}</p>
      </div>

      <PdfToolOffcanvasShell hasFiles={hasFiles} onClear={clearAll} sidebar={
        <>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('common.files_added')}
            </p>
            <ul className="text-sm max-h-40 overflow-y-auto space-y-1.5 tool-list-box p-3">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2">
                  <span className="text-foreground truncate" title={file.name}>{file.name}</span>
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
            onClick={() => void convertToPdf()}
            disabled={conversionLoading}
          >
            {conversionLoading ? t('common.converting') : t('common.convert')}
          </Button>

          {convertedPdf && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#d6ffd2]/15">
              <Button
                type="button"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleDownload}
              >
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
              acceptedFormats="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              title={t('jpg_to_pdf.title')}
              description={t('jpg_to_pdf.description')}
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

export default JPGToPDFConverter;
