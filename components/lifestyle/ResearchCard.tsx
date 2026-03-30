"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookText, Camera, History, Lock, Map, Star, Eye } from "lucide-react";

interface ResearchCardProps {
  title: string;
  category: string;
  date: string;
  description: string;
  coverImage?: string;
  tag?: string;
  stats?: string;
  isLocked?: boolean;
  featured?: boolean;
  large?: boolean;
  slug?: string;
}

export const ResearchCard = ({
  title,
  category,
  date,
  description,
  coverImage,
  tag,
  stats,
  isLocked,
  featured,
  large,
  slug
}: ResearchCardProps) => {
  const CardContent = (
    <div className="group relative break-inside-avoid mb-10 cursor-pointer overflow-hidden transition-all duration-500">
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-[2rem] bg-neutral-100 dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 shadow-sm group-hover:shadow-2xl group-hover:shadow-amber-500/10 transition-all duration-700">
        {coverImage ? (
          <img 
            className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105" 
            src={coverImage} 
            alt={title}
          />
        ) : (
          <div className="w-full aspect-[4/5] flex items-center justify-center p-12">
             <div className="w-full aspect-square rounded-[2rem] bg-white dark:bg-neutral-800 shadow-2xl flex items-center justify-center relative overflow-hidden group-hover:rotate-6 transition-transform duration-500">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
               <span className="material-symbols-outlined text-6xl text-neutral-900 dark:text-neutral-100 font-light">auto_awesome</span>
             </div>
          </div>
        )}
        
        {/* Hover Arrow Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                <ArrowRight className="w-7 h-7" />
            </div>
        </div>
      </div>

      {/* Text Content (Simplified Pinterest Style) */}
      <div className="mt-5 px-4">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">
                {category}
            </span>
            <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{date}</span>
        </div>
        
        <h3 className="font-sans font-bold text-lg md:text-xl leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-amber-600 transition-colors">
          {title}
        </h3>
        
        <div className="mt-3 flex items-center gap-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {stats || "3m read"}</span>
            {featured && (
                <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-current" /> Featured</span>
            )}
        </div>
      </div>
    </div>
  );

  if (slug && !isLocked) {
    return (
      <div className="block">
        {CardContent}
      </div>
    );
  }

  return CardContent;
};
