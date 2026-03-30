
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
  className?: string;
  /** When false, the file input does not allow multi-select (parent still receives an array). */
  multiple?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onDrop,
  onDragOver,
  onFileSelect,
  fileInputRef,
  acceptedFormats = ".pdf,application/pdf",
  title = "Drop PDF files here or click to browse",
  description = "Support for multiple files • Maximum 50MB per file",
  className = "",
  multiple = true,
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
      className={`border-2 border-dashed border-[#d6ffd2]/25 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer group ${className}`}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 tool-icon-bubble group-hover:scale-110 transition-transform duration-200">
          <Upload className="w-8 h-8" />
        </div>
        
        <div>
          <p className="text-xl font-semibold text-foreground mb-2">
            {title}
          </p>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Choose Files
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedFormats}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUploadZone;
