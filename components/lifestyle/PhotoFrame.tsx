"use client";

import React from "react";
import { Camera } from "lucide-react";

interface RibbonPhotoProps {
  src: string;
  colStart: number;
  rowStart: number;
  colSpan?: number;
  isGrayscale?: boolean;
}

const RibbonPlaceholder: React.FC<{ colStart: number; rowStart: number; index: number }> = ({ colStart, rowStart, index }) => (
  <div 
    className="bg-[#1c1c18]/5 dark:bg-white/5 border border-dashed border-neutral-300 flex items-center justify-center group"
    style={{ gridColumnStart: colStart, gridRowStart: rowStart }}
  >
    <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
      <Camera className="w-3 h-3" />
      <span className="text-[6px] font-bold uppercase tracking-tighter">Slot {index}</span>
    </div>
  </div>
);

const RibbonPhoto: React.FC<RibbonPhotoProps> = ({ src, colStart, rowStart, colSpan = 1, isGrayscale = false }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-black transition-all duration-500 hover:scale-[1.02] hover:z-50 hover:shadow-2xl`}
      style={{ 
        gridColumnStart: colStart, 
        gridColumnEnd: `span ${colSpan}`,
        gridRowStart: rowStart 
      }}
    >
      <img
        src={src}
        alt="Personal Memory"
        className={`w-full h-full object-cover object-[50%_30%] ${isGrayscale ? "grayscale" : ""}`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.classList.add('bg-[#1c1c18]');
        }}
      />
    </div>
  );
};

export const PhotoFrame: React.FC = () => {
  // Array of 30 photos recently added and renamed to frame-X.jpg
  const personalPhotos = Array.from({ length: 30 }, (_, i) => `/images/curiosity/frame-${i + 1}.jpg`);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none hidden lg:grid grid-cols-12 grid-rows-12 gap-0 overflow-hidden">
      
      {/* Top Edge (Col 1 to 12, Row 1) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const photo = personalPhotos[i];
        return photo ? (
          <RibbonPhoto 
            key={`top-${i}`} 
            src={photo} 
            colStart={i + 1} 
            rowStart={1} 
          />
        ) : (
          <RibbonPlaceholder key={`top-placeholder-${i}`} colStart={i + 1} rowStart={1} index={i+1} />
        );
      })}

      {/* Right Edge (Col 12, Row 2 to 11) */}
      {Array.from({ length: 10 }).map((_, i) => {
        const globalIdx = i + 12;
        const photo = personalPhotos[globalIdx];
        return photo ? (
          <RibbonPhoto 
            key={`right-${i}`} 
            src={photo} 
            colStart={12} 
            rowStart={i + 2} 
          />
        ) : (
          <RibbonPlaceholder key={`right-placeholder-${i}`} colStart={12} rowStart={i + 2} index={globalIdx+1} />
        );
      })}

      {/* Bottom Edge (Col 1 to 12, Row 12) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const globalIdx = i + 22;
        const photo = personalPhotos[globalIdx];
        return photo ? (
          <RibbonPhoto 
            key={`bottom-${i}`} 
            src={photo} 
            colStart={i + 1} 
            rowStart={12} 
          />
        ) : (
          <RibbonPlaceholder key={`bottom-placeholder-${i}`} colStart={i + 1} rowStart={12} index={globalIdx+1} />
        );
      })}

      {/* Left Edge (Col 1, Row 2 to 11) */}
      {Array.from({ length: 10 }).map((_, i) => {
        const globalIdx = i + 34;
        const photo = personalPhotos[globalIdx];
        return photo ? (
          <RibbonPhoto 
            key={`left-${i}`} 
            src={photo} 
            colStart={1} 
            rowStart={i + 2} 
          />
        ) : (
          <RibbonPlaceholder key={`left-placeholder-${i}`} colStart={1} rowStart={i + 2} index={globalIdx+1} />
        );
      })}
      
      {/* Centric Design Masking: Subtle vignette for the "framed" content */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.1)] ring-[15vw] ring-transparent" />
    </div>
  );
};
