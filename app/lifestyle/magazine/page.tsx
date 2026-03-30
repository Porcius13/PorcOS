"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Clock, Trash2, BookOpen, Search, Filter, Pencil } from "lucide-react";
import MagazineReader from "@/components/lifestyle/MagazineReader";
import { AnimatePresence, motion } from "framer-motion";

export default function MagazinePage() {
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [readingMagazineId, setReadingMagazineId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
      setLocalItems(stored.filter((item: any) => item.type === "Magazine"));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const filteredItems = localItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Digital Library</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
            Magazine <span className="text-amber-600">Archive</span>
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 max-w-md italic">
            Kişisel dijital dergi koleksiyonun. Yüksek çözünürlüklü flipbook deneyimi ile okumaya devam et.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text"
              placeholder="Arşivde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all w-64"
            />
          </div>
          <Link
            href="/lifestyle/magazine/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-neutral-900/20 transition-all hover:scale-[1.02] active:scale-95 dark:bg-neutral-50 dark:text-neutral-950"
          >
            <Plus className="h-4 w-4" />
            Yükle
          </Link>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id}
              onClick={() => setReadingMagazineId(item.id)}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white p-3 shadow-sm transition-all hover:shadow-2xl hover:shadow-amber-500/10 dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer"
            >
              {/* Actions Area */}
              <div className="absolute right-6 top-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link
                  href={`/lifestyle/magazine/new?id=${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-neutral-500 shadow-xl backdrop-blur-md transition-all hover:bg-amber-50 hover:text-amber-500 dark:bg-neutral-900/80 dark:text-neutral-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                >
                  <Pencil className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm("Bu dergiyi koleksiyondan silmek istediğinize emin misiniz?")) {
                      const allItems = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
                      const updated = allItems.filter((i: any) => i.id !== item.id);
                      localStorage.setItem("lifestyleItems", JSON.stringify(updated));
                      setLocalItems(localItems.filter(i => i.id !== item.id));
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-neutral-500 shadow-xl backdrop-blur-md transition-all hover:bg-rose-50 hover:text-rose-500 dark:bg-neutral-900/80 dark:text-neutral-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Cover Image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-neutral-400">
                    <BookOpen size={48} className="opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Cover</span>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-8">
                  <div className="w-full flex items-center justify-between">
                    <div className="px-4 py-2 bg-white rounded-xl text-black text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Read Now
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col p-6">
                <h3 className="line-clamp-1 text-xl font-black text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
                
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <span>{item.readTime || "0 Sayfa"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Added 2026</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[3rem] bg-white/50 dark:bg-neutral-900/50">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 mb-6 animate-bounce">
            <BookOpen size={40} />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mb-2">Kütüphanen henüz boş</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-medium">İlk dijital dergini yükleyerek hemen başlayabilirsin.</p>
          <Link
            href="/lifestyle/magazine/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-amber-600/20 transition-all hover:scale-[1.05] active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Hemen Yükle
          </Link>
        </div>
      )}

      <AnimatePresence>
        {readingMagazineId && (
          <MagazineReader 
            magazineId={readingMagazineId} 
            onClose={() => setReadingMagazineId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
