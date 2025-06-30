
import React, { useState, useRef, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from '../contexts/LanguageContext';
import FileUploadZone from './FileUploadZone';
import { useMutation } from '@tanstack/react-query';
import { convertPdfToWord } from '../lib/api';
import { saveAs } from 'file-saver';

const PDFToWordConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);

  const { mutate } = useMutation({
    mutationFn: convertPdfToWord,
    onSuccess: (data: any) => {
      setIsConverting(false);
      if (data && data.length > 0) {
        data.forEach((fileData: any, index: number) => {
          saveAs(fileData.url, fileData.filename);
        });
        toast({
          title: t('common.conversion_complete'),
          description: t('pdf_to_word.success'),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('common.conversion_failed'),
          description: 'No files were converted.',
        });
      }
      setFiles([]);
    },
    onError: () => {
      setIsConverting(false);
      toast({
        variant: "destructive",
        title: t('common.conversion_failed'),
        description: 'An error occurred during conversion.',
      });
    },
  });

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const handleFileSelect = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const selectedFiles = Array.from(fileInputRef.current.files);
      handleDrop(selectedFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: t('common.no_files_selected'),
        description: t('pdf_to_word.select_pdf'),
      });
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    setIsConverting(true);
    mutate(formData);
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('common.files_added')}:</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">{file.name}</span>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-100" onClick={() => handleRemoveFile(index)}>
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-md py-3 px-8"
          onClick={handleConvert}
          disabled={isConverting}
        >
          {isConverting ? t('common.converting') : t('pdf_to_word.convert_button')}
        </Button>
      </div>
    </div>
  );
};

export default PDFToWordConverter;
