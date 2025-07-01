
import React, { useState, useRef } from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import FileUploadZone from './FileUploadZone';
import * as pdfjs from 'pdfjs-dist';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFToTextConverter = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedTexts, setConvertedTexts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      setFiles((prev) => [...prev, ...Array.from(fileInputRef.current.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setConvertedTexts([]);

    try {
      const texts: string[] = [];
      for (const file of files) {
        const text = await extractTextFromPDF(file);
        texts.push(text);
      }
      setConvertedTexts(texts);
    } catch (error) {
      console.error('Text extraction failed', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (text: string, index: number) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted_text_${index + 1}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h2 className="text-lg font-semibold mb-2">{t('common.files_added')}:</h2>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <Button onClick={handleConvert} disabled={files.length === 0 || isConverting}>
          {isConverting ? t('common.converting') : t('pdf_to_text.convert_button')}
        </Button>
      </div>

      {convertedTexts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">{t('common.conversion_complete')}:</h2>
          <div className="space-y-4">
            {convertedTexts.map((text, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{`extracted_text_${index + 1}.txt`}</h3>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(text, index)}>
                      <Download className="h-4 w-4 mr-2" />
                      {t('common.download')}
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{text.substring(0, 500)}...</pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFToTextConverter;
