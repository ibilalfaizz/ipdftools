import React, { useState, useRef } from 'react';
import { Image, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from "@/components/ui/use-toast";
import FileUploadZone from './FileUploadZone';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker with a more reliable approach
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface ConvertedFile {
  name: string;
  url: string;
  pageNumber: number;
}

const PDFToJPGConverter = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      toast({
        variant: "destructive",
        title: "Invalid Files",
        description: "Please select PDF files only.",
      });
    }
    if (pdfFiles.length > 0) {
      setFiles((prev) => [...prev, ...pdfFiles]);
      toast({
        title: t('common.files_added'),
        description: `${pdfFiles.length} PDF file(s) added`,
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = () => {
    // File selection is now handled by FileUploadZone
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const convertPDFToJPG = async (file: File): Promise<ConvertedFile[]> => {
    try {
      console.log('Starting PDF conversion for file:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded as array buffer, size:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0 // Reduce console noise
      }).promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      const convertedPages: ConvertedFile[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${pdf.numPages}`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        console.log(`Page ${pageNum} rendered to canvas`);
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
        });

        const url = URL.createObjectURL(blob);
        const fileName = `${file.name.replace('.pdf', '')}_page_${pageNum}.jpg`;
        
        convertedPages.push({
          name: fileName,
          url: url,
          pageNumber: pageNum
        });
        console.log(`Page ${pageNum} converted successfully`);
      }

      console.log('All pages converted successfully');
      return convertedPages;
    } catch (error) {
      console.error('Error in convertPDFToJPG:', error);
      throw error;
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: t('common.no_files_selected'),
        description: "Please select PDF files to convert.",
      });
      return;
    }

    setIsConverting(true);
    setConvertedFiles([]);

    try {
      console.log('Starting conversion process for', files.length, 'files');
      const allConvertedFiles: ConvertedFile[] = [];
      
      for (const file of files) {
        console.log('Converting file:', file.name);
        const convertedPages = await convertPDFToJPG(file);
        allConvertedFiles.push(...convertedPages);
      }

      setConvertedFiles(allConvertedFiles);
      toast({
        title: t('common.conversion_complete'),
        description: `${allConvertedFiles.length} JPG image(s) created`,
      });
      console.log('Conversion completed successfully');
    } catch (error) {
      console.error('Conversion failed:', error);
      toast({
        variant: "destructive",
        title: t('common.conversion_failed'),
        description: "Failed to convert PDF to JPG. Please try again.",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    convertedFiles.forEach((file) => {
      handleDownload(file.url, file.name);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <Image className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('pdf_to_jpg.title')}</h1>
        <p className="text-xl text-gray-600">{t('pdf_to_jpg.description')}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <FileUploadZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
            acceptedFormats=".pdf,application/pdf"
            title="Drop PDF files here or click to browse"
            description="Support for multiple PDF files • Each page will be converted to JPG"
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{t('common.files_added')}:</h2>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between items-center py-2">
                <span className="text-gray-600">{file.name}</span>
                <Button variant="outline" size="sm" onClick={() => handleRemoveFile(index)}>
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <Button 
          onClick={handleConvert} 
          disabled={files.length === 0 || isConverting}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          {isConverting ? t('common.converting') : t('pdf_to_jpg.convert_button')}
        </Button>
      </div>

      {convertedFiles.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t('common.conversion_complete')}:</h2>
            <Button 
              onClick={handleDownloadAll}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('common.download_all')}
            </Button>
          </div>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {convertedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center py-2">
                <span className="text-blue-600">{file.name}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(file.url, file.name)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.download')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PDFToJPGConverter;
