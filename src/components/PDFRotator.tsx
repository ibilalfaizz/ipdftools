import React, { useState, useRef, useCallback } from 'react';
import { RotateCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadZone } from './FileUploadZone';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from '@tanstack/react-query';
import { rotatePdf } from '../lib/api';
import { saveAs } from 'file-saver';

const PDFRotator = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [rotationAngle, setRotationAngle] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: rotate, isPending: isRotating } = useMutation({
    mutationFn: rotatePdf,
    onSuccess: (data, variables) => {
      if (data) {
        saveAs(data, `rotated_${variables[0].name}`);
        toast({
          title: t('rotate.success', { angle: rotationAngle }),
          description: "Your file has been successfully rotated.",
        })
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t('rotate.failed'),
        description: "Something went wrong. Please try again.",
      })
    }
  })

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleFileSelect = () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const selectedFiles = Array.from(fileInputRef.current.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
  };

  const handleRotate = () => {
    if (!rotationAngle) {
      toast({
        variant: "destructive",
        title: t('rotate.no_angle'),
        description: "Please select a rotation angle.",
      })
      return;
    }

    files.forEach(file => {
      rotate([file, rotationAngle]);
    })
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mb-4">
          <RotateCw className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('rotate.title')}</h1>
        <p className="text-xl text-gray-600">{t('rotate.description')}</p>
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

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">{t('common.files_added')}:</h3>
        {files.length === 0 ? (
          <p className="text-gray-500">{t('common.no_files_selected')}</p>
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">{file.name}</span>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-100" onClick={() => handleRemoveFile(file.name)}>
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">{t('rotate.select_angle')}:</h3>
        <Select onValueChange={setRotationAngle}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('rotate.angle_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90">{t('rotate.90_clockwise')}</SelectItem>
            <SelectItem value="180">{t('rotate.180')}</SelectItem>
            <SelectItem value="270">{t('rotate.270_clockwise')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-md shadow-md transition-colors duration-300"
        onClick={handleRotate}
        disabled={files.length === 0 || isRotating}
      >
        {isRotating ? t('rotate.rotating') : t('rotate.convert_button', { angle: rotationAngle })}
      </Button>
    </div>
  );
};

export default PDFRotator;
