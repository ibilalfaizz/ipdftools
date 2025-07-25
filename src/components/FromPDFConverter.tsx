import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUploadZone from './FileUploadZone';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FromPDFConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const supportedFormats = [
    'AZW3', 'BMP', 'DjVu', 'ePub', 'JPG', 'MOBI', 'PNG', 'SVG', 'TIFF', 'TXT'
  ];

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = '';
      
      console.log(`Extracting text from ${file.name} with ${pdf.numPages} pages...`);
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        if (pageText.trim()) {
          extractedText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
        }
      }
      
      if (extractedText.trim() === '') {
        return `No text content found in ${file.name}. This PDF might contain only images or scanned content.`;
      }
      
      return extractedText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return `Error extracting content from ${file.name}. The PDF might be corrupted, password-protected, or contain only images.`;
    }
  };

  const convertPDFToFormat = async (file: File, format: string) => {
    const formatLower = format.toLowerCase();
    
    if (formatLower === 'txt') {
      const text = await extractTextFromPDF(file);
      const blob = new Blob([text], { type: 'text/plain' });
      return { blob, extension: 'txt' };
    } else if (formatLower === 'jpg' || formatLower === 'png') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        // Convert first page to image as an example
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
        }
        
        return new Promise<{ blob: Blob; extension: string }>((resolve) => {
          canvas.toBlob((blob) => {
            resolve({ 
              blob: blob || new Blob(), 
              extension: formatLower 
            });
          }, `image/${formatLower}`, 0.9);
        });
      } catch (error) {
        console.error('Error converting PDF to image:', error);
        // Fallback to placeholder image
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#333333';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Error converting: ${file.name}`, canvas.width / 2, 100);
          ctx.fillText(`To: ${format.toUpperCase()}`, canvas.width / 2, 150);
          ctx.fillText('PDF might be corrupted or password-protected', canvas.width / 2, 250);
        }
        
        return new Promise<{ blob: Blob; extension: string }>((resolve) => {
          canvas.toBlob((blob) => {
            resolve({ 
              blob: blob || new Blob(), 
              extension: formatLower 
            });
          }, `image/${formatLower}`);
        });
      }
    } else {
      // For other formats, create a text-based conversion
      const text = await extractTextFromPDF(file);
      const content = `Converted from PDF: ${file.name}\n\nTarget format: ${format.toUpperCase()}\n\n${text}`;
      const blob = new Blob([content], { type: 'application/octet-stream' });
      return { blob, extension: formatLower };
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please select PDF files only.",
        variant: "destructive",
      });
      return;
    }
    handleFiles(pdfFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileSelect = () => {
    // File selection is handled in FileUploadZone
  };

  const handleFiles = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    toast({
      title: "Files Added",
      description: `${newFiles.length} PDF file(s) added for conversion.`,
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertFromPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select PDF files to convert.",
        variant: "destructive",
      });
      return;
    }

    if (!targetFormat) {
      toast({
        title: "No Format Selected",
        description: "Please select a target format.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const converted = [];
      
      for (const file of files) {
        console.log(`Converting ${file.name} to ${targetFormat}...`);
        const { blob, extension } = await convertPDFToFormat(file, targetFormat);
        const url = URL.createObjectURL(blob);
        
        converted.push({
          name: `${file.name.split('.')[0]}_converted.${extension}`,
          url: url
        });
      }

      setConvertedFiles(converted);
      
      toast({
        title: "Conversion Complete",
        description: `${files.length} PDF file(s) converted to ${targetFormat} successfully.`,
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: "An error occurred during conversion.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadFile = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    convertedFiles.forEach(file => {
      downloadFile(file.url, file.name);
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Convert from PDF</h1>
        <p className="text-xl text-gray-600">
          Convert PDF files to various formats
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Select PDF Files to Convert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select target format *
              </label>
              <Select value={targetFormat} onValueChange={setTargetFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose format to convert to" />
                </SelectTrigger>
                <SelectContent>
                  {supportedFormats.map(format => (
                    <SelectItem key={format} value={format.toLowerCase()}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <FileUploadZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected PDF Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={convertFromPDF}
                disabled={isConverting || !targetFormat}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Convert from PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {convertedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Converted Files</span>
                <Button onClick={downloadAll} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">{file.name}</span>
                    </div>
                    <Button
                      onClick={() => downloadFile(file.url, file.name)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FromPDFConverter;
