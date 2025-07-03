
import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  acceptedFormats?: string;
  title?: string;
  description?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onDrop,
  onDragOver,
  onFileSelect,
  fileInputRef,
  acceptedFormats = ".pdf,application/pdf",
  title = "Drop PDF files here or click to browse",
  description = "Support for multiple files • Maximum 50MB per file"
}) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onDrop(files);
  };

  const handleFileInputChange = () => {
    if (fileInputRef.current?.files) {
      const files = Array.from(fileInputRef.current.files);
      onDrop(files);
    }
    onFileSelect();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={onDragOver}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-110 transition-transform duration-200">
          <Upload className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {title}
          </p>
          <p className="text-gray-500">
            {description}
          </p>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors"
        >
          Choose Files
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUploadZone;
