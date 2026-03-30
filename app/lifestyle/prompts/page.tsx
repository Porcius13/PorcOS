"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { promptsDb, PromptData } from "@/components/lifestyle/lib/prompts-db";
import { PromptCard } from "@/components/lifestyle/PromptCard";
import { NewPromptModal } from "@/components/lifestyle/NewPromptModal";
import { 
  Zap, Search, Plus, Terminal, Sparkles, Filter, 
  LayoutGrid, List, Layers, ShieldCheck, Activity
} from "lucide-react";

export default function PromptHubPage() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<PromptData | null>(null);

  // Derive unique categories from prompts
  const dynamicCategories = ["All", ...Array.from(new Set(prompts.map(p => p.category)))].sort();

  const loadPrompts = async () => {
    try {
      const all = await promptsDb.getAllPrompts();
      setPrompts(all);
    } catch (e) {
      console.error("Failed to load prompts:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category.toUpperCase() === activeCategory.toUpperCase();
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }
    // Fallback to ID sorting for stability
    return b.id.localeCompare(a.id);
  });

  const handleEdit = (prompt: PromptData) => {
    setEditData(prompt);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu komutu kalıcı olarak silmek istediğine emin misin?")) {
      try {
        await promptsDb.deletePrompt(id);
        setPrompts(prev => prev.filter(p => p.id !== id));
      } catch (e) {
        console.error("Failed to delete prompt:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-50 selection:bg-amber-500/30 selection:text-amber-600 dark:selection:text-amber-200 transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/[0.03] dark:bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/[0.03] dark:bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2" />
      </div>

      <main className="relative z-10 pt-4 pb-32 px-6 sm:px-12 max-w-[1700px] mx-auto">
        
        {/* Minimal Action Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 border-b border-neutral-200 dark:border-white/5 pb-8 pt-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full lg:max-w-none">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeCategory === cat
                    ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20"
                    : "bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white border-neutral-200 dark:border-white/5 shadow-sm dark:shadow-none"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
             <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-neutral-600 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="QUERY DATABASE..." 
                  className="pl-12 pr-6 py-3.5 bg-white dark:bg-neutral-900/40 backdrop-blur-md border border-neutral-200 dark:border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-700 focus:ring-4 focus:ring-amber-500/10 w-full transition-all outline-none shadow-sm dark:shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => { setEditData(null); setIsModalOpen(true); }}
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 text-black font-black uppercase tracking-[0.2em] text-[9px] rounded-full shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                New Command
              </button>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-8">
            <AnimatePresence mode="popLayout">
                {filteredPrompts.map((prompt) => (
                    <PromptCard 
                        key={prompt.id} 
                        {...prompt} 
                        onEdit={handleEdit}
                        onDelete={() => handleDelete(prompt.id)}
                    />
                ))}
            </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredPrompts.length === 0 && !isLoading && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-40 flex flex-col items-center justify-center border-4 border-dashed border-neutral-200 dark:border-neutral-900 rounded-[4rem] opacity-50"
            >
                <Terminal className="w-20 h-20 mb-8 text-neutral-300 dark:text-amber-500/20" />
                <p className="text-2xl font-black uppercase tracking-[0.3em] text-neutral-300 dark:text-neutral-800">No Commands Found</p>
                <p className="text-sm font-bold mt-4 uppercase tracking-[0.1em] text-neutral-300">Database returned zero matching nodes</p>
            </motion.div>
        )}
      </main>

      <NewPromptModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadPrompts}
        editData={editData}
      />

      {/* Persistence Beacon */}
      <div className="fixed bottom-12 right-12 z-50">
        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl px-6 py-4 rounded-3xl border border-neutral-200 dark:border-white/5 shadow-2xl flex items-center gap-4 group hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-help">
            <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Active Nodes</p>
                <p className="text-lg font-black italic tracking-tighter text-amber-600 dark:text-amber-500">{prompts.length} / 128</p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 flex items-center justify-center relative shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                <Zap className="w-6 h-6 text-amber-500 fill-current" />
            </div>
        </div>
      </div>
    </div>
  );
}
