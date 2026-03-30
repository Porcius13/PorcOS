"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Eye, Share2, Bookmark, Star, ArrowLeft } from "lucide-react";
import { ResearchData } from "./lib/research-db";

interface ZenModeProps {
  item: ResearchData | null;
  onClose: () => void;
}

export const ZenMode = ({ item, onClose }: ZenModeProps) => {
  if (!item) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-neutral-950 flex flex-col items-center overflow-y-auto selection:bg-amber-500/30 selection:text-white"
      >
        {/* Background Depth Blurs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neutral-800/10 rounded-full blur-[120px]" />
        </div>

        {/* Global Navigation Bar */}
        <nav className="sticky top-0 w-full z-50 flex items-center justify-between p-8 bg-neutral-950/40 backdrop-blur-xl border-b border-white/5">
          <button 
            onClick={onClose}
            className="flex items-center gap-3 text-neutral-400 hover:text-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 group-hover:border-white/20 transition-all">
                <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit Protocol</span>
          </button>
          
          <div className="flex items-center gap-6">
            <button className="text-neutral-500 hover:text-white transition-all"><Share2 className="w-5 h-5" /></button>
            <button className="text-neutral-500 hover:text-white transition-all"><Bookmark className="w-5 h-5" /></button>
          </div>
        </nav>

        {/* Article Container */}
        <article className="relative z-10 w-full max-w-4xl px-8 py-20 mx-auto">
          {/* Hero Section */}
          <header className="mb-20 text-center">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center items-center gap-4 mb-8"
            >
              <span className="px-4 py-1 rounded-full bg-amber-500 text-[10px] font-black uppercase tracking-[0.3em] text-black">
                {item.category}
              </span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                {item.date} • {item.stats || "6m Read"}
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-sans font-black text-white tracking-tighter leading-tight mb-12"
            >
              {item.title}
            </motion.h1>

            {item.coverImage && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
              >
                <img src={item.coverImage} className="w-full h-full object-cover" alt={item.title} />
              </motion.div>
            )}
          </header>

          {/* Golden Words Highlight */}
          {item.goldenWords && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-24 relative p-12 bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Star className="w-32 h-32 text-amber-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-[2px] bg-amber-500" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Golden Words</span>
                </div>
                <div 
                  className="text-2xl md:text-3xl font-medium text-amber-100 italic leading-snug rich-content-display"
                  dangerouslySetInnerHTML={{ __html: item.goldenWords }}
                />
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="prose prose-invert prose-amber max-w-none prose-lg md:prose-xl font-sans text-neutral-300 leading-relaxed"
          >
            <div dangerouslySetInnerHTML={{ __html: item.description }} />
          </motion.div>
          
          {/* Footer Navigation */}
          <footer className="mt-32 pt-16 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col gap-2">
                <span className="text-xl font-black text-white italic">The Personal OS</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Digital Curation System • Node-13</span>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
            >
              Finish Reading
            </button>
          </footer>
        </article>
      </motion.div>
    </AnimatePresence>
  );
};
