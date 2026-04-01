import React, { useState, useRef, useCallback } from 'react';
import { RotateCw, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUploadZone from './FileUploadZone';
import PdfToolOffcanvasShell, {
  type PdfToolSidebarReserveProps,
} from "./PdfToolOffcanvasShell";
import { useLanguage } from '../contexts/LanguageContext';
import { rotatePDF } from '../lib/api';
import { saveAs } from 'file-saver';

const PDFRotator = ({
  onSidebarReserveChange,
}: PdfToolSidebarReserveProps = {}) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [rotatedFiles, setRotatedFiles] = useState<any[]>([]);
  const [rotationAngle, setRotationAngle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const pdfs = acceptedFiles.filter((f) => f.type === 'application/pdf');
    if (pdfs.length === 0) return;
    setFiles((prev) => [...prev, ...pdfs]);
    setRotatedFiles([]);
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
    setRotatedFiles([]);
    setRotationAngle('');
  }, []);

  const handleRotate = async () => {
    if (files.length === 0 || !rotationAngle) return;
    setIsRotating(true);
    setRotatedFiles([]);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('angle', rotationAngle);

      const result = await rotatePDF(formData);
      setRotatedFiles(result as any[]);
    } catch (error) {
      console.error('Rotation failed', error);
    } finally {
      setIsRotating(false);
    }
  };

  const handleDownload = (file: any) => {
    const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
    saveAs(blob, file.filename);
  };

  const hasFiles = files.length > 0;

  return (
    <PdfToolOffcanvasShell
      onSidebarReserveChange={onSidebarReserveChange}
      intro={
        <div className="text-center mb-8">
          <div className="inline-flex p-4 tool-icon-bubble rounded-full mb-4">
            <RotateCw className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('rotate.title')}</h1>
          <p className="text-xl text-muted-foreground">{t('rotate.description')}</p>
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('rotate.select_angle')}
            </label>
            <Select value={rotationAngle} onValueChange={setRotationAngle}>
              <SelectTrigger>
                <SelectValue placeholder={t('rotate.angle_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">{t('rotate.90_clockwise')}</SelectItem>
                <SelectItem value="180">{t('rotate.180')}</SelectItem>
                <SelectItem value="270">{t('rotate.270_clockwise')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={() => void handleRotate()}
            disabled={files.length === 0 || !rotationAngle || isRotating}
          >
            {isRotating ? t('rotate.rotating') : t('rotate.convert_button').replace('{angle}', rotationAngle)}
          </Button>

          {rotatedFiles.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#d6ffd2]/15">
              <p className="text-sm font-medium text-foreground">{t('common.conversion_complete')}</p>
              <ul className="text-sm max-h-48 overflow-y-auto space-y-2 tool-list-box p-3">
                {rotatedFiles.map((file, index) => (
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
              title={t('rotate.title')}
              description={t('rotate.description')}
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

export default PDFRotator;
