
import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from "@/components/ui/use-toast"

interface FileUploadZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onDrop, onDragOver, onFileSelect, fileInputRef }) => {
  const {getRootProps, getInputProps, isDragActive} = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 transition-colors duration-300 ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
      }`}
      onDragOver={onDragOver}
    >
      <input {...getInputProps()} type="file" multiple onChange={onFileSelect} ref={fileInputRef} className="hidden" accept="image/jpeg, image/png"/>
      <Download className="h-6 w-6 text-gray-400 mb-2" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        {isDragActive ? 'Drop the images here...' : 'Drag and drop images here, or click to select files'}
      </p>
    </div>
  );
};

const JPGToPDFConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast()

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    toast({
      title: t('common.files_added'),
      description: `${acceptedFiles.length} ${t('common.files_added').toLowerCase()}`,
    })
  }, [t, toast]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      handleDrop(selectedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: t('common.no_files_selected'),
        description: t('common.no_files_selected').toLowerCase(),
      })
      return;
    }

    setConversionLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await readFileAsDataURL(file);

        const img = new Image();
        img.src = imageUrl;

        await new Promise((resolve, reject) => {
          img.onload = () => {
            const width = img.width;
            const height = img.height;

            if (width > height) {
              pdf.addPage([width, height]);
            } else {
              pdf.addPage([height, width]);
            }

            pdf.addImage(imageUrl, 'JPEG', 0, 0, width, height);
            resolve(null);
          };

          img.onerror = (error) => {
            console.error('Error loading image:', error);
            reject(error);
          };
        });

        if (i < files.length - 1) {
          pdf.addPage();
        }
      }

      setConversionLoading(false);
      downloadPdf(pdf);
      toast({
        title: t('common.conversion_complete'),
        description: t('common.conversion_complete').toLowerCase(),
      })
    } catch (error) {
      console.error('Error converting to PDF:', error);
      setConversionLoading(false);
      toast({
        variant: "destructive",
        title: t('common.conversion_failed'),
        description: t('common.conversion_failed').toLowerCase(),
      })
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as Data URL'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  };

  const downloadPdf = (pdf: any) => {
    setDownloading(true);
    pdf.save('converted.pdf');
    setDownloading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4">
          <Download className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('jpg_to_pdf.title')}</h1>
        <p className="text-xl text-gray-600">{t('jpg_to_pdf.description')}</p>
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('common.files_added')}</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">{file.name}</span>
                <Button variant="outline" size="sm" onClick={() => handleRemoveFile(index)}>
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center">
        <Button
          className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 font-semibold py-3 px-6 rounded-md transition-colors duration-300"
          onClick={convertToPdf}
          disabled={conversionLoading}
        >
          {conversionLoading ? t('common.converting') : t('common.convert')}
        </Button>
      </div>

      {downloading && (
        <div className="text-center mt-4">
          <p className="text-gray-600">{t('common.downloading')}</p>
        </div>
      )}
    </div>
  );
};

export default JPGToPDFConverter;
