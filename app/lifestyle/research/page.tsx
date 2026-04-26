"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ResearchCard } from "@/components/lifestyle/ResearchCard";
import { ThemeToggle } from "@/components/theme-toggle";
import { NewResearchModal } from "@/components/lifestyle/NewResearchModal";
import { ZenMode } from "@/components/lifestyle/ZenMode";
import { researchDb, ResearchData } from "@/components/lifestyle/lib/research-db";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Menu, Search, Plus, SlidersHorizontal, LayoutGrid, List, Lock, Star, Settings, User, Trash2, Pencil, Sparkles, Zap } from "lucide-react";

export default function ResearchHubPage() {
  const [activeCategory, setActiveCategory] = useState("Hepsi");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResearchData | null>(null);
  const [researchItems, setResearchItems] = useState<ResearchData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResearch, setSelectedResearch] = useState<ResearchData | null>(null);

  // Dynamic Category Extraction
  const dynamicCategories = useMemo(() => {
    const defaultList = ["Teknoloji", "Gastronomi", "Fotoğrafçılık", "Verimlilik", "Mimari"];
    const fromItems = Array.from(new Set(researchItems.map(item => item.category)));
    // Merge defaults and items, filter out special keys and empty values
    const merged = Array.from(new Set([...defaultList, ...fromItems]))
      .filter(c => c && c !== "Hepsi" && c !== "Golden Words");
    
    return ["Hepsi", ...merged.sort(), "Golden Words"];
  }, [researchItems]);

  React.useEffect(() => {
    const loadItems = async () => {
      const items = await researchDb.getAllResearch();
      setResearchItems(items);
    };
    loadItems();
  }, []);

  const handleSaveResearch = async (data: any) => {
    const stats = researchDb.calculateReadTime(data.description);
    
    if (data.id) {
      // Update
      const updatedItem: ResearchData = {
        ...editingItem!,
        title: data.title,
        category: data.category,
        description: data.description,
        goldenWords: data.goldenWords,
        coverImage: data.coverImage,
        stats,
      };
      await researchDb.saveResearch(updatedItem);
      setResearchItems((prev) => prev.map(item => item.id === data.id ? updatedItem : item));
    } else {
      // Create
      const newItem: ResearchData = {
        id: Date.now().toString(),
        slug: data.title.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, ""),
        title: data.title,
        category: data.category,
        description: data.description,
        goldenWords: data.goldenWords,
        coverImage: data.coverImage,
        date: data.date || new Date().toISOString(),
        stats,
      };
      await researchDb.saveResearch(newItem);
      setResearchItems((prev) => [newItem, ...prev]);
    }
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleEditResearch = (item: ResearchData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteResearch = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Bu araştırmayı silmek istediğine emin misin?")) {
      await researchDb.deleteResearch(id);
      setResearchItems((prev) => prev.filter(item => item.id !== id));
    }
  };

  const filteredItems = useMemo(() => {
    return researchItems
      .filter(item => {
        if (activeCategory === "Golden Words") return item.goldenWords && item.goldenWords.trim() !== "";
        if (activeCategory === "Hepsi") return true;
        return item.category === activeCategory;
      })
      .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
          return timeB - timeA;
        }
        // Fallback to ID sorting (Research Hub IDs are timestamps)
        return b.id.localeCompare(a.id);
      });
  }, [researchItems, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-50 selection:bg-amber-500/20 selection:text-amber-900">
      <NewResearchModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }} 
        onSave={handleSaveResearch}
        editItem={editingItem}
        existingCategories={dynamicCategories.filter(c => !["Hepsi", "Golden Words"].includes(c))}
      />

      <ZenMode 
        item={selectedResearch} 
        onClose={() => setSelectedResearch(null)} 
      />

      <main className="pt-8 pb-32 px-4 sm:px-8 max-w-[1400px] mx-auto relative z-10 min-w-0 overflow-hidden">
        
        {/* Minimal Intelligence Action Row */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-16">
          {/* Dynamic Categories Slider */}
          <div className="flex-1 min-w-0 w-full overflow-hidden relative group">
            <motion.div 
              className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {dynamicCategories.map((cat, idx) => (
                <motion.button
                  key={cat}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 border ${
                    activeCategory === cat 
                      ? "bg-amber-500 text-black border-amber-500 shadow-xl shadow-amber-500/20 scale-105" 
                      : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:border-amber-500/50 hover:text-amber-500"
                  }`}
                >
                  {cat === "Golden Words" ? (
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-inherit" />
                      Golden Words
                    </span>
                  ) : cat}
                </motion.button>
              ))}
            </motion.div>
            
            {/* Fade edge indicators for scroll */}
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#f3f4f6] dark:from-neutral-950 to-transparent pointer-events-none" />
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto shrink-0 justify-end">
            <ThemeToggle />
            <div className="relative flex-1 xl:flex-none">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="PROBE DATABASE..." 
                className="pl-12 pr-6 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-amber-500/10 w-full xl:w-[280px] transition-all shadow-xl shadow-black/5 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-xl shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Pinterest Style Masonry Grid */}
        <div className="w-full columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
            {filteredItems.map((item) => (
                <div 
                    key={item.id} 
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedResearch(item)}
                >
                  <ResearchCard {...item} />
                  
                  {/* Floating Action Buttons for hover */}
                  <div className="absolute top-6 right-6 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={(e) => handleEditResearch(item, e)}
                      className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteResearch(item.id, e)}
                      className="w-10 h-10 bg-red-500/20 backdrop-blur-md border border-red-500/20 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Preview Blur Effect */}
                  <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[2.5rem]" />
                </div>
            ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-40 flex flex-col items-center justify-center border-4 border-dashed border-neutral-200 dark:border-neutral-900 rounded-[3rem] opacity-30">
            <Zap className="w-20 h-20 mb-8 text-amber-500 animate-pulse" />
            <p className="text-2xl font-black uppercase tracking-[0.3em]">No Data Cached</p>
            <p className="text-sm font-bold text-neutral-500 mt-4 uppercase">Initialize new capture to begin</p>
          </div>
        )}

        {/* Executive Footer */}
        <footer className="mt-40 pt-20 border-t border-neutral-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50 italic">The Protocol</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">© 2026 Personal Knowledge Architecture • Node-13</span>
          </div>
          <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
            <Link href="#" className="hover:text-amber-500 transition-colors">Manifesto</Link>
            <Link href="#" className="hover:text-amber-500 transition-colors">Archive</Link>
            <Link href="#" className="hover:text-amber-500 transition-colors">Security</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
