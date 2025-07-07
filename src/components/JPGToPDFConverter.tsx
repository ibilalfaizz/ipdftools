
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
  const {getRootProps, getInputProps, isDragActive} = useDropzone({ 
    onDrop,
    noClick: true
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 transition-colors duration-300 cursor-pointer ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
      }`}
      onDragOver={onDragOver}
      onClick={handleClick}
    >
      <input 
        {...getInputProps()} 
        type="file" 
        multiple 
        onChange={onFileSelect} 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/jpeg, image/png"
      />
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
  const [convertedPdf, setConvertedPdf] = useState<any>(null);
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

      // Remove the default first page
      pdf.deletePage(1);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await readFileAsDataURL(file);

        const img = new Image();
        img.src = imageUrl;

        await new Promise((resolve, reject) => {
          img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const aspectRatio = imgWidth / imgHeight;

            // Standard A4 dimensions in points
            const a4Width = 595.28;
            const a4Height = 841.89;

            let pageWidth, pageHeight;
            let imgDisplayWidth, imgDisplayHeight;

            // Determine if image is landscape or portrait
            if (aspectRatio > 1) {
              // Landscape image - use A4 landscape
              pageWidth = a4Height;
              pageHeight = a4Width;
            } else {
              // Portrait image - use A4 portrait
              pageWidth = a4Width;
              pageHeight = a4Height;
            }

            // Calculate scaled dimensions to fit the image within the page
            const pageAspectRatio = pageWidth / pageHeight;
            
            if (aspectRatio > pageAspectRatio) {
              // Image is wider relative to page - fit to width
              imgDisplayWidth = pageWidth;
              imgDisplayHeight = pageWidth / aspectRatio;
            } else {
              // Image is taller relative to page - fit to height
              imgDisplayHeight = pageHeight;
              imgDisplayWidth = pageHeight * aspectRatio;
            }

            // Center the image on the page
            const x = (pageWidth - imgDisplayWidth) / 2;
            const y = (pageHeight - imgDisplayHeight) / 2;

            pdf.addPage([pageWidth, pageHeight]);
            pdf.addImage(imageUrl, 'JPEG', x, y, imgDisplayWidth, imgDisplayHeight);
            resolve(null);
          };

          img.onerror = (error) => {
            console.error('Error loading image:', error);
            reject(error);
          };
        });
      }

      setConversionLoading(false);
      setConvertedPdf(pdf);
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

  const handleDownload = () => {
    if (convertedPdf) {
      convertedPdf.save('converted.pdf');
    }
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

      <div className="text-center space-y-4">
        <Button
          className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 font-semibold py-3 px-6 rounded-md transition-colors duration-300"
          onClick={convertToPdf}
          disabled={conversionLoading}
        >
          {conversionLoading ? t('common.converting') : t('common.convert')}
        </Button>

        {convertedPdf && (
          <Button
            className="bg-green-600 text-white hover:bg-green-700 font-semibold py-3 px-6 rounded-md transition-colors duration-300 ml-4"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('common.download')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default JPGToPDFConverter;
