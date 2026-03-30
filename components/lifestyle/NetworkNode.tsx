"use client";

import React from "react";
import { motion } from "framer-motion";
import { NetworkNode as NodeData } from "./lib/network-db";
import { cn } from "@/lib/utils";

interface NetworkNodeProps {
  node: NodeData;
  isSelected?: boolean;
  onDrag: (id: string, pos: { x: number; y: number }) => void;
  onClick: (node: NodeData) => void;
  scale?: number;
  opacity?: number;
}

const TYPE_CONFIG = {
  strategic: { 
    border: "border-amber-500/30", 
    glow: "shadow-[0_0_30px_rgba(233,195,73,0.15)]",
    text: "text-amber-600 dark:text-amber-500"
  },
  personal: { 
    border: "border-emerald-500/30", 
    glow: "shadow-[0_0_30px_rgba(102,221,139,0.15)]",
    text: "text-emerald-600 dark:text-emerald-500"
  },
  professional: { 
    border: "border-blue-500/30", 
    glow: "shadow-[0_0_30px_rgba(171,199,255,0.15)]",
    text: "text-blue-600 dark:text-blue-500"
  }
};

export function NetworkNode({ node, isSelected, onDrag, onClick, scale = 1, opacity = 1 }: NetworkNodeProps) {
  const config = TYPE_CONFIG[node.type];

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDrag={(_, info) => {
        onDrag(node.id, { 
          x: node.position.x + info.delta.x / scale, 
          y: node.position.y + info.delta.y / scale 
        });
      }}
      initial={node.position}
      animate={{ ...node.position, opacity }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(node)}
      className="absolute z-20 cursor-grab active:cursor-grabbing flex flex-col items-center gap-3 p-2"
      style={{ left: 0, top: 0 }}
    >
      <div className={cn(
        "relative p-1 rounded-full border-2 transition-all duration-500",
        config.border,
        "bg-white/70 dark:bg-transparent backdrop-blur-xl dark:backdrop-blur-none",
        isSelected && "ring-4 ring-primary/20 scale-110"
      )}>
        <div className="w-20 h-20 rounded-full overflow-hidden bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
          {node.image ? (
            <img src={node.image} alt={node.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-black/10 dark:text-white/10 uppercase">
              {node.name.slice(0, 2)}
            </div>
          )}
        </div>
        
        {/* Type Badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/70 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-black/5 dark:border-white/10 whitespace-nowrap shadow-xl">
          <p className={cn("text-[9px] font-black uppercase tracking-tighter", config.text)}>
            {node.id === 'core-self' ? 'Core Node' : node.role}
          </p>
        </div>
      </div>

      <div className="text-center">
        <h3 className="font-headline font-bold text-sm text-on-surface dark:text-neutral-100 leading-tight drop-shadow-sm dark:drop-shadow-lg">{node.name}</h3>
        <p className={cn("font-medium text-[9px] uppercase tracking-widest opacity-60 mt-0.5", config.text)}>
          {node.type}
        </p>
      </div>
    </motion.div>
  );
}
