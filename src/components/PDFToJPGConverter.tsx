
import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUploadZone from './FileUploadZone';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFToJPGConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertPDFToJPG = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
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
      
      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob || new Blob());
        }, 'image/jpeg', 0.9);
      });
    } catch (error) {
      console.error('Error converting PDF to JPG:', error);
      throw error;
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

  const convertToJPG = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select PDF files to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const converted = [];
      
      for (const file of files) {
        const blob = await convertPDFToJPG(file);
        const url = URL.createObjectURL(blob);
        
        converted.push({
          name: `${file.name.split('.')[0]}.jpg`,
          url: url
        });
      }

      setConvertedFiles(converted);
      
      toast({
        title: "Conversion Complete",
        description: `${files.length} PDF file(s) converted to JPG successfully.`,
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
          <Image className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">PDF to JPG Converter</h1>
        <p className="text-xl text-gray-600">
          Convert your PDF documents to high-quality JPG images
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Select PDF Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              acceptedTypes="application/pdf"
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
                onClick={convertToJPG}
                disabled={isConverting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
                    Convert to JPG
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
                      <Image className="h-5 w-5 text-purple-600" />
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

export default PDFToJPGConverter;
