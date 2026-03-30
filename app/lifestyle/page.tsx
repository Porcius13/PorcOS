"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Fish, Wine, Clock, Trash2, BookOpen, Pencil, X } from "lucide-react";
import MagazineReader from "@/components/lifestyle/MagazineReader";

type LifestyleTab = "spearfishing" | "bar";

export default function LifestyleDashboard() {
  const [activeTab, setActiveTab] = useState<LifestyleTab>("spearfishing");
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [readingMagazineId, setReadingMagazineId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
      setLocalItems(stored);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const filteredLocal = localItems.filter(item => 
    activeTab === "spearfishing" ? item.type === "Spearfishing" : item.type === "The Bar"
  );
  
  const formattedLocal = filteredLocal.map(item => ({
    ...item,
    color: activeTab === "spearfishing" 
      ? "bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400" 
      : "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    icon: activeTab === "spearfishing" ? Fish : Wine
  }));

  const displayedItems = formattedLocal;

  const handleDelete = (id: number) => {
    if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      const updated = localItems.filter(i => i.id !== id);
      localStorage.setItem("lifestyleItems", JSON.stringify(updated));
      setLocalItems(updated);
    }
  };

  return (
    <div className="mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1">
            Lifestyle Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Mera maceralarınız ve favori kokteyl notlarınız burada vizualize edilir.
          </p>
        </div>
        <Link
          href="/lifestyle/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Yeni Ekle
        </Link>
      </div>

      <div className="mb-8 inline-flex rounded-full border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => setActiveTab("spearfishing")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            activeTab === "spearfishing"
              ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          }`}
        >
          Mera & Derin Mavi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bar")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            activeTab === "bar"
              ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          }`}
        >
          The Bar
        </button>
        <Link
          href="/lifestyle/research"
          className="rounded-full px-5 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors"
        >
          Yaşama Dair
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer text-left"
            >
              {/* Actions Area (Hidden until hover) */}
              {item.isLocal && (
                <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href={`/lifestyle/new?id=${item.id}`}
                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-white transition-all text-neutral-600 dark:text-neutral-400 shadow-lg"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/50 backdrop-blur-md flex items-center justify-center hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-red-600 dark:text-red-400 shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="relative h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center">
                {item.image ? (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                      style={{ backgroundImage: `url('${item.image}')` }} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
                    <div className={`rounded-xl p-4 z-10 ${item.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </>
                )}
                <div className={`absolute top-4 left-4 rounded-xl p-2 z-10 shadow-sm backdrop-blur-md ${item.image ? 'bg-white/80 dark:bg-neutral-900/80' : 'bg-transparent'} text-neutral-700 dark:text-neutral-200`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-neutral-900 dark:text-neutral-100 mb-2">
                    {item.title}
                  </h3>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 gap-3">
                  <div className="inline-flex items-center gap-1.5 font-medium">
                    <Icon className="h-4 w-4" />
                    <span className="truncate max-w-[120px]">
                      {item.category}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="h-4 w-4" />
                    <span>{item.date || "Bugün"} • {item.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {readingMagazineId && (
          <MagazineReader 
            magazineId={readingMagazineId} 
            onClose={() => setReadingMagazineId(null)} 
          />
        )}

        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" 
              onClick={() => setSelectedItem(null)}
            />
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 flex flex-col max-h-[90vh]">
              {/* Cover */}
              <div className="relative h-64 shrink-0 bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center">
                {selectedItem.image ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('${selectedItem.image}')` }} 
                  />
                ) : (
                  <div className={`rounded-3xl p-8 ${selectedItem.color}`}>
                    <selectedItem.icon className="h-16 w-16" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-all border border-neutral-200/50 dark:border-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                      <selectedItem.icon className="h-3 w-3" />
                      {selectedItem.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      {selectedItem.date || "Bugün"} • {selectedItem.readTime}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
                    {selectedItem.title}
                  </h2>
                </div>

                <div className="space-y-10 prose dark:prose-invert max-w-none">
                  {selectedItem.type === "Spearfishing" ? (
                    <>
                      {selectedItem.weather && (
                        <section className="bg-neutral-50 dark:bg-neutral-950/40 p-6 rounded-3xl border border-neutral-200/50 dark:border-white/5">
                          <h4 className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-4 font-black">Wind / Weather</h4>
                          <div dangerouslySetInnerHTML={{ __html: selectedItem.weather }} className="rich-content-display" />
                        </section>
                      )}
                      {selectedItem.vibe && (
                        <section className="bg-sky-50/30 dark:bg-sky-950/20 p-6 rounded-3xl border border-sky-100 dark:border-sky-900/30">
                          <h4 className="text-[10px] uppercase tracking-[0.2em] text-sky-400 mb-4 font-black text-sky-600 dark:text-sky-400">Av & Vibe</h4>
                          <div dangerouslySetInnerHTML={{ __html: selectedItem.vibe }} className="rich-content-display" />
                        </section>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedItem.ingredients && (
                        <section className="bg-neutral-50 dark:bg-neutral-950/40 p-6 rounded-3xl border border-neutral-200/50 dark:border-white/5">
                          <h4 className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-4 font-black">Ingredients / Ratios</h4>
                          <div dangerouslySetInnerHTML={{ __html: selectedItem.ingredients }} className="rich-content-display" />
                        </section>
                      )}
                      {selectedItem.notes && (
                        <section className="bg-amber-50/30 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                          <h4 className="text-[10px] uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mb-4 font-black">Tasting Notes</h4>
                          <div dangerouslySetInnerHTML={{ __html: selectedItem.notes }} className="rich-content-display" />
                        </section>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
