"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Star, Zap, Terminal, Code, Cpu, Palette, Brain, Check, MoreVertical, Sparkles, Edit2, Trash2 } from "lucide-react";
import { PromptData, promptsDb } from "./lib/prompts-db";

const CATEGORY_MAP: Record<string, { icon: any; color: string; bgColor: string }> = {
  Coding: { icon: Code, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  Logic: { icon: Brain, color: "text-cyan-400", bgColor: "bg-cyan-400/10" },
  Creative: { icon: Palette, color: "text-purple-400", bgColor: "bg-purple-400/10" },
  Analysis: { icon: Cpu, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  Strategic: { icon: Terminal, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  Automation: { icon: Zap, color: "text-orange-400", bgColor: "bg-orange-400/10" },
};

interface PromptCardProps extends PromptData {
  onEdit?: (prompt: PromptData) => void;
  onDelete?: (id: string) => void;
}

export const PromptCard = ({
  id,
  title,
  content,
  category,
  date,
  isFavorite,
  usageCount,
  aiModel,
  modelColor,
  image,
  aiTool,
  explanation,
  onEdit,
  onDelete,
}: PromptCardProps) => {
  const [copied, setCopied] = useState(false);
  const catInfo = CATEGORY_MAP[category] || { icon: Terminal, color: "text-amber-500", bgColor: "bg-amber-500/10" };
  const Icon = catInfo.icon;
  const isGemini = aiModel?.toLowerCase().includes("gemini");

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      await promptsDb.incrementUsage(id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="group relative break-inside-avoid mb-10 cursor-pointer overflow-hidden transition-all duration-500">
      {/* Image/Visual Container */}
      <div 
        className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 shadow-sm group-hover:shadow-2xl group-hover:shadow-amber-500/10 transition-all duration-700"
        onClick={() => onEdit?.({ id, title, content, category, date, isFavorite, usageCount, aiModel, modelColor, temperature: 0.7, image, aiTool, tags: [] })}
      >
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center bg-neutral-50 dark:bg-gradient-to-br dark:from-neutral-900 dark:to-black p-12">
             <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                <Icon className={`w-10 h-10 ${catInfo.color}`} />
             </div>
          </div>
        )}

        {/* Floating AI Tool Badge */}
        {aiTool && aiTool !== "Default" && (
            <div className="absolute top-6 right-6 z-20">
                <span className="px-3 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-md border border-blue-500/20 dark:border-blue-500/30 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5 shadow-xl">
                    <Sparkles className="w-3 h-3" />
                    {aiTool}
                </span>
            </div>
        )}

        {/* Hover Arrow Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                <Icon className="w-7 h-7" />
            </div>
        </div>
      </div>

      {/* Text Content (Simplified Pinterest Style) */}
      <div className="mt-5 px-4 font-sans">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${catInfo.color}`}>
                    {category}
                </span>
                <span className="w-1 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                  {new Date(date).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.({ id, title, content, category, date, isFavorite, usageCount, aiModel, modelColor, temperature: 0.7, image, aiTool, tags: [] });
                    }}
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(id);
                    }}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${copied ? 'text-emerald-500 bg-emerald-500/10' : 'text-neutral-400 dark:text-neutral-500 hover:text-emerald-500 hover:bg-neutral-100 dark:hover:bg-white/5'}`}
                    onClick={handleCopy}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
        </div>
        
        <h3 className="font-headline font-black text-xl md:text-2xl leading-tight tracking-tight text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors italic mb-4">
          {title}
        </h3>

        {/* Prompt Preview Snippet */}
        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 border border-neutral-100 dark:border-white/5 mb-4 group-hover:border-amber-500/10 transition-all">
            <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 line-clamp-3 leading-relaxed">
                {content}
            </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${modelColor || 'bg-amber-500'} ${isGemini ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isGemini ? 'text-blue-500 dark:text-blue-400' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    {aiModel}
                </span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-300 dark:text-neutral-600">
                <Zap className="w-3 h-3 fill-current" />
                <span className="text-[9px] font-black uppercase tracking-tighter">{usageCount || 0}</span>
            </div>
        </div>
      </div>
    </div>
  );
};
