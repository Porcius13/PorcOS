"use client";

import { CheckSquare, Square, Lock } from "lucide-react";
import { motion } from "framer-motion";

export type ChecklistItem = {
  id: string;
  label: string;
  status: "COMPLETE" | "PENDING" | "LOCKED";
};

interface PatientChecklistProps {
  items: ChecklistItem[];
  isEditable?: boolean;
  onUpdate?: (items: ChecklistItem[]) => void;
}

export function PatientChecklist({ items = [], isEditable = false, onUpdate }: PatientChecklistProps) {
  const toggleItem = (id: string) => {
    if (!onUpdate) return;
    const newItems = items.map((item) => {
      if (item.id === id) {
        if (item.status === "LOCKED") return item;
        const nextStatus = item.status === "COMPLETE" ? "PENDING" : "COMPLETE";
        return { ...item, status: nextStatus as "COMPLETE" | "PENDING" };
      }
      return item;
    });
    onUpdate(newItems);
  };

  const handleLabelChange = (id: string, label: string) => {
    if (!onUpdate) return;
    onUpdate(items.map(item => item.id === id ? { ...item, label } : item));
  };

  const addItem = () => {
    if (!onUpdate) return;
    onUpdate([...items, { id: Date.now().toString(), label: "YENİ GÖREV", status: "PENDING" }]);
  };

  const removeItem = (id: string) => {
    if (!onUpdate) return;
    onUpdate(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4 font-label">
      <h3 className="mb-6 text-[10px] font-bold tracking-[0.2em] text-terminal-dim uppercase">
        KABUL KONTROL LİSTESİ
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => !isEditable && toggleItem(item.id)}
            className={`flex items-center justify-between group cursor-pointer transition-all ${
              item.status === "LOCKED" ? "opacity-50 cursor-not-allowed" : "hover:translate-x-1"
            }`}
          >
            {isEditable ? (
              <div className="flex items-center gap-2 flex-1 mr-4">
                <input
                  className="bg-transparent border-b border-terminal-dim/20 focus:border-terminal-accent focus:outline-none text-xs font-bold text-white w-full"
                  value={item.label}
                  onChange={(e) => handleLabelChange(item.id, e.target.value)}
                />
              </div>
            ) : (
              <span className="text-xs font-bold text-white uppercase tracking-tight">
                {item.label}
              </span>
            )}
            
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[9px] font-mono font-bold ${
                item.status === "COMPLETE" ? "text-terminal-dim" : 
                item.status === "PENDING" ? "text-terminal-accent" : 
                "text-terminal-dim/50"
              }`}>
                {item.status === "COMPLETE" ? "TAMAMLANDI" : 
                item.status === "PENDING" ? "BEKLİYOR" : 
                "KİLİTLİ"}
              </span>
              
              {item.status === "LOCKED" ? (
                <Lock className="h-4 w-4 text-terminal-dim" />
              ) : item.status === "COMPLETE" ? (
                <CheckSquare className="h-4 w-4 text-terminal-accent fill-terminal-accent/20" />
              ) : (
                <Square className="h-4 w-4 text-terminal-dim hover:text-terminal-accent transition-colors" />
              )}

              {isEditable && (
                 <button 
                 onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                 className="ml-2 text-terminal-dim hover:text-terminal-error opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 ×
               </button>
              )}
            </div>
          </div>
        ))}

        {isEditable && (
           <button
           onClick={addItem}
           className="w-full border border-dashed border-terminal-dim/30 py-2 text-[10px] font-bold tracking-widest text-terminal-dim hover:bg-terminal-surface-high hover:text-terminal-accent transition-all"
         >
           + KONTROL MADDESİ EKLE
         </button>
        )}
      </div>
    </div>
  );
}
