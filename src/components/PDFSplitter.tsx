import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Loader2, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';

interface SplitOption {
  type: 'individual' | 'range';
  ranges?: string;
}

interface SplitResult {
  blobs: Blob[];
  filenames: string[];
}

const PDFSplitter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitOption, setSplitOption] = useState<SplitOption>({ type: 'individual' });
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const selectedFile = selectedFiles[0];
    
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File is too large. Maximum size is 50MB');
      return;
    }

    setFile(selectedFile);
    setSplitResult(null);
    
    // Get page count
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
      toast.success(`PDF loaded with ${pdf.getPageCount()} pages`);
    } catch (error) {
      toast.error('Failed to read PDF file');
      console.error('PDF read error:', error);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const parseRanges = (rangesStr: string): number[][] => {
    const ranges: number[][] = [];
    const parts = rangesStr.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()));
        if (start && end && start <= end && start >= 1 && end <= pageCount) {
          const range = [];
          for (let i = start; i <= end; i++) {
            range.push(i - 1); // Convert to 0-based index
          }
          ranges.push(range);
        }
      } else {
        const pageNum = parseInt(part);
        if (pageNum >= 1 && pageNum <= pageCount) {
          ranges.push([pageNum - 1]); // Convert to 0-based index
        }
      }
    }
    
    return ranges;
  };

  const splitPDF = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      
      let pagesToSplit: number[][];
      
      if (splitOption.type === 'individual') {
        // Split into individual pages
        pagesToSplit = Array.from({ length: pageCount }, (_, i) => [i]);
      } else {
        // Split by custom ranges
        if (!splitOption.ranges) {
          toast.error('Please enter page ranges');
          setIsProcessing(false);
          return;
        }
        pagesToSplit = parseRanges(splitOption.ranges);
        if (pagesToSplit.length === 0) {
          toast.error('Invalid page ranges. Use format like: 1-3, 5, 7-9');
          setIsProcessing(false);
          return;
        }
      }

      const blobs: Blob[] = [];
      const filenames: string[] = [];

      // Create split PDFs
      for (let i = 0; i < pagesToSplit.length; i++) {
        const newPdf = await PDFDocument.create();
        const pageIndices = pagesToSplit[i];
        
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        blobs.push(blob);
        
        if (splitOption.type === 'individual') {
          filenames.push(`${file.name.replace('.pdf', '')}_page_${pageIndices[0] + 1}.pdf`);
        } else {
          const rangeStr = pageIndices.length === 1 
            ? `page_${pageIndices[0] + 1}` 
            : `pages_${pageIndices[0] + 1}-${pageIndices[pageIndices.length - 1] + 1}`;
          filenames.push(`${file.name.replace('.pdf', '')}_${rangeStr}.pdf`);
        }
      }
      
      setSplitResult({ blobs, filenames });
      toast.success(`PDF split into ${pagesToSplit.length} file${pagesToSplit.length > 1 ? 's' : ''} successfully!`);
      
    } catch (error) {
      toast.error('Failed to split PDF. Please try again.');
      console.error('Split error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (index: number) => {
    if (!splitResult) return;
    
    const url = URL.createObjectURL(splitResult.blobs[index]);
    const link = document.createElement('a');
    link.href = url;
    link.download = splitResult.filenames[index];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('File downloaded!');
  };

  const downloadAll = () => {
    if (!splitResult) return;
    
    splitResult.blobs.forEach((blob, index) => {
      setTimeout(() => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = splitResult.filenames[index];
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 100); // Small delay between downloads
    });
    
    toast.success('All files downloaded!');
  };

  const clearFile = () => {
    setFile(null);
    setPageCount(0);
    setSplitOption({ type: 'individual' });
    setSplitResult(null);
    toast.success('File cleared');
  };

  return (
    <div id="split" className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Split PDF Files
          </CardTitle>
          <p className="text-gray-600">
            Upload a PDF file and split it into separate documents
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full group-hover:scale-110 transition-transform duration-200">
                <Upload className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Drop PDF file here or click to browse
                </p>
                <p className="text-gray-500">
                  Single PDF file • Maximum 50MB
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
              >
                Choose File
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File Info */}
          {file && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">PDF</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {pageCount} pages • {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFile}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Split Options */}
          {file && pageCount > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Split Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="individual"
                    name="splitType"
                    checked={splitOption.type === 'individual'}
                    onChange={() => setSplitOption({ type: 'individual' })}
                    className="w-4 h-4 text-orange-600"
                  />
                  <Label htmlFor="individual" className="text-gray-700">
                    Split into individual pages ({pageCount} files)
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="range"
                      name="splitType"
                      checked={splitOption.type === 'range'}
                      onChange={() => setSplitOption({ type: 'range', ranges: '' })}
                      className="w-4 h-4 text-orange-600"
                    />
                    <Label htmlFor="range" className="text-gray-700">
                      Split by custom page ranges
                    </Label>
                  </div>
                  
                  {splitOption.type === 'range' && (
                    <div className="ml-7">
                      <Input
                        placeholder="e.g., 1-3, 5, 7-9"
                        value={splitOption.ranges || ''}
                        onChange={(e) => setSplitOption({ type: 'range', ranges: e.target.value })}
                        className="max-w-xs"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter page numbers and ranges separated by commas
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Split Results */}
          {splitResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">PDF split successfully!</p>
                    <p className="text-sm text-green-700">{splitResult.blobs.length} files ready for download</p>
                  </div>
                </div>
                <Button
                  onClick={downloadAll}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Download All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {splitResult.filenames.map((filename, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm text-gray-700 truncate flex-1 mr-2">{filename}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadFile(index)}
                      className="flex-shrink-0"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {file && !splitResult && (
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={splitPDF}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Splitting PDF...
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5 mr-2" />
                    Split PDF
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearFile}
                variant="outline"
                className="sm:w-auto border-gray-300 hover:bg-gray-50"
              >
                Clear File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFSplitter;
