"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onImageChange: (base64: string | null) => void;
  initialImage?: string | null;
}

export function ImageUpload({ onImageChange, initialImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImage !== undefined) {
      setPreview(initialImage);
    }
  }, [initialImage]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          // Resize logic
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context not available"));
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Quality: 0.6 (60%) for significant space savings with minimal loss
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
          console.log(`[Image Optimizer] Original: ${(file.size / 1024).toFixed(2)}KB | Optimized: ${(compressedBase64.length / 1.33 / 1024).toFixed(2)}KB`);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Lütfen geçerli bir resim dosyası seçin.");
        return;
      }

      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(file);
        setPreview(compressedBase64);
        onImageChange(compressedBase64);
      } catch (error) {
        console.error("Görsel sıkıştırma hatası:", error);
        alert("Görsel işlenirken bir hata oluştu.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100 mb-1.5 block">
        Kapak Fotoğrafı
      </label>
      
      {preview ? (
        <div className="relative h-40 w-full rounded-xl overflow-hidden group border border-neutral-200 dark:border-white/5 shadow-sm">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
            style={{ backgroundImage: `url('${preview}')` }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={clearImage}
              type="button"
              className="rounded-full bg-red-500 text-white p-2 hover:bg-red-600 transition shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isCompressing}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 text-neutral-500 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/10 dark:hover:border-neutral-700 dark:hover:bg-neutral-900/30 group"
        >
          {isCompressing ? (
            <>
               <Loader2 className="h-6 w-6 animate-spin text-terminal-accent mb-2" />
               <span className="text-[10px] font-black tracking-widest uppercase">YOĞUN_SIKIŞTIRMA_AKTİF</span>
            </>
          ) : (
            <>
               <ImagePlus className="mb-2 h-6 w-6 group-hover:scale-110 transition-transform" />
               <span className="text-sm font-medium">Fotoğraf Yükle</span>
               <span className="mt-1 text-xs text-neutral-400 font-bold uppercase tracking-widest">Optimize Edilmiş Format (JPG)</span>
            </>
          )}
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
