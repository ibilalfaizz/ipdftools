import React, { useState, useRef, useCallback } from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import FileUploadZone from './FileUploadZone';
import { useLanguage } from '../contexts/LanguageContext';

const PDFToTextConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [convertedText, setConvertedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    toast({
      title: t('common.files_added'),
      description: `Added ${acceptedFiles.length} files to the queue.`,
    });
  }, [setFiles, toast, t]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleFileSelect = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const selectedFiles = Array.from(fileInputRef.current.files);
      handleDrop(selectedFiles);
    }
  };

  const handleRemoveFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
  };

  const convertPDFToText = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: t('common.no_files_selected'),
        description: "Please select PDF files to convert.",
      });
      return;
    }

    setConverting(true);
    setConvertedText('');

    try {
      const textPromises = files.map(async (file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = async function () {
            try {
              const pdfData = new Uint8Array(reader.result as ArrayBuffer);
              // Dynamically import pdfjsLib
              const pdfjsLib = await import('pdfjs-dist');
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

              const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
              let fullText = "";

              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(" ");
                fullText += pageText + "\n";
              }
              resolve(fullText);
            } catch (error) {
              console.error("Error extracting text from PDF:", error);
              reject(error);
            }
          };

          reader.onerror = (error) => {
            console.error("Error reading file:", error);
            reject(error);
          };

          reader.readAsArrayBuffer(file);
        });
      });

      const texts = await Promise.all(textPromises);
      setConvertedText(texts.join('\n\n'));

      toast({
        title: t('common.conversion_complete'),
        description: t('pdf_to_text.success'),
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        variant: "destructive",
        title: t('common.conversion_failed'),
        description: "An error occurred during conversion.",
      });
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedText) {
      toast({
        variant: "destructive",
        title: "No Text to Download",
        description: "Please convert PDF files to text first.",
      });
      return;
    }

    const blob = new Blob([convertedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('pdf_to_text.title')}</h1>
        <p className="text-xl text-gray-600">{t('pdf_to_text.description')}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <FileUploadZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">{t('common.files_added')}:</h2>
          <ul>
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file.name)}>
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <Button
          size="lg"
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-md shadow-md transition-colors duration-300"
          onClick={convertPDFToText}
          disabled={converting}
        >
          {converting ? t('common.converting') : t('common.convert_button')}
        </Button>
      </div>

      {convertedText && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Converted Text:</h2>
          <div className="whitespace-pre-line break-words bg-gray-100 p-4 rounded-md text-gray-800">
            {convertedText}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="secondary"
              size="lg"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md transition-colors duration-300"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('common.download')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFToTextConverter;
