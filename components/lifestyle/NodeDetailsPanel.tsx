"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Bolt, Edit3, Fingerprint, Activity, 
  Share2, Linkedin, Twitter, Hash 
} from "lucide-react";
import { NetworkNode as NodeData } from "./lib/network-db";
import { cn } from "@/lib/utils";

interface NodeDetailsPanelProps {
  node: NodeData | null;
  onClose: () => void;
  onEdit: (node: NodeData) => void;
  onConnect: (node: NodeData) => void;
}

export function NodeDetailsPanel({ node, onClose, onEdit, onConnect }: NodeDetailsPanelProps) {
  if (!node) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        className="fixed top-24 right-8 bottom-8 w-80 bg-white/70 dark:bg-neutral-900/40 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-3xl z-40 p-8 flex flex-col gap-10 shadow-2xl transition-colors duration-500"
      >
        <header className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="font-label text-[10px] text-primary uppercase tracking-[0.2em] font-black flex items-center gap-2">
              <Fingerprint className="w-3 h-3" />
              Node Identity
            </span>
            <h2 className="text-3xl font-headline font-black text-on-surface dark:text-white mt-1 leading-tight">{node.name}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-500 uppercase font-black tracking-widest bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md border border-black/5 dark:border-white/5">{node.role}</span>
              {node.tags?.map(tag => (
                <span key={tag} className="text-[10px] text-primary/80 uppercase font-black tracking-widest bg-primary/5 px-2 py-1 rounded-md border border-primary/10">#{tag}</span>
              ))}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/5 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex flex-col gap-8 flex-1 overflow-y-auto no-scrollbar">
          <div className="bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <span className="font-label text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Neural Strength</span>
              <span className="text-primary font-black text-xs">{node.affinity || 85}% Match</span>
            </div>
            <div className="h-1.5 w-full bg-black/5 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${node.affinity || 85}%` }}
                className="h-full bg-primary shadow-[0_0_10px_rgba(255,210,31,0.5)]" 
              />
            </div>
          </div>

          {(node.socialLinks?.linkedin || node.socialLinks?.twitter) && (
            <div className="flex gap-4">
              {node.socialLinks.linkedin && (
                <a 
                  href={node.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0077b5]/10 border border-[#0077b5]/20 text-[#0077b5] hover:bg-[#0077b5]/20 transition-all shadow-lg shadow-blue-500/5"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {node.socialLinks.twitter && (
                <a 
                  href={`https://twitter.com/${node.socialLinks.twitter.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-on-surface dark:text-neutral-400 hover:bg-black/10 dark:hover:bg-white/10 transition-all shadow-lg"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-label text-[10px] uppercase tracking-widest text-neutral-500 font-black flex items-center gap-2">
              <Activity className="w-3 h-3 text-blue-400" />
              System Notes
            </h4>
            <p className="text-sm text-on-surface-variant dark:text-neutral-400 leading-relaxed font-light border-l border-black/5 dark:border-white/10 pl-4 py-2">
              {node.notes || "// No tactical data available for this node. Last detected 4h ago via encrypted neural link."}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-label text-[10px] uppercase tracking-widest text-neutral-500 font-black flex items-center gap-2">
              <Share2 className="w-3 h-3 text-emerald-400" />
              Connected Nodes
            </h4>
            <div className="flex -space-x-3 overflow-hidden ml-1">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white dark:ring-neutral-900 bg-black/5 dark:bg-neutral-800 border-2 border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="text-[10px] font-black text-black/10 dark:text-white/10">ID</div>
                </div>
              ))}
              <div className="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-white dark:ring-neutral-900 bg-black/5 dark:bg-neutral-800 border-2 border-black/5 dark:border-white/10 text-[10px] font-black text-neutral-400">+{node.connections.length}</div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button 
            onClick={() => onConnect(node)}
            className="w-full py-5 bg-primary text-on-primary font-headline font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <Bolt className="w-4 h-4 fill-current" />
            Connect Node
          </button>
          <button 
            onClick={() => onEdit(node)}
            className="w-full py-5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-on-surface-variant dark:text-neutral-400 font-headline font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-black/10 dark:hover:bg-white/10 transition-all font-bold"
          >
            <Edit3 className="w-4 h-4" />
            Edit Intelligence
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
