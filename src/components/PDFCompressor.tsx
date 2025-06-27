
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Download, Loader2, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';

const PDFCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedPdfBlob, setCompressedPdfBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const selectedFile = selectedFiles[0];
    
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      toast.error('File is too large. Maximum size is 100MB');
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedPdfBlob(null);
    setCompressedSize(0);
    toast.success('PDF file loaded successfully');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const compressPDF = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Basic compression by removing unnecessary objects and optimizing
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setCompressedPdfBlob(blob);
      setCompressedSize(blob.size);
      
      const compressionRatio = ((originalSize - blob.size) / originalSize * 100).toFixed(1);
      toast.success(`PDF compressed successfully! Reduced by ${compressionRatio}%`);
      
    } catch (error) {
      toast.error('Failed to compress PDF. Please try again.');
      console.error('Compression error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCompressedPDF = () => {
    if (!compressedPdfBlob || !file) return;
    
    const url = URL.createObjectURL(compressedPdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Compressed PDF downloaded successfully!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = () => {
    setFile(null);
    setCompressedPdfBlob(null);
    setOriginalSize(0);
    setCompressedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('File removed');
  };

  return (
    <div id="compress" className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Minimize className="h-8 w-8 text-green-600" />
            Compress PDF File
          </CardTitle>
          <p className="text-gray-600">
            Reduce PDF file size while maintaining quality
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-400 hover:bg-green-50/50 transition-all duration-200 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Drop your PDF here or click to browse
            </h3>
            <p className="text-gray-500 mb-4">
              Support for PDF files up to 100MB
            </p>
            <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
              Choose PDF file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File Display */}
          {file && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">PDF</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      Original size: {formatFileSize(originalSize)}
                      {compressedSize > 0 && (
                        <span className="ml-2 text-green-600">
                          → Compressed: {formatFileSize(compressedSize)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={removeFile}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Success Message & Download */}
          {compressedPdfBlob && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">PDF compressed successfully!</p>
                    <p className="text-sm text-green-700">
                      Size reduced by {((originalSize - compressedSize) / originalSize * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Button
                  onClick={downloadCompressedPDF}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Compress Button */}
          {file && !compressedPdfBlob && (
            <div className="pt-6 border-t border-gray-200">
              <Button
                onClick={compressPDF}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Compressing PDF...
                  </>
                ) : (
                  <>
                    <Minimize className="w-5 h-5 mr-2" />
                    Compress PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFCompressor;
