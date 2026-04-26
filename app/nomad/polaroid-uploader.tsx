"use client";

import { useState, useRef } from "react";

export default function PolaroidUploader() {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  return (
    <div 
      className="bg-nomad-surface-container-lowest polaroid-frame p-6 pt-6 pb-20 rounded-none relative transform -rotate-1 hover:rotate-0 transition-transform duration-500 cursor-pointer group"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <div className="aspect-[4/5] bg-nomad-surface-container overflow-hidden relative group-hover:bg-nomad-surface-container-low transition-colors">
        {image ? (
          <img alt="Polaroid Memory" className="w-full h-full object-cover grayscale-[0.2] sepia-[0.1]" src={image} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-nomad-outline-variant group-hover:scale-110 transition-transform duration-300">
             <span className="material-symbols-outlined text-4xl mb-3" style={{fontVariationSettings: "'FILL' 0, 'wght' 300"}}>add_photo_alternate</span>
             <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold">Add Photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-nomad-primary/5 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.08] grain-overlay-nomad pointer-events-none"></div>
      </div>
      
      {/* Handwriting metadata style */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end border-t border-dashed border-nomad-outline-variant/30 pt-4">
        {image ? (
          <p className="font-headline italic text-nomad-on-surface/80 text-lg">New Memory</p>
        ) : (
          <p className="font-headline italic text-nomad-on-surface-variant/40 text-lg">Click to select...</p>
        )}
        <span className="material-symbols-outlined text-nomad-outline-variant" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>photo_camera</span>
      </div>
      
      {/* Tape effect decoration */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-[#c8f17a]/30 backdrop-blur-sm transform rotate-2"></div>
    </div>
  );
}
