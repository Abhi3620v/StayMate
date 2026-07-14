import React from 'react';
import { X, FileText, Image } from 'lucide-react';

export const AttachmentPreview = ({
  file,
  onClear,
}) => {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const formattedSize = `${Math.round(file.size / 1024)} KB`;

  return (
    <div className="p-3 bg-secondary-50 dark:bg-secondary-950 border-t border-secondary-200 dark:border-secondary-800 flex items-center justify-between gap-3 text-xs font-semibold select-none animate-fade-in shrink-0">
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="h-10 w-10 bg-secondary-200 dark:bg-secondary-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-secondary-200/50">
          {isImage ? (
            <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover h-full w-full" />
          ) : (
            <FileText className="h-5 w-5 text-primary-500" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-extrabold truncate text-secondary-900 dark:text-white text-xs">{file.name}</p>
          <p className="text-[10px] text-secondary-400 mt-0.5">{formattedSize}</p>
        </div>
      </div>

      <button
        onClick={onClear}
        className="p-1.5 rounded-full bg-secondary-200 dark:bg-secondary-800 text-secondary-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-all duration-300 focus:outline-none"
        aria-label="Remove attachment"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AttachmentPreview;
