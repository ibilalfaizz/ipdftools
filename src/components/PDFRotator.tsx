
import React, { useState, useRef } from 'react';
import { RotateCw, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUploadZone from './FileUploadZone';
import { useLanguage } from '../contexts/LanguageContext';
import { rotatePdf } from '../lib/api';
import { saveAs } from 'file-saver';

const PDFRotator = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [rotatedFiles, setRotatedFiles] = useState<Blob[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDownload = (blob: Blob, index: number) => {
    saveAs(blob, `rotated_${index + 1}.pdf`);
  };

  const handleDrop = (droppedFiles: File[]) => {
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      setFiles((prev) => [...prev, ...Array.from(fileInputRef.current.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRotate = async () => {
    if (files.length === 0 || !selectedAngle) return;
    setIsRotating(true);
    setRotatedFiles([]);

    try {
      const rotatedBlobs: Blob[] = [];
      for (const file of files) {
        const rotatedBlob = await rotatePdf([file, selectedAngle]);
        rotatedBlobs.push(rotatedBlob as Blob);
      }
      setRotatedFiles(rotatedBlobs);
    } catch (error) {
      console.error('Rotation failed', error);
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mb-4">
          <RotateCw className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('rotate.title')}</h1>
        <p className="text-xl text-gray-600">{t('rotate.description')}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <FileUploadZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{t('common.files_added')}:</h2>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('rotate.select_angle')}
        </label>
        <Select value={selectedAngle} onValueChange={setSelectedAngle}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('rotate.angle_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90">{t('rotate.90_clockwise')}</SelectItem>
            <SelectItem value="180">{t('rotate.180')}</SelectItem>
            <SelectItem value="270">{t('rotate.270_clockwise')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center mb-6">
        <Button onClick={handleRotate} disabled={files.length === 0 || !selectedAngle || isRotating}>
          {isRotating ? t('rotate.rotating') : t('rotate.convert_button').replace('{angle}', selectedAngle)}
        </Button>
      </div>

      {rotatedFiles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">{t('common.conversion_complete')}:</h2>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {rotatedFiles.map((blob, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{`rotated_${index + 1}.pdf`}</span>
                <Button variant="ghost" size="sm" onClick={() => handleFileDownload(blob, index)}>
                  {t('common.download')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PDFRotator;
