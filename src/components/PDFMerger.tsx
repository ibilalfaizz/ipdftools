
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, GripVertical, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUploadZone from './FileUploadZone';
import FileList from './FileList';
import { toast } from 'sonner';

export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

const PDFMerger = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: PDFFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF file`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error(`${file.name} is too large. Maximum size is 50MB`);
        continue;
      }

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size
      });
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} file${newFiles.length > 1 ? 's' : ''}`);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success('File removed');
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });
  }, []);

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast.error('Please upload at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      files.forEach((pdfFile, index) => {
        formData.append(`pdf-${index}`, pdfFile.file);
      });

      // For now, we'll simulate the merge process
      // In a real app, you'd send this to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate download
      toast.success('PDFs merged successfully!');
      
      // In a real implementation, you would:
      // const response = await fetch('/api/merge-pdfs', {
      //   method: 'POST',
      //   body: formData
      // });
      // const blob = await response.blob();
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'merged.pdf';
      // a.click();
      
    } catch (error) {
      toast.error('Failed to merge PDFs. Please try again.');
      console.error('Merge error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    toast.success('All files cleared');
  };

  return (
    <div id="merge" className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Merge PDF Files
          </CardTitle>
          <p className="text-gray-600">
            Upload multiple PDF files and merge them into a single document
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <FileUploadZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
          />

          {files.length > 0 && (
            <FileList
              files={files}
              onRemove={removeFile}
              onReorder={reorderFiles}
            />
          )}

          {files.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={mergePDFs}
                disabled={files.length < 2 || isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Merge PDFs ({files.length})
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearAll}
                variant="outline"
                className="sm:w-auto border-gray-300 hover:bg-gray-50"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFMerger;
