
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, GripVertical, Download, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import FileUploadZone from './FileUploadZone';
import { mergePDFs } from '../utils/pdfMergeAPI';

interface FileWithId {
  id: string;
  file: File;
}

const PDFMerger = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current?.files) {
      const newFiles = Array.from(fileInputRef.current.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const moveFile = useCallback((dragIndex: number, hoverIndex: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const draggedFile = newFiles[dragIndex];
      newFiles.splice(dragIndex, 1);
      newFiles.splice(hoverIndex, 0, draggedFile);
      return newFiles;
    });
  }, []);

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsProcessing(true);
    try {
      const fileArray = files.map(f => f.file);
      const mergedPdf = await mergePDFs(fileArray);
      // Handle the response correctly - it should be a blob
      const blob = mergedPdf instanceof Blob ? mergedPdf : new Blob([mergedPdf]);
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (mergedPdfUrl) {
      const link = document.createElement('a');
      link.href = mergedPdfUrl;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-4">
          <Upload className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('merge.title')}</h1>
        <p className="text-xl text-gray-600">{t('merge.description')}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <FileUploadZone
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('common.selected_files')}</h3>
            <div className="space-y-2">
              {files.map((fileWithId, index) => (
                <div
                  key={fileWithId.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <span className="text-sm font-medium">{index + 1}.</span>
                    <span className="text-sm text-gray-700">{fileWithId.file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(fileWithId.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center space-x-4 mb-6">
        <Button
          onClick={handleMerge}
          disabled={files.length < 2 || isProcessing}
          className="px-8 py-3"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('common.processing')}
            </>
          ) : (
            t('merge.merge_button')
          )}
        </Button>
      </div>

      {mergedPdfUrl && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4 text-green-600">
              {t('common.success')}
            </h3>
            <Button onClick={handleDownload} className="px-8 py-3">
              <Download className="h-4 w-4 mr-2" />
              {t('common.download')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFMerger;
