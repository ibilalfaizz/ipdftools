import React, { useState } from "react";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFFile {
  id: string;
  file: File;
}

interface FileListProps {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, onReorder }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Selected Files ({files.length})
        </h3>
        <p className="text-sm text-gray-500">
          Drag to reorder • Files will be merged in this order
        </p>
      </div>

      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${
              draggedIndex === index ? "opacity-50 scale-95" : ""
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">PDF</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-gray-900 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  #{index + 1}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(file.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
