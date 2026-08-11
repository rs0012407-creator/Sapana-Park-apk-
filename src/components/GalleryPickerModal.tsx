import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X, Upload, Trash2, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: string;
  compressedSize?: string;
  isCompressed?: boolean;
}

interface GalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadImages?: (images: { id: string; dataUrl: string; name: string }[]) => void;
  maxFiles?: number;
}

export const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({
  isOpen,
  onClose,
  onUploadImages,
  maxFiles = 6,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Canvas image compression helper
  const compressImage = (file: File, maxWidth = 1280, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } else {
            reject(new Error('Canvas context unavailable'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const files: File[] = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (imageList.length + files.length > maxFiles) {
      setErrorMsg(`Maximum ${maxFiles} images can be uploaded at a time.`);
      return;
    }

    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const newItems: ImageItem[] = [];

    for (const file of files) {
      if (!validExtensions.includes(file.type.toLowerCase())) {
        setErrorMsg(`Unsupported file type: ${file.name}. Only JPG, PNG, WEBP allowed.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `IMG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file,
        previewUrl,
        originalSize: formatBytes(file.size),
      });
    }

    setImageList((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    setImageList((prev) => prev.filter((img) => img.id !== id));
  };

  const handleCompressAll = async () => {
    if (imageList.length === 0) return;
    setCompressing(true);
    setErrorMsg(null);

    try {
      const updatedList = await Promise.all(
        imageList.map(async (item) => {
          const compressedDataUrl = await compressImage(item.file, 1280, 0.75);
          // Estimate compressed size
          const base64Length = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
          const compressedBytes = Math.round((base64Length * 3) / 4);

          return {
            ...item,
            previewUrl: compressedDataUrl,
            compressedSize: formatBytes(compressedBytes),
            isCompressed: true,
          };
        })
      );

      setImageList(updatedList);
    } catch (err: any) {
      setErrorMsg('Failed to compress some images.');
    } finally {
      setCompressing(false);
    }
  };

  const handleUploadSubmit = () => {
    if (imageList.length === 0) return;

    const payload = imageList.map((item) => ({
      id: item.id,
      dataUrl: item.previewUrl,
      name: item.file.name,
    }));

    if (onUploadImages) {
      onUploadImages(payload);
    }

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">Choose from Gallery / फोटो गैलरी</h3>
              <p className="text-[11px] text-slate-400">Select JPG, PNG or WEBP photos from device gallery</p>
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
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-indigo-950/20 p-5 rounded-2xl text-center cursor-pointer transition group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 group-hover:bg-indigo-600 group-hover:text-white text-indigo-400 flex items-center justify-center mx-auto mb-2 transition">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
              Tap to open Gallery / गैलरी से फोटो चुनें
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports JPG, PNG, WEBP • Max {maxFiles} files
            </p>
          </div>

          {/* Selected Images Grid */}
          {imageList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span>Selected Photos ({imageList.length})</span>
                <button
                  type="button"
                  onClick={handleCompressAll}
                  disabled={compressing}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{compressing ? 'Compressing...' : 'Optimize & Compress Images'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {imageList.map((img) => (
                  <div key={img.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2 relative group flex flex-col justify-between">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black mb-1.5">
                      <img src={img.previewUrl} alt={img.file.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-md shadow transition"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-[10px]">
                      <p className="text-slate-200 font-medium truncate">{img.file.name}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
                        <span>{img.isCompressed ? img.compressedSize : img.originalSize}</span>
                        {img.isCompressed && <span className="text-emerald-400 font-bold">Optimized</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Success Notice */}
        {uploadSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 my-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Photos Processed & Ready for Upload!</span>
          </div>
        )}

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
            onClick={handleUploadSubmit}
            disabled={imageList.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Attach / Upload Photos ({imageList.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
