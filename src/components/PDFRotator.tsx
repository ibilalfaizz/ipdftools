
import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUploadZone from './FileUploadZone';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, degrees } from 'pdf-lib';

const PDFRotator = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [rotatedFiles, setRotatedFiles] = useState<{ name: string; url: string }[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationAngle, setRotationAngle] = useState<string>('90');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const rotatePDF = async (file: File, angle: number): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        page.setRotation(degrees(angle));
      });

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error rotating PDF:', error);
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
      description: `${newFiles.length} PDF file(s) added for rotation.`,
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const rotatePDFs = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select PDF files to rotate.",
        variant: "destructive",
      });
      return;
    }

    if (!rotationAngle) {
      toast({
        title: "No Rotation Selected",
        description: "Please select a rotation angle.",
        variant: "destructive",
      });
      return;
    }

    setIsRotating(true);
    
    try {
      const rotated = [];
      const angle = parseInt(rotationAngle);
      
      for (const file of files) {
        const rotatedBytes = await rotatePDF(file, angle);
        const blob = new Blob([rotatedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        rotated.push({
          name: `${file.name.split('.')[0]}_rotated_${angle}deg.pdf`,
          url: url
        });
      }

      setRotatedFiles(rotated);
      
      toast({
        title: "Rotation Complete",
        description: `${files.length} PDF file(s) rotated by ${angle}° successfully.`,
      });
    } catch (error) {
      console.error('Rotation error:', error);
      toast({
        title: "Rotation Failed",
        description: "An error occurred during rotation.",
        variant: "destructive",
      });
    } finally {
      setIsRotating(false);
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
    rotatedFiles.forEach(file => {
      downloadFile(file.url, file.name);
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">PDF Rotator</h1>
        <p className="text-xl text-gray-600">
          Rotate your PDF pages to the correct orientation
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Select PDF Files to Rotate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select rotation angle *
              </label>
              <Select value={rotationAngle} onValueChange={setRotationAngle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose rotation angle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90° Clockwise</SelectItem>
                  <SelectItem value="180">180° (Upside Down)</SelectItem>
                  <SelectItem value="270">270° Clockwise (90° Counter-clockwise)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
                onClick={rotatePDFs}
                disabled={isRotating || !rotationAngle}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
              >
                {isRotating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Rotate PDFs by {rotationAngle}°
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {rotatedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Rotated Files</span>
                <Button onClick={downloadAll} className="bg-indigo-600 hover:bg-indigo-700">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rotatedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">{file.name}</span>
                    </div>
                    <Button
                      onClick={() => downloadFile(file.url, file.name)}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
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

export default PDFRotator;
