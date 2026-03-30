"use client";

import { useRef, useEffect, useState } from "react";
import { smartSanitize } from "@/lib/medical-sanitizer";

interface RichTechnicalEntryProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  accent?: boolean;
}

export function RichTechnicalEntry({ label, value, onChange, placeholder, accent = false }: RichTechnicalEntryProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync value from parent to editor (initial load or manual external updates)
  useEffect(() => {
    if (editorRef.current) {
      const sanitized = smartSanitize(value || "");
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // If we want to strictly keep the Google Docs "intent", 
    // we let it paste normally, but we trigger a sanitize after.
    // To provide a smoother experience, we can intercept and sanitize manually.
    
    // For now, let's let the browser handle the "insert" but trigger a sync
    setTimeout(() => {
       if (editorRef.current) {
         const sanitized = smartSanitize(editorRef.current.innerHTML);
         editorRef.current.innerHTML = sanitized;
         onChange(sanitized);
       }
    }, 0);
  };

  return (
    <div className={`bg-terminal-surface p-8 border-l border-terminal-surface-high min-h-[200px] flex flex-col shadow-2xl group transition-all duration-300 ${isFocused ? 'bg-terminal-bg/50 border-terminal-accent ring-1 ring-terminal-accent/20' : 'hover:bg-terminal-bg/50'}`}>
       <h4 className={`font-label text-[10px] font-black mb-6 uppercase tracking-[0.3em] transition-colors ${isFocused ? 'text-terminal-accent' : 'text-neutral-500 dark:text-terminal-dim group-hover:text-terminal-accent'}`}>
         {label}
       </h4>
       
       <div className="relative flex-grow flex flex-col">
         <div
           ref={editorRef}
           contentEditable
           onFocus={() => setIsFocused(true)}
           onBlur={() => setIsFocused(false)}
           onInput={handleInput}
           onPaste={handlePaste}
           className={`w-full min-h-[120px] bg-transparent text-sm md:text-[15px] border-none outline-none resize-none leading-relaxed flex-grow rich-content-editor ${accent ? 'text-terminal-accent font-bold' : 'text-neutral-900 dark:text-white'}`}
         />
         {!value && !isFocused && (
           <div className="absolute top-0 left-0 text-neutral-400 dark:text-terminal-dim/30 pointer-events-none text-sm italic">
             {placeholder}
           </div>
         )}
       </div>

       {/* Visual status bar for rich mode */}
       <div className="mt-4 pt-4 border-t border-terminal-surface-high/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-bold text-terminal-dim uppercase tracking-widest flex items-center gap-1.5">
             <div className="h-1 w-1 rounded-full bg-terminal-accent animate-pulse" />
             KLİNİK_ZENGİN_METİN_EDİTÖRÜ // ON_PASTE_AUTO_SANITIZE
          </span>
       </div>
    </div>
  );
}
