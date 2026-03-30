import React, { useState, useRef, useCallback } from 'react';
import { Download, Loader2, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import FileUploadZone from './FileUploadZone';
import PdfToolOffcanvasShell from './PdfToolOffcanvasShell';

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

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 50MB');
      return;
    }

    setFile(selectedFile);
    setSplitResult(null);

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

  const handleZoneDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdf = acceptedFiles.find((f) => f.type === 'application/pdf');
      if (!pdf) return;
      const dt = new DataTransfer();
      dt.items.add(pdf);
      void handleFileSelect(dt.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInputReset = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const parseRanges = (rangesStr: string): number[][] => {
    const ranges: number[][] = [];
    const parts = rangesStr.split(',').map((s) => s.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((s) => parseInt(s.trim()));
        if (start && end && start <= end && start >= 1 && end <= pageCount) {
          const range = [];
          for (let i = start; i <= end; i++) {
            range.push(i - 1);
          }
          ranges.push(range);
        }
      } else {
        const pageNum = parseInt(part);
        if (pageNum >= 1 && pageNum <= pageCount) {
          ranges.push([pageNum - 1]);
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
        pagesToSplit = Array.from({ length: pageCount }, (_, i) => [i]);
      } else {
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

      for (let i = 0; i < pagesToSplit.length; i++) {
        const newPdf = await PDFDocument.create();
        const pageIndices = pagesToSplit[i];

        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });
        blobs.push(blob);

        if (splitOption.type === 'individual') {
          filenames.push(`${file.name.replace('.pdf', '')}_page_${pageIndices[0] + 1}.pdf`);
        } else {
          const rangeStr =
            pageIndices.length === 1
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
      }, index * 100);
    });

    toast.success('All files downloaded!');
  };

  const clearFile = () => {
    setFile(null);
    setPageCount(0);
    setSplitOption({ type: 'individual' });
    setSplitResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasFiles = file !== null;

  return (
    <PdfToolOffcanvasShell hasFiles={hasFiles} onClear={clearFile} sidebar={
      <>
        {file && (
          <div className="rounded-lg border border-gray-100 bg-white p-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-red-600 font-bold text-sm">PDF</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                <p className="text-sm text-gray-500">
                  {pageCount} pages • {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {file && pageCount > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Split Options</h3>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="individual"
                name="splitType"
                checked={splitOption.type === 'individual'}
                onChange={() => setSplitOption({ type: 'individual' })}
                className="w-4 h-4 text-orange-600"
              />
              <Label htmlFor="individual" className="text-gray-700 text-sm">
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
                <Label htmlFor="range" className="text-gray-700 text-sm">
                  Split by custom page ranges
                </Label>
              </div>

              {splitOption.type === 'range' && (
                <div className="pl-7">
                  <Input
                    placeholder="e.g., 1-3, 5, 7-9"
                    value={splitOption.ranges || ''}
                    onChange={(e) => setSplitOption({ type: 'range', ranges: e.target.value })}
                    className="max-w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter page numbers and ranges separated by commas
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {splitResult && (
          <div className="rounded-lg border border-green-200 bg-green-50/80 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <Scissors className="w-5 h-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-green-900 text-sm">PDF split successfully!</p>
                  <p className="text-xs text-green-700">{splitResult.blobs.length} files ready</p>
                </div>
              </div>
              <Button type="button" size="sm" className="bg-green-600 hover:bg-green-700 shrink-0" onClick={downloadAll}>
                Download All
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {splitResult.filenames.map((filename, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border gap-2">
                  <span className="text-xs text-gray-700 truncate flex-1" title={filename}>{filename}</span>
                  <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => downloadFile(index)}>
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {file && !splitResult && (
          <Button
            type="button"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            size="lg"
            onClick={() => void splitPDF()}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                Splitting PDF...
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5 mr-2 inline" />
                Split PDF
              </>
            )}
          </Button>
        )}
      </>
    }>
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <FileUploadZone
            onDrop={handleZoneDrop}
            onDragOver={handleDragOver}
            onFileSelect={handleFileInputReset}
            fileInputRef={fileInputRef}
            acceptedFormats=".pdf,application/pdf"
            multiple={false}
            title="Drop PDF file here or click to browse"
            description="Single PDF file • Maximum 50MB"
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

export default PDFSplitter;
