"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Loader2,
  ZoomIn,
  ZoomOut,
  BookOpen
} from "lucide-react";
import { magazineDb, MagazineData } from "./lib/magazine-db";

// Load PDF.js from CDN
const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

interface MagazineReaderProps {
  magazineId: number;
  onClose: () => void;
}

export default function MagazineReader({ magazineId, onClose }: MagazineReaderProps) {
  const [magazine, setMagazine] = useState<MagazineData | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  
  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadPdfJs = useCallback(async () => {
    if (window.pdfjsLib) return window.pdfjsLib;
    
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = PDFJS_URL;
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
        resolve(window.pdfjsLib);
      };
      document.head.appendChild(script);
    });
  }, []);

  const renderPage = async (pageNo: number) => {
    if (!pdfDocRef.current) return null;
    try {
      const page = await pdfDocRef.current.getPage(pageNo);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context!, viewport }).promise;
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (error) {
      console.error("Error rendering page:", error);
      return null;
    }
  };

  const loadMagazine = async () => {
    try {
      const data = await magazineDb.getMagazine(magazineId);
      if (!data) return onClose();
      setMagazine(data);

      const pdfjs = await loadPdfJs();
      const arrayBuffer = await data.pdfBlob.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);

      // Prelode initial pages
      const initialPages = [];
      for (let i = 1; i <= Math.min(4, pdf.numPages); i++) {
        const img = await renderPage(i);
        if (img) initialPages[i-1] = img;
      }
      setPages(initialPages);
      setLoading(false);
    } catch (error) {
      console.error("Error loading magazine:", error);
      alert("Dergi yüklenirken bir hata oluştu.");
      onClose();
    }
  };

  useEffect(() => {
    loadMagazine();
  }, [magazineId]);

  const flipNext = () => {
    if (currentPage < numPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 2);
        setIsFlipping(false);
      }, 600);
    }
  };

  const flipPrev = () => {
    if (currentPage > 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => Math.max(1, prev - 2));
        setIsFlipping(false);
      }, 600);
    }
  };

  // Preload next pages whenever current page changes
  useEffect(() => {
    const preload = async () => {
      if (!pdfDocRef.current) return;
      const nextPages = [...pages];
      for (let i = Math.max(1, currentPage - 2); i <= Math.min(numPages, currentPage + 4); i++) {
        if (!nextPages[i-1]) {
          const img = await renderPage(i);
          if (img) nextPages[i-1] = img;
        }
      }
      setPages(nextPages);
    };
    preload();
  }, [currentPage, numPages]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-blue-200 font-bold animate-pulse">Dijital Dergi Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex flex-col text-white select-none overflow-hidden">
      {/* Header controls */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 truncate max-w-[300px]">
              {magazine?.title}
            </h2>
            <p className="text-[10px] font-bold opacity-40">Sayfa {currentPage} / {numPages}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <ZoomOut size={18} />
          </button>
          <div className="px-4 py-2 bg-white/5 rounded-lg text-[10px] font-black">{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button onClick={onClose} className="p-3 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-xl transition-all active:scale-95">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Flipbook Area */}
      <div className="flex-1 relative bg-black/40 overflow-hidden" ref={containerRef}>
        <div 
          className="absolute inset-0 flex items-center justify-center p-4 pt-12"
          style={{ perspective: "2500px" }}
        >
          <motion.div 
            className="relative flex items-center justify-center origin-center transition-transform duration-500" 
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Realistic Book Mockup */}
            <div className="flex bg-slate-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-sm overflow-visible border border-white/5 relative preserve-3d">
              
              {/* Left Page */}
              <div className="w-[300px] h-[450px] sm:w-[400px] sm:h-[580px] lg:w-[500px] lg:h-[720px] bg-slate-900 shadow-inner relative overflow-hidden">
                 {currentPage > 1 && pages[currentPage - 2] ? (
                   <img 
                     src={pages[currentPage - 2]} 
                     alt="Left" 
                     className="w-full h-full object-cover select-none" 
                   />
                 ) : (
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center opacity-40">
                     <BookOpen size={48} className="text-white/10" />
                   </div>
                 )}
                 <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-black/60 to-transparent pointer-events-none z-10" />
              </div>

              {/* Right Page */}
              <div className="w-[300px] h-[450px] sm:w-[400px] sm:h-[580px] lg:w-[500px] lg:h-[720px] bg-white relative overflow-hidden">
                 {pages[currentPage - 1] ? (
                   <img 
                     src={pages[currentPage - 1]} 
                     alt="Right" 
                     className="w-full h-full object-cover select-none" 
                   />
                 ) : (
                   <div className="absolute inset-0 bg-white flex items-center justify-center">
                     <Loader2 className="animate-spin text-slate-200" />
                   </div>
                 )}
                 <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10" />
              </div>

              {/* Flipping Page Animation overlay */}
              <AnimatePresence>
                {isFlipping && (
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -180 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute top-0 left-1/2 w-[300px] h-[450px] sm:w-[400px] sm:h-[580px] lg:w-[500px] lg:h-[720px] bg-white origin-left preserve-3d z-30 shadow-2xl"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="absolute inset-0">
                      {pages[currentPage - 1] && <img src={pages[currentPage - 1]} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spine Center line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-black/30 z-50" />
            </div>
          </motion.div>
        </div>

        {/* Navigation Click Overlay Areas - Placed absolutely over the book area */}
        <div className="absolute inset-0 z-40 flex pointer-events-none">
          <div 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); flipPrev(); }}
            className="flex-1 cursor-pointer group pointer-events-auto"
          />
          <div 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); flipNext(); }}
            className="flex-1 cursor-pointer group pointer-events-auto"
          />
        </div>

        {/* Floating Nav Buttons */}
        <div className="absolute top-1/2 left-8 -translate-y-1/2 z-50 hidden md:block">
           <button onClick={flipPrev} className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all active:scale-90 border border-white/10">
             <ChevronLeft size={32} />
           </button>
        </div>
        <div className="absolute top-1/2 right-8 -translate-y-1/2 z-50 hidden md:block">
           <button onClick={flipNext} className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all active:scale-90 border border-white/10">
             <ChevronRight size={32} />
           </button>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="h-20 px-8 flex items-center justify-center border-t border-white/5 bg-black/20">
         <div className="w-full max-w-xl flex items-center gap-6">
           <button onClick={flipPrev} disabled={currentPage <= 1} className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30">
             <ChevronLeft size={20} />
           </button>
           <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
             <div 
               className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
               style={{ width: `${(currentPage / numPages) * 100}%` }}
             />
           </div>
           <button onClick={flipNext} disabled={currentPage >= numPages - 1} className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30">
             <ChevronRight size={20} />
           </button>
           <div className="text-[10px] font-black uppercase text-blue-400 whitespace-nowrap">
             {currentPage} of {numPages}
           </div>
         </div>
      </div>

      <style jsx global>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}
