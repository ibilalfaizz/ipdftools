
import React, { useState, useRef } from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import FileUploadZone from './FileUploadZone';
import { convertPdfToWord } from '../lib/api';
import { saveAs } from 'file-saver';

const PDFToWordConverter = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: convert, isPending: isConverting } = useMutation({
    mutationFn: convertPdfToWord,
    onSuccess: (data) => {
      setConvertedFiles(data as any[]);
    },
    onError: (error) => {
      console.error('Conversion failed', error);
    }
  });

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setConvertedFiles([]);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    convert(formData);
  };

  const handleDownload = (file: any) => {
    // Mock implementation - create a blob for download
    const blob = new Blob(['Mock Word content'], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    saveAs(blob, file.filename);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('pdf_to_word.title')}</h1>
        <p className="text-xl text-gray-600">{t('pdf_to_word.description')}</p>
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
          {isConverting ? t('common.converting') : t('pdf_to_word.convert_button')}
        </Button>
      </div>

      {convertedFiles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">{t('common.conversion_complete')}:</h2>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {convertedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{file.filename}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
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

export default PDFToWordConverter;
