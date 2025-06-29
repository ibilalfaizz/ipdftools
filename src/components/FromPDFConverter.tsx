
import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUploadZone from './FileUploadZone';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

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
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // This is a simplified text extraction
      // In a real application, you'd use a proper PDF text extraction library
      let extractedText = `Extracted content from: ${file.name}\n\n`;
      extractedText += `This PDF contains ${pages.length} page(s).\n\n`;
      extractedText += `Note: This is a placeholder text extraction. In a production environment, `;
      extractedText += `you would use a proper PDF parsing library like PDF.js or pdf2pic to extract `;
      extractedText += `actual text content, images, and other elements from the PDF.\n\n`;
      extractedText += `File size: ${(file.size / 1024).toFixed(2)} KB\n`;
      extractedText += `Created: ${new Date().toISOString()}`;
      
      return extractedText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return `Error extracting content from ${file.name}. The PDF might be corrupted or password-protected.`;
    }
  };

  const convertPDFToFormat = async (file: File, format: string) => {
    const formatLower = format.toLowerCase();
    
    if (formatLower === 'txt') {
      const text = await extractTextFromPDF(file);
      const blob = new Blob([text], { type: 'text/plain' });
      return { blob, extension: 'txt' };
    } else if (formatLower === 'jpg' || formatLower === 'png') {
      // For image conversion, create a placeholder
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
        ctx.fillText(`Converted from: ${file.name}`, canvas.width / 2, 100);
        ctx.fillText(`To: ${format.toUpperCase()}`, canvas.width / 2, 150);
        ctx.fillText('This is a placeholder conversion', canvas.width / 2, 250);
        ctx.fillText('In production, use proper PDF-to-image', canvas.width / 2, 300);
        ctx.fillText('conversion libraries like pdf2pic', canvas.width / 2, 350);
      }
      
      return new Promise<{ blob: Blob; extension: string }>((resolve) => {
        canvas.toBlob((blob) => {
          resolve({ 
            blob: blob || new Blob(), 
            extension: formatLower 
          });
        }, `image/${formatLower}`);
      });
    } else {
      // For other formats, create a text-based placeholder
      const text = await extractTextFromPDF(file);
      const content = `Converted from PDF: ${file.name}\n\nTarget format: ${format.toUpperCase()}\n\n${text}`;
      const blob = new Blob([content], { type: 'application/octet-stream' });
      return { blob, extension: formatLower };
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (droppedFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please select PDF files only.",
        variant: "destructive",
      });
      return;
    }
    handleFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (fileList) {
      const selectedFiles = Array.from(fileList).filter(file => file.type === 'application/pdf');
      if (selectedFiles.length === 0) {
        toast({
          title: "Invalid Files",
          description: "Please select PDF files only.",
          variant: "destructive",
        });
        return;
      }
      handleFiles(selectedFiles);
    }
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
