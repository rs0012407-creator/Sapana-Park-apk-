import React, { useState, useRef } from 'react';
import { Folder, FileText, X, Upload, CheckCircle2, AlertCircle, FileCode, HardDrive } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile?: (files: { name: string; size: string; type: string; dataUrl: string }[]) => void;
  allowedTypes?: string;
  maxSizeMB?: number;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  allowedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp',
  maxSizeMB = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{
    file: File;
    id: string;
    formattedSize: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    dataUrl?: string;
  }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const files: File[] = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const newFiles = [];

    for (const f of files) {
      if (f.size > maxSizeBytes) {
        setErrorMsg(`File "${f.name}" exceeds maximum allowed limit of ${maxSizeMB}MB.`);
        continue;
      }

      newFiles.push({
        file: f,
        id: `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        formattedSize: formatBytes(f.size),
        progress: 0,
        status: 'pending' as const,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleStartUpload = () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    // Simulate progress bar for each file
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setSelectedFiles((prev) =>
          prev.map((f) => ({ ...f, progress: 100, status: 'completed' }))
        );
        setIsUploading(false);

        // Notify parent
        const payload = selectedFiles.map((f) => ({
          name: f.file.name,
          size: f.formattedSize,
          type: f.file.type || 'Document',
          dataUrl: URL.createObjectURL(f.file),
        }));

        if (onUploadFile) {
          onUploadFile(payload);
        }

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setSelectedFiles((prev) =>
          prev.map((f) => ({ ...f, progress: currentProgress, status: 'uploading' }))
        );
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-600/20 text-teal-400 border border-teal-500/40 rounded-xl">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">Select Files & Documents / फाइल अपलोड</h3>
              <p className="text-[11px] text-slate-400">PDF, Word, Excel, and image documents up to {maxSizeMB}MB</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="my-3 flex-1 overflow-y-auto space-y-3 pr-1">
          {errorMsg && (
            <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Trigger File Picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-teal-500 bg-slate-950/60 hover:bg-teal-950/20 p-5 rounded-2xl text-center cursor-pointer transition group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes}
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 group-hover:bg-teal-600 group-hover:text-white text-teal-400 flex items-center justify-center mx-auto mb-2 transition">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-teal-300 transition">
              Click to Browse Files / फाइलें चुनें
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports PDF, DOCX, XLSX, JPG, PNG • Max {maxSizeMB}MB per file
            </p>
          </div>

          {/* Selected File List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-bold block">
                Files Selected ({selectedFiles.length})
              </span>

              <div className="space-y-2">
                {selectedFiles.map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{item.file.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">({item.formattedSize})</span>
                      </div>

                      {!isUploading && item.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Progress bar */}
                    {item.progress > 0 && (
                      <div className="space-y-1">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-500 h-full transition-all duration-200"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>{item.status === 'completed' ? 'Uploaded' : 'Uploading...'}</span>
                          <span>{item.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 shrink-0 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStartUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isUploading ? 'Uploading Files...' : `Process & Upload (${selectedFiles.length})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
