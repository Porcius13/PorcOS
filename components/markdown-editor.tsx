"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, Edit3, Type, List, Bold, Italic, Link as LinkIcon } from "lucide-react";
import { smartSanitize } from "@/lib/medical-sanitizer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
}

export function MarkdownEditor({ value, onChange, placeholder, label, rows = 6 }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value from parent to editor (initial load or manual external updates)
  useEffect(() => {
    if (editorRef.current && mode === "edit") {
      const sanitized = smartSanitize(value || "");
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
      }
    }
  }, [mode, value]);

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Small delay to allow browser paste then sanitize
    setTimeout(() => {
      if (editorRef.current) {
        const sanitized = smartSanitize(editorRef.current.innerHTML);
        editorRef.current.innerHTML = sanitized;
        onChange(sanitized);
      }
    }, 0);
  };

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between px-1">
        {label && (
          <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
              mode === "edit" 
                ? "bg-white dark:bg-neutral-700 text-primary shadow-sm" 
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
            }`}
          >
            <Edit3 className="h-3 w-3" />
            WRITE
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
              mode === "preview" 
                ? "bg-white dark:bg-neutral-700 text-primary shadow-sm" 
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
            }`}
          >
            <Eye className="h-3 w-3" />
            PREVIEW
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-neutral-900 transition-all focus-within:bg-white dark:focus-within:bg-neutral-800 focus-within:ring-2 focus-within:ring-primary/40 shadow-inner">
        {mode === "edit" && (
          <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-white/5 p-2 bg-neutral-50/50 dark:bg-neutral-950/20 sticky top-0 z-10">
            <button 
              type="button"
              onMouseDown={(e) => { e.preventDefault(); execCommand("bold"); }}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
              title="Bold"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button 
              type="button"
              onMouseDown={(e) => { e.preventDefault(); execCommand("italic"); }}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
              title="Italic"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-4 bg-neutral-200 dark:bg-white/10 mx-1" />
            <button 
              type="button"
              onMouseDown={(e) => { e.preventDefault(); execCommand("formatBlock", "h2"); }}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors flex items-center gap-0.5"
              title="Heading 2"
            >
              <Type className="h-3.5 w-3.5" />
              <span className="text-[8px] font-bold">H2</span>
            </button>
            <button 
              type="button"
              onMouseDown={(e) => { e.preventDefault(); execCommand("insertUnorderedList"); }}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
              title="Bullet List"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button 
              type="button"
              onMouseDown={(e) => { 
                e.preventDefault(); 
                const url = prompt("Enter URL:");
                if (url) execCommand("createLink", url);
              }}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
              title="Link"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {mode === "edit" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            className="w-full min-h-[150px] px-5 py-4 text-sm text-neutral-900 dark:text-neutral-50 outline-none rich-content-editor"
            style={{ height: rows ? `${rows * 1.5}rem` : "auto" }}
          />
        ) : (
          <div className="min-h-[150px] px-5 py-4 text-sm text-neutral-900 dark:text-neutral-100 prose dark:prose-invert max-w-none overflow-y-auto max-h-[400px]">
            {value.trim() ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: smartSanitize(value) 
                }} 
                className="rich-content-display" 
              />
            ) : (
              <p className="text-neutral-400 italic">Previewing your content...</p>
            )}
          </div>
        )}
      </div>
      <p className="px-2 text-[10px] text-neutral-400 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
        Pasted formatting from Google Docs supported (Bold, Sizes, Lists).
      </p>
    </div>
  );
}
