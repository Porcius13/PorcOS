"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Clock, FileText, FlaskConical, Trash2, ChevronRight, Pencil, Sparkles, ArrowRightLeft, Search, Activity, ShieldAlert, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { medDb } from "@/lib/med-db";

type MedCoreTab = "research" | "clinical" | "medvibe";

export default function MedCoreDashboard() {
  const [activeTab, setActiveTab] = useState<MedCoreTab>("clinical");
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Run migration ONCE on mount
        await medDb.migrateFromLocalStorage();
        const stored = await medDb.getAll();
        // Sort newest first (highest ID first)
        const sorted = stored.sort((a, b) => (b.id || 0) - (a.id || 0));
        setLocalItems(sorted);
      } catch (e) {
        console.error("[Dashboard] DB Load Error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleMoveItem = async (id: number, newType: string) => {
    const item = localItems.find(i => i.id === id);
    if (item) {
      const updatedItem = { ...item, type: newType, category: newType };
      await medDb.save(updatedItem);
      const updatedList = await medDb.getAll();
      const sorted = updatedList.sort((a, b) => (b.id || 0) - (a.id || 0));
      setLocalItems(sorted);
    }
  };

  const filteredLocal = localItems.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === "research") return item.type === "Research";
    if (activeTab === "medvibe") return item.type === "Med Vibe";
    return item.type === "Clinical Guide";
  });
  
  const formattedLocal = filteredLocal.map(item => ({
    ...item,
    icon: activeTab === "research" ? FlaskConical : activeTab === "medvibe" ? Sparkles : BookOpen,
  }));

  return (
    <div className="min-h-screen bg-terminal-bg text-neutral-900 dark:text-white font-body py-12 px-4 sm:px-8 selection:bg-terminal-accent selection:text-black antialiased">
      
      {/* HEADER SECTION: TERMINAL CORE */}
      <section className="mx-auto max-w-7xl mb-16 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-l-4 border-terminal-accent pl-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Activity className="h-4 w-4 text-terminal-accent animate-pulse" />
                 <span className="font-label text-[10px] font-black tracking-[0.4em] text-terminal-accent uppercase">
                   MED CORE KLİNİK ZEKA SİSTEMİ // VER.1.0
                 </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase sm:whitespace-nowrap">
                Klinik Terminal
              </h1>
              <p className="text-neutral-500 dark:text-terminal-dim font-bold text-xs uppercase tracking-widest max-w-lg leading-relaxed">
                Klinik protokoller, araştırma senkronizasyonu ve kurumsal hafıza için merkezi tıbbi zeka düğümü.
              </p>
           </div>
           
           {/* Integrated Search & Plus Bar */}
           <div className="w-full lg:max-w-md relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-terminal-dim group-focus-within:text-terminal-accent transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="TANI VEYA KATEGORİYE GÖRE KAYITLARDA ARA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-terminal-surface border border-terminal-surface-high pl-14 pr-24 py-5 text-[10px] font-bold tracking-widest text-neutral-900 dark:text-white uppercase focus:outline-none focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent transition-all placeholder-neutral-400 dark:placeholder-terminal-dim/30"
              />
              <Link
                href="/med-core/new"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-terminal-accent text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-terminal-accent/90 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                YENİ KAYIT
              </Link>
           </div>
        </div>

        {/* Tab Selection: Technical Toggles */}
        <div className="flex flex-wrap items-center gap-4 border-t border-terminal-surface-high pt-8">
           <TabButton 
             active={activeTab === 'clinical'} 
             onClick={() => setActiveTab('clinical')}
             label="KLİNİK REHBERLER"
             count={localItems.filter(i => i.type === "Clinical Guide" || (!i.type && !i.category)).length}
           />
           <TabButton 
             active={activeTab === 'research'} 
             onClick={() => setActiveTab('research')}
             label="ARAŞTIRMA MOTORU"
             count={localItems.filter(i => i.type === "Research").length}
           />
           <TabButton 
             active={activeTab === 'medvibe'} 
             onClick={() => setActiveTab('medvibe')}
             label="MED VIBE SOSYAL"
             count={localItems.filter(i => i.type === "Med Vibe").length}
           />
        </div>
      </section>

      {/* CORE ASYMMETRIC GRID: DIGITAL CASE FILES (Pinterest Style) */}
      <main className="mx-auto max-w-7xl">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-6">
             <Loader2 className="h-12 w-12 animate-spin text-terminal-accent" />
             <span className="font-label text-[10px] font-black tracking-widest uppercase">SİSTEM_VERİTABANI_SENKRONİZASYONU_SÜRÜYOR</span>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
            <AnimatePresence mode="popLayout">
              {formattedLocal.length > 0 ? (
                formattedLocal.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id}
                    className="break-inside-avoid mb-8 bg-terminal-surface relative group overflow-hidden hover:bg-terminal-surface-high transition-all duration-500 border border-terminal-surface-high shadow-xl"
                  >
                    <Link href={`/med-core/${item.id}`} className="block relative h-full">
                       {/* Case File Cover Image (Full Aspect Ratio) */}
                       {item.image && (
                          <div className="relative w-full overflow-hidden border-b border-terminal-surface-high bg-black">
                             <img 
                               src={item.image} 
                               alt={item.title} 
                               className="w-full h-auto transition-all duration-700 group-hover:scale-110"
                             />
                             <div className="absolute top-4 left-4 px-2 py-0.5 bg-terminal-accent text-black font-label text-[8px] font-black uppercase tracking-widest">
                              GÖRSEL_KİMLİK_AKTİF
                             </div>
                          </div>
                       )}
                       
                       <div className="p-10 space-y-8 relative z-10 bg-gradient-to-b from-transparent to-black/20">
                          <div className="flex items-start justify-between">
                             <div className="w-12 h-12 bg-terminal-bg flex items-center justify-center text-terminal-accent group-hover:bg-terminal-accent group-hover:text-black transition-all duration-500">
                                <item.icon className="h-6 w-6" />
                             </div>
                             <div className="text-right">
                              <span className="block font-label text-[9px] font-black text-neutral-500 dark:text-terminal-dim uppercase tracking-widest">KAYIT ID</span>
                              <span className="block font-label text-[10px] font-bold text-neutral-900 dark:text-white tabular-nums">{item.id.toString().slice(-6)}</span>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <span className="font-label text-[10px] font-bold text-terminal-accent tracking-[0.2em] uppercase">
                             {item.category || item.type || "KLİNİK PROTOKOL"}
                           </span>
                           <h3 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight uppercase group-hover:translate-x-2 transition-transform duration-500">
                              {item.title}
                           </h3>
                        </div>

                        <div className="pt-8 border-t border-terminal-surface-high flex items-center justify-between">
                           <div className="flex items-center gap-4 text-[9px] font-bold text-neutral-500 dark:text-terminal-dim uppercase tracking-widest">
                              <Clock className="h-3 w-3" />
                              {item.date || "SENKRONİZE"} // {item.readTime || "5 dk okuma"}
                           </div>
                           <ChevronRight className="h-4 w-4 text-neutral-500 dark:text-terminal-dim group-hover:text-terminal-accent transition-all group-hover:translate-x-1" />
                        </div>
                       </div>
                    </Link>
                    
                    {/* Floating Action Menu */}
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
                       <button 
                         onClick={(e) => { e.preventDefault(); router.push(`/med-core/new?id=${item.id}`); }}
                         className="p-2 bg-terminal-bg text-terminal-dim hover:text-white transition-colors border border-terminal-dim/20 shadow-lg"
                       >
                          <Pencil className="h-3.5 w-3.5" />
                       </button>
                       <button 
                         onClick={async (e) => {
                           e.preventDefault();
                           if (confirm("Kaydı silmek istediğinize emin misiniz?")) {
                             setLoading(true);
                             await medDb.delete(item.id);
                             const updatedList = await medDb.getAll();
                             setLocalItems(updatedList);
                             setLoading(false);
                           }
                         }}
                         className="p-2 bg-terminal-bg text-terminal-dim hover:text-terminal-error transition-colors border border-terminal-dim/20 shadow-lg"
                       >
                          <Trash2 className="h-3.5 w-3.5" />
                       </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-terminal-bg border border-dashed border-terminal-surface-high w-full">
                   <ShieldAlert className="h-12 w-12 text-terminal-dim mx-auto mb-6 opacity-20" />
                   <p className="font-label text-[10px] font-bold text-terminal-dim tracking-widest uppercase">
                      MEVCUT FİLTREYE UYGUN KAYIT BULUNAMADI
                   </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FOOTER: SYSTEM STATUS */}
      <footer className="mx-auto max-w-7xl mt-24 border-t border-terminal-surface-high pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
         <div className="flex items-center gap-8">
            <div className="flex flex-col">
               <span className="font-label text-[8px] font-black text-terminal-dim uppercase tracking-widest">SİSTEM_BÜTÜNLÜĞÜ</span>
               <span className="font-label text-[10px] font-bold text-terminal-accent uppercase">ŞİFRELİ_VE_GÜVENLİ</span>
            </div>
            <div className="h-8 w-[1px] bg-terminal-surface-high hidden md:block" />
            <div className="flex flex-col">
               <span className="font-label text-[8px] font-black text-terminal-dim uppercase tracking-widest">LİSANS_TİPİ</span>
               <span className="font-label text-[10px] font-bold text-white uppercase">HEKİM_TERMİNALİ_V1</span>
            </div>
         </div>
         <p className="font-label text-[9px] font-black text-terminal-dim/40 uppercase tracking-[0.3em]">
            © 2026_MED_CORE_KLİNİK_ZEKA // SOVEREIGN_EXPLORER_PROTOKOLLERİ
         </p>
      </footer>

    </div>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-4 text-[10px] font-black tracking-[0.2em] transition-all flex items-center gap-4 border-b-2 ${
        active 
          ? "bg-terminal-surface border-terminal-accent text-neutral-900 dark:text-white" 
          : "border-transparent text-neutral-500 dark:text-terminal-dim hover:text-neutral-900 dark:hover:text-white hover:bg-terminal-surface-high"
      }`}
    >
      <span>{label}</span>
      <span className={`px-2 py-0.5 text-[8px] tabular-nums ${active ? 'bg-terminal-accent text-black' : 'bg-terminal-surface-high text-neutral-500 dark:text-terminal-dim font-bold'}`}>
        {count.toString().padStart(2, '0')}
      </span>
    </button>
  );
}
