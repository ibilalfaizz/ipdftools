
import React, { useState, useRef } from 'react';
import { Image, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import FileUploadZone from './FileUploadZone';
import { convertPdfToJpg } from '../lib/api';

const PDFToJPGConverter = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = () => {
    // File selection is now handled by FileUploadZone
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setConvertedFiles([]);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const result = await convertPdfToJpg(formData);
      setConvertedFiles(result as any[]);
    } catch (error) {
      console.error('Conversion failed', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <Image className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('pdf_to_jpg.title')}</h1>
        <p className="text-xl text-gray-600">{t('pdf_to_jpg.description')}</p>
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

      <div className="flex justify-center mb-6">
        <Button onClick={handleConvert} disabled={files.length === 0 || isConverting}>
          {isConverting ? t('common.converting') : t('pdf_to_jpg.convert_button')}
        </Button>
      </div>

      {convertedFiles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">{t('common.conversion_complete')}:</h2>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {convertedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {file.filename}
                </a>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(file.url)}>
                  <Download className="h-4 w-4 mr-2" />
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

export default PDFToJPGConverter;
