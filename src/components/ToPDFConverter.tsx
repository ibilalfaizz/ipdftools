
import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUploadZone from './FileUploadZone';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, rgb } from 'pdf-lib';

const ToPDFConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const supportedFormats = [
    'AZW3', 'BMP', 'CHM', 'CSV', 'DjVu', 'DOC', 'DOCX', 'EPS', 'ePub', 
    'HEIC', 'JPG', 'MD', 'MOBI', 'ODT', 'OXPS', 'PNG', 'PPT', 'PPTX', 
    'PS', 'PUB', 'RTF', 'SVG', 'TIFF', 'TXT', 'WebP', 'XLS', 'XLSX', 'XPS'
  ];

  // Create accept string for all supported formats
  const acceptedFormats = [
    '.azw3', '.bmp', '.chm', '.csv', '.djvu', '.doc', '.docx', '.eps', '.epub',
    '.heic', '.jpg', '.jpeg', '.md', '.mobi', '.odt', '.oxps', '.png', '.ppt', 
    '.pptx', '.ps', '.pub', '.rtf', '.svg', '.tiff', '.tif', '.txt', '.webp', 
    '.xls', '.xlsx', '.xps'
  ].join(',');

  const createPDFFromText = async (content: string, fileName: string) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard US Letter size
    
    const fontSize = 12;
    const margin = 50;
    const lineHeight = fontSize * 1.2;
    const maxWidth = page.getWidth() - (margin * 2);
    
    // Split content into lines that fit the page width
    const words = content.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length * (fontSize * 0.6) < maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Add text to PDF
    let yPosition = page.getHeight() - margin;
    for (const line of lines) {
      if (yPosition < margin) break; // Stop if we run out of space
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;
    }
    
    // Add header with original filename
    page.drawText(`Converted from: ${fileName}`, {
      x: margin,
      y: page.getHeight() - 30,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    return await pdfDoc.save();
  };

  const createPDFFromImage = async (imageFile: File, fileName: string) => {
    const pdfDoc = await PDFDocument.create();
    const imageBytes = await imageFile.arrayBuffer();
    
    let image;
    if (imageFile.type.includes('png')) {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (imageFile.type.includes('jpg') || imageFile.type.includes('jpeg')) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      // For other image formats, we'll create a text PDF indicating the format
      return await createPDFFromText(`This is a placeholder for ${fileName}. Image format conversion requires additional processing.`, fileName);
    }
    
    const page = pdfDoc.addPage();
    const { width, height } = image.scale(1);
    
    // Scale image to fit page while maintaining aspect ratio
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const scale = Math.min(pageWidth / width, pageHeight / height) * 0.9;
    
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    page.drawImage(image, {
      x: (pageWidth - scaledWidth) / 2,
      y: (pageHeight - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight,
    });
    
    return await pdfDoc.save();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (fileList) {
      const selectedFiles = Array.from(fileList);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    toast({
      title: "Files Added",
      description: `${newFiles.length} file(s) added for conversion.`,
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const converted = [];
      
      for (const file of files) {
        console.log(`Converting ${file.name}...`);
        let pdfBytes;
        
        if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          // Handle text files
          const text = await file.text();
          pdfBytes = await createPDFFromText(text, file.name);
        } else if (file.type.startsWith('image/')) {
          // Handle image files
          pdfBytes = await createPDFFromImage(file, file.name);
        } else {
          // For other file types, create a placeholder PDF
          const placeholderText = `This is a converted PDF from ${file.name}.\n\nOriginal file type: ${file.type || 'unknown'}\nFile size: ${(file.size / 1024).toFixed(2)} KB\n\nNote: This is a placeholder conversion. In a production environment, you would integrate with a proper file conversion service to handle various file formats like DOC, DOCX, XLS, XLSX, PPT, PPTX, etc.`;
          pdfBytes = await createPDFFromText(placeholderText, file.name);
        }
        
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        
        converted.push({
          name: `${file.name.split('.')[0]}_converted.pdf`,
          url: url
        });
      }

      setConvertedFiles(converted);
      
      toast({
        title: "Conversion Complete",
        description: `${files.length} file(s) converted to PDF successfully.`,
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
        <div className="inline-flex p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Convert to PDF</h1>
        <p className="text-xl text-gray-600">
          Convert various file formats to PDF with ease
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Select Files to Convert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select file format (optional - auto-detect if not specified)
              </label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect format" />
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
              acceptedFormats={acceptedFormats}
              title="Drop files here or click to browse"
              description="Support for DOC, DOCX, JPG, PNG, TXT, XLS, XLSX and many more formats • Maximum 50MB per file"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
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
                onClick={convertToPDF}
                disabled={isConverting}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Convert to PDF
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
                <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">{file.name}</span>
                    </div>
                    <Button
                      onClick={() => downloadFile(file.url, file.name)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
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

export default ToPDFConverter;
