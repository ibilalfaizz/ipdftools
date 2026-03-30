import React, { useState, useRef, useCallback } from 'react';
import { Download, Loader2, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import FileUploadZone from './FileUploadZone';
import PdfToolOffcanvasShell from './PdfToolOffcanvasShell';

const PDFCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedPdfBlob, setCompressedPdfBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyPdfFile = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 100MB');
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedPdfBlob(null);
    setCompressedSize(0);
    toast.success('PDF file loaded successfully');
  }, []);

  const handleZoneDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdf = acceptedFiles.find((f) => f.type === 'application/pdf');
      if (pdf) applyPdfFile(pdf);
    },
    [applyPdfFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
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

      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      });

      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      setCompressedPdfBlob(blob);
      setCompressedSize(blob.size);

      const compressionRatio = (((originalSize - blob.size) / originalSize) * 100).toFixed(1);
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
  };

  const hasFiles = file !== null;

  return (
    <PdfToolOffcanvasShell hasFiles={hasFiles} onClear={removeFile} sidebar={
      <>
        {file && (
          <div className="rounded-lg border border-[#d6ffd2]/15 bg-[#103c44]/50 p-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                <span className="text-primary font-bold text-xs">PDF</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate" title={file.name}>{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Original: {formatFileSize(originalSize)}
                  {compressedSize > 0 && (
                    <span className="ml-2 text-green-600">
                      → {formatFileSize(compressedSize)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {file && !compressedPdfBlob && (
          <Button
            type="button"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            onClick={() => void compressPDF()}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                Compressing PDF...
              </>
            ) : (
              <>
                <Minimize className="w-5 h-5 mr-2 inline" />
                Compress PDF
              </>
            )}
          </Button>
        )}

        {compressedPdfBlob && file && (
          <div className="rounded-lg border border-[#d6ffd2]/25 bg-[#103c44]/60 p-3 space-y-3">
            <p className="text-sm font-medium text-foreground">PDF compressed successfully!</p>
            <p className="text-sm text-muted-foreground">
              Size reduced by {((originalSize - compressedSize) / originalSize * 100).toFixed(1)}%
            </p>
            <Button
              type="button"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={downloadCompressedPDF}
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Download
            </Button>
          </div>
        )}
      </>
    }>
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <FileUploadZone
            onDrop={handleZoneDrop}
            onDragOver={handleDragOver}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
            acceptedFormats=".pdf,application/pdf"
            multiple={false}
            title="Drop your PDF here or click to browse"
            description="Support for PDF files up to 100MB"
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

export default PDFCompressor;
