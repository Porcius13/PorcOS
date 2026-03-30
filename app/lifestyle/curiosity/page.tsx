"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Compass, Leaf, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CuriosityCard } from "@/components/lifestyle/CuriosityCard";
import { NewCuriosityModal } from "@/components/lifestyle/NewCuriosityModal";
import { curiosityDb, CuriosityData } from "@/components/lifestyle/lib/curiosity-db";
import { PhotoFrame } from "@/components/lifestyle/PhotoFrame";

export default function MerakLabPage() {
  const [activeCategory, setActiveCategory] = useState("Hepsi");
  const [activeStatus, setActiveStatus] = useState<string>("Hepsi");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curiosities, setCuriosities] = useState<CuriosityData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<CuriosityData | null>(null);

  const categories = ["Hepsi", "Doğa", "Bilim", "Uzay", "Hayat", "Tarih", "Rota", "Etkinlik", "Hayal"];
  const statuses = [
    { id: "Hepsi", label: "Tümü" },
    { id: "Wishlist", label: "Hayaller" },
    { id: "Planned", label: "Planlar" },
    { id: "Achieved", label: "Keşfedilenler" },
  ];

  useEffect(() => {
    const loadItems = async () => {
      const items = await curiosityDb.getAllCuriosities();
      setCuriosities(items);
    };
    loadItems();
  }, []);

  const handleSave = async (data: any) => {
    const stats = curiosityDb.calculateReadTime(data.description);
    const newItem: CuriosityData = {
      ...data,
      id: data.id || Date.now().toString(),
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      date: data.date || new Date().toISOString(),
      stats
    };
    await curiosityDb.saveCuriosity(newItem);
    setCuriosities(prev => {
      const filtered = prev.filter(p => p.id !== newItem.id);
      return [newItem, ...filtered];
    });
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleStatusToggle = async (id: string, newStatus: 'Wishlist' | 'Planned' | 'Achieved') => {
    const item = curiosities.find(c => c.id === id);
    if (item) {
      const updatedItem = { ...item, status: newStatus };
      await curiosityDb.saveCuriosity(updatedItem);
      setCuriosities(prev => prev.map(p => p.id === id ? updatedItem : p));
    }
  };

  const filteredItems = useMemo(() => {
    return curiosities
      .filter(item => {
        const matchesCategory = activeCategory === "Hepsi" || item.category === activeCategory;
        const matchesStatus = activeStatus === "Hepsi" || item.status === activeStatus;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [curiosities, activeCategory, activeStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fcf9f2] font-body text-neutral-900 selection:bg-amber-100 selection:text-amber-900 leading-relaxed transition-colors duration-1000 relative overflow-x-hidden">
      
      {/* Atmospheric Glows & Canvas Texture (Strictly Background) */}
      <div className="absolute inset-0 pointer-events-none -z-20 bg-[radial-gradient(circle_at_center,rgba(255,222,169,0.08)_0%,rgba(21,30,22,0.03)_50%,transparent_80%)]"></div>
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}></div>

      {/* Seamless Photo Ribbon Frame (High Priority Z) */}
      <PhotoFrame />

      <NewCuriosityModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }} 
        onSave={handleSave}
        editItem={editingItem}
      />

      <main className="relative z-30 min-h-screen flex flex-col items-center py-32 px-24 sm:px-32 lg:px-48 pb-[25vh] max-w-[1920px] mx-auto animate-in fade-in duration-1000">
        
        {/* Branding & Hero Section */}
        <div className="text-center mb-16 space-y-10 max-w-4xl pt-20">
           <div className="space-y-4">
              <span className="font-label uppercase tracking-[0.5em] text-[10px] text-amber-900/40 font-bold block">Identity & Legacy</span>
              <h1 className="font-headline font-light italic text-7xl md:text-9xl text-[#1c1c18] leading-tight tracking-tighter">
                Explorer Protocol
              </h1>
           </div>
           <div className="w-16 h-[1px] bg-[#1c1c18]/20 mx-auto"></div>
        </div>

        {/* Minimal Search & Action Row */}
        <div className="w-full max-w-2xl mb-24 flex items-center gap-4">
           <div className="flex-1 bg-[#fcf9f2]/80 backdrop-blur-md border border-neutral-200/30 rounded-sm p-1 shadow-2xl flex items-center px-6 group focus-within:ring-1 ring-[#1c1c18]/10 transition-all">
              <Search className="text-neutral-900/20 group-focus-within:text-neutral-900 transition-colors w-5 h-5" />
              <input 
                type="text" 
                placeholder="Traverse the archives..." 
                className="w-full bg-transparent border-none focus:ring-0 text-neutral-900 placeholder-neutral-900/30 font-light tracking-wide px-4 py-5 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-16 h-16 bg-[#1c1c18] dark:bg-[#fcf9f2] text-white dark:text-[#1c1c18] rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 transition-all duration-500 group shrink-0"
           >
             <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
           </button>
        </div>

        {/* Status Filters Only */}
        <div className="flex flex-col gap-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
           <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto mb-20 p-2 bg-[#1c1c18]/5 rounded-full overflow-hidden">
             {statuses.map((s) => (
               <button
                 key={s.id}
                 onClick={() => setActiveStatus(s.id)}
                 className={`px-10 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-500 ${
                   activeStatus === s.id 
                     ? "bg-white text-neutral-900 shadow-sm" 
                     : "text-neutral-400 hover:text-neutral-600"
                 }`}
               >
                 {s.label}
               </button>
             ))}
           </div>
        </div>

        {/* Masonry Grid of Discoveries */}
        <div className="w-full columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-12 space-y-12 mb-40">
            {filteredItems.map((item) => (
                <div key={item.id} className="break-inside-avoid" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}>
                  <CuriosityCard 
                    {...item} 
                    onStatusToggle={handleStatusToggle}
                  />
                </div>
            ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-40 w-full flex flex-col items-center justify-center border-2 border-dashed border-amber-900/10 rounded-[3rem] opacity-30">
            <Compass className="w-20 h-20 mb-8 text-amber-900/20" />
            <p className="text-xl font-headline italic text-amber-900/40 text-center">Terra Incognita</p>
            <p className="text-[10px] font-bold text-amber-900/30 mt-4 uppercase tracking-[0.3em]">No discoveries logged in this sector</p>
          </div>
        )}

        {/* Footer */}
        <footer className="w-full mt-40 pt-20 border-t border-amber-900/10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-3xl font-headline font-light italic text-[#1c1c18] flex items-center gap-3">
                <Leaf className="w-8 h-8 text-neutral-900/20" />
                Merak Lab
            </span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">© 2026 Personal Knowledge Architecture</span>
          </div>
          <div className="flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
            <Link href="/lifestyle/research" className="hover:text-neutral-900 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                ResHub
            </Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">Explorer</Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">Vault</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
