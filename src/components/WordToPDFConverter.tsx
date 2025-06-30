import React, { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUploadZone } from '@/components/FileUploadZone';
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from '../contexts/LanguageContext';

const WordToPDFConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [conversionComplete, setConversionComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast()

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleFileSelect = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const selectedFiles = Array.from(fileInputRef.current.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: t('common.no_files_selected'),
        description: "Please select word files to convert."
      })
      return;
    }

    const allowedExtensions = /(\.doc|\.docx)$/i;
    const invalidFiles = files.filter(file => !allowedExtensions.exec(file.name));

    if (invalidFiles.length > 0) {
      toast({
        variant: "destructive",
        title: t('common.invalid_files'),
        description: t('word_to_pdf.word_only')
      })
      return;
    }

    setConverting(true);
    setConversionComplete(false);

    // Simulate conversion process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setConverting(false);
    setConversionComplete(true);
    toast({
      title: t('common.conversion_complete'),
      description: t('word_to_pdf.success'),
    })
  };

  const handleDownload = () => {
    // Simulate download process
    alert('Download will start soon!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
          <Upload className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('word_to_pdf.title')}</h1>
        <p className="text-xl text-gray-600">{t('word_to_pdf.description')}</p>
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
                <Button variant="outline" size="sm" onClick={() => handleRemoveFile(index)}>
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
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
          onClick={handleConvert}
          disabled={converting}
        >
          {converting ? t('common.converting') : t('word_to_pdf.convert_button')}
        </Button>
      </div>

      {conversionComplete && (
        <div className="text-center mt-8">
          <h2 className="text-3xl font-bold text-green-600 mb-4">{t('common.conversion_complete')}!</h2>
          <p className="text-gray-600 mb-4">Your Word file has been successfully converted to PDF.</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
            onClick={handleDownload}
          >
            {t('common.download')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WordToPDFConverter;
