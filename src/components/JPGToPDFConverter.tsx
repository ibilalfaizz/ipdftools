
import React, { useState, useRef } from 'react';
import { Upload, Download, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUploadZone from './FileUploadZone';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

const JPGToPDFConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertImageToPDF = async (file: File): Promise<Uint8Array> => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      const imageBytes = await file.arrayBuffer();
      let image;

      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error('Unsupported image format');
      }

      const { width, height } = image.scale(1);
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      const scale = Math.min(pageWidth / width, pageHeight / height);
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;

      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting image to PDF:', error);
      throw error;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
    );
    if (droppedFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please select JPG or PNG image files only.",
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
      const selectedFiles = Array.from(fileList).filter(file => 
        file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
      );
      if (selectedFiles.length === 0) {
        toast({
          title: "Invalid Files",
          description: "Please select JPG or PNG image files only.",
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
      description: `${newFiles.length} image file(s) added for conversion.`,
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select image files to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const converted = [];
      
      for (const file of files) {
        const pdfBytes = await convertImageToPDF(file);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        converted.push({
          name: `${file.name.split('.')[0]}.pdf`,
          url: url
        });
      }

      setConvertedFiles(converted);
      
      toast({
        title: "Conversion Complete",
        description: `${files.length} image file(s) converted to PDF successfully.`,
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
        <div className="inline-flex p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4">
          <Image className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">JPG to PDF Converter</h1>
        <p className="text-xl text-gray-600">
          Convert your JPG and PNG images to PDF documents
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Select Image Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              acceptedTypes="image/jpeg,image/jpg,image/png"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Image Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Image className="h-5 w-5 text-orange-500" />
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
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
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
                <Button onClick={downloadAll} className="bg-orange-600 hover:bg-orange-700">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Image className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-900">{file.name}</span>
                    </div>
                    <Button
                      onClick={() => downloadFile(file.url, file.name)}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
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

export default JPGToPDFConverter;
