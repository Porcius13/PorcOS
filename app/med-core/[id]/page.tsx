"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/navigation";
import { ArrowLeft, Clock, ShieldAlert, Activity, Monitor, Microscope, ClipboardList, Pill, Info, ChevronRight, List, Loader2, BookOpen, Layers, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveAnatomy } from "@/components/interactive-anatomy";
import { DifferentialTable } from "@/components/med-core/DifferentialTable";
import { PatientChecklist } from "@/components/med-core/PatientChecklist";
import { SmartTopicBlueprint } from "@/components/med-core/SmartTopicBlueprint";
import { smartSanitize } from "@/lib/medical-sanitizer";
import { medDb } from "@/lib/med-db";

type DetailTab = "clinical" | "research";


export default function MedCoreDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("clinical");

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      try {
        const found = await medDb.getById(id);
        if (found) {
          setItem(found);
          // Auto-switch to research tab for non-clinical types
          if (found.type === "Research" || found.type === "Med Vibe") {
            setActiveTab("research");
          }
        }
      } catch (e) {
        console.error("[Detail] Load Error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-terminal-bg gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-terminal-accent" />
        <span className="font-label text-[10px] font-black tracking-widest uppercase">SİSTEM_KAYIT_PROTOKOLÜ_OKUNUYOR</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-terminal-bg gap-6 p-12 text-center">
        <ShieldAlert className="h-16 w-16 text-terminal-error animate-pulse" />
        <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-widest uppercase">PROTOKOL_BULUNAMADI</h2>
        <button 
          onClick={() => router.push("/med-core")}
          className="text-neutral-500 dark:text-terminal-dim hover:text-terminal-accent font-bold tracking-widest text-xs border border-terminal-surface-high px-6 py-3 uppercase transition-all"
        >
          <ArrowLeft className="inline h-4 w-4 mr-2" /> PANELA_DÖN
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-neutral-900 dark:text-white font-body selection:bg-terminal-accent selection:text-black antialiased">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-terminal-surface-high bg-terminal-bg/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push("/med-core")} 
            className="text-neutral-500 dark:text-terminal-dim hover:text-neutral-900 dark:hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-label text-[10px] font-bold tracking-widest uppercase">TERMİNALE DÖN</span>
          </button>
          <div className="h-4 w-[1px] bg-terminal-surface-high" />
          <span className="font-label text-[10px] font-bold text-terminal-accent tracking-widest uppercase">
            PROTOKOL {item.id} // GÜVENLİ ERİŞİM
          </span>
        </div>
        <div className="flex items-center gap-4 text-neutral-500 dark:text-terminal-dim text-[10px] font-bold uppercase tabular-nums">
           {item.date || "ŞİMDİ"} // {item.readTime || "GERÇEK ZAMANLI"}
        </div>
      </nav>

      <div className="mx-auto max-w-[1600px] p-8">
        {item.type === "Clinical Guide" ? (
          <SurgicalView item={item} activeTab={activeTab} setActiveTab={setActiveTab} router={router} />
        ) : (
          <ClassicResearchView item={item} router={router} />
        )}
      </div>
    </div>
  );
}

function SurgicalView({ item, activeTab, setActiveTab, router }: { item: any; activeTab: string; setActiveTab: (t: any) => void; router: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* LEFT COLUMN: PRIMARY WORKSTATION (9 Columns) */}
      <div className="lg:col-span-9 space-y-8">
        {/* Header Section */}
        <header className="relative overflow-hidden border-l-8 border-terminal-accent bg-terminal-surface p-10 shadow-2xl">
          {item.image && (
             <div className="absolute inset-0 z-0 opacity-40 transition-all duration-700">
                <img src={item.image} alt="Background" className="w-full h-full object-cover" />
             </div>
          )}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-terminal-accent animate-pulse" />
               <span className="font-label text-[10px] font-black tracking-[0.3em] text-terminal-accent uppercase">
                 KLİNİK ZEKA RAPORU // SURGICAL_MODE
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-tight">
              {item.title}
            </h1>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-[0.05] pointer-events-none">
             <Microscope className="h-80 w-80" />
          </div>
        </header>
        
        {/* GLOBAL INSIGHT: GOLDEN WORDS */}
        {item.goldenWords && (
          <section className="bg-terminal-accent/5 border-l-8 border-terminal-accent p-8 relative overflow-hidden group hover:bg-terminal-accent/10 transition-all duration-500 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-4 w-4 text-terminal-accent animate-pulse" />
                <span className="font-label text-[10px] font-black tracking-[0.3em] text-terminal-accent uppercase">
                  ALTIN NOTLAR // KLİNİK İNCİLER
                </span>
             </div>
             <div 
               className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white leading-relaxed italic rich-content-display"
               dangerouslySetInnerHTML={{ __html: smartSanitize(item.goldenWords) }}
             />
          </section>
        )}

        {/* WORKSTATION TABS */}
        <div className="flex items-center gap-px bg-terminal-surface-high p-1 border border-terminal-surface-high relative">
           <button
             onClick={() => setActiveTab("clinical")}
             className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
               activeTab === "clinical" ? "bg-terminal-accent text-black shadow-lg" : "text-neutral-500 dark:text-terminal-dim hover:text-neutral-900 dark:hover:text-white hover:bg-terminal-surface"
             }`}
           >
             <Layers className="h-4 w-4" />
             01 KLİNİK VERİLER
           </button>
           <button
             onClick={() => setActiveTab("research")}
             className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
               activeTab === "research" ? "bg-terminal-accent text-black shadow-lg" : "text-neutral-500 dark:text-terminal-dim hover:text-neutral-900 dark:hover:text-white hover:bg-terminal-surface"
             }`}
           >
             <BookOpen className="h-4 w-4" />
             02 ARAŞTIRMA ANALİZİ
           </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "clinical" ? (
            <motion.div 
              key="clinical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
               <section className="space-y-4">
                  <DifferentialTable rows={item.differentialRows || []} />
               </section>

               <section className="flex flex-col gap-10">
                   <div id="01-sikayet">
                     <TechnicalBlock label="01 ŞİKAYET" icon={<ClipboardList className="h-4 w-4" />} content={item.complaint || "VERİ YOK"} />
                   </div>
                   <div id="02-fizik-muayene">
                     <TechnicalBlock label="02 FİZİK MUAYENE" icon={<Activity className="h-4 w-4" />} content={item.exam || "VERİ YOK"} />
                   </div>
                   <div id="03-laboratuvar">
                     <TechnicalBlock label="03 LABORATUVAR" icon={<Microscope className="h-4 w-4" />} content={item.labs || "VERİ YOK"} accent />
                   </div>
                   <div id="04-goruntuleme">
                     <TechnicalBlock label="04 GÖRÜNTÜLEME" icon={<Monitor className="h-4 w-4" />} content={item.imaging || "VERİ YOK"} />
                   </div>
                   <div id="05-acil-tedavi-plani">
                     <TechnicalBlock label="05 ACİL TEDAVİ PLANI" icon={<Activity className="h-4 w-4" />} content={item.erOrders || item.order || "VERİ YOK"} isOrderSection />
                   </div>
                   <div id="06-recete">
                     <TechnicalBlock label="06 REÇETE" icon={<Pill className="h-4 w-4" />} content={item.prescription || "VERİ YOK"} />
                   </div>
                   <div id="07-hasta-egitimi">
                     <TechnicalBlock label="07 HASTA EĞİTİMİ" icon={<Info className="h-4 w-4" />} content={item.erEducation || item.redFlags || "VERİ YOK"} />
                   </div>
                   <div id="08-klinik-gorsel" className="bg-terminal-surface border-l-4 border-terminal-surface-high flex flex-col items-center justify-center p-12 overflow-hidden group min-h-[300px] relative shadow-2xl">
                      {item.image ? (
                        <img src={item.image} alt="Ref" className="w-full max-w-4xl h-full object-contain transition-all duration-700 hover:scale-105" />
                      ) : (
                        <div className="text-neutral-500 dark:text-terminal-dim text-[10px] font-black uppercase text-center flex flex-col items-center gap-4">
                          <Monitor className="h-12 w-12 opacity-20" /> GÖRSEL_VERİ_YOK
                        </div>
                      )}
                      <div className="absolute top-6 left-6 font-label text-[10px] font-black text-terminal-accent tracking-[0.4em] uppercase opacity-40">08 KLİNİK GÖRSEL</div>
                   </div>
               </section>
            </motion.div>
          ) : (
             <motion.div 
               key="research"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-8"
             >
                <div className="bg-terminal-surface p-12 border border-terminal-surface-high">
                   {(item.fullResearch || item.researchContent || item.medVibeContent) ? (
                     <div className="prose prose-invert prose-base max-w-none opacity-90 leading-relaxed font-light">
                        <div dangerouslySetInnerHTML={{ __html: smartSanitize(item.fullResearch || item.researchContent || item.medVibeContent) }} />
                     </div>
                   ) : (
                     <div className="py-20 text-center text-neutral-500 dark:text-terminal-dim font-bold uppercase tracking-widest text-xs">
                        BU_VAKAYA_AİT_ARAŞTIRMA_PROTOKOLÜ_BULUNAMADI
                     </div>
                   )}
                </div>
                {(item.sources || item.medVibeSources) && (
                  <TechnicalBlock label="KAYNAKLAR // CITATIONS" icon={<BookOpen className="h-4 w-4" />} content={item.sources || item.medVibeSources} />
                )}
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT COLUMN: SIDEBAR */}
      <aside className="lg:col-span-3 space-y-8 sticky top-24 h-fit">
        <div className="bg-terminal-surface p-8 border border-terminal-surface-high shadow-xl">
           <PatientChecklist items={item.checklistItems || []} />
        </div>
        <div className="bg-terminal-surface p-8 border border-terminal-surface-high shadow-xl">
           <SmartTopicBlueprint />
        </div>
        <div className="bg-terminal-bg p-8 border border-terminal-surface-high flex flex-col gap-4">
          <button onClick={() => router.push(`/med-core/new?id=${item.id}`)} className="w-full bg-terminal-surface-high hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-black text-neutral-900 dark:text-white font-black py-4 transition-all tracking-widest uppercase text-[10px]">KAYDI DÜZENLE</button>
          <button onClick={() => window.print()} className="w-full bg-terminal-accent/10 border border-terminal-accent text-terminal-accent hover:bg-terminal-accent hover:text-black font-black py-4 transition-all tracking-widest uppercase text-[10px]">KLİNİK RAPOR OLUŞTUR</button>
        </div>
      </aside>
    </div>
  );
}

function ClassicResearchView({ item, router }: { item: any; router: any }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const content = item.researchContent || item.medVibeContent || item.fullResearch || "";
  
  // Dynamic TOC Generation: Scan for H2 tags and inject IDs
  const headings: { id: string; text: string }[] = [];
  const processedContent = content.replace(/<h2(.*?)>(.*?)<\/h2>/gi, (match: string, attrs: string, text: string) => {
    // Strip HTML tags from the text for display (remove spans, etc. from Google Docs)
    const cleanText = text.replace(/<[^>]*>?/gm, "").trim();
    const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    headings.push({ id, text: cleanText });
    return `<h2 id="${id}" ${attrs}>${text}</h2>`;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-32">
       {/* MAIN ARTICLE (9 COLUMNS) */}
       <div className="lg:col-span-9 space-y-12">
          <header className="bg-terminal-surface border-l-8 border-terminal-accent p-12 shadow-2xl relative overflow-hidden">
             <div className="inline-flex items-center gap-2 text-terminal-accent mb-6">
                <BookOpen className="h-4 w-4" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase">{item.type} // ARCHIVE_CLASSIC</span>
             </div>
             <h1 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white leading-tight uppercase tracking-tight relative z-10">
               {item.title}
             </h1>
             <div className="flex items-center gap-6 mt-8 text-terminal-dim text-[10px] font-bold uppercase tracking-widest relative z-10">
                <div className="flex items-center gap-2">
                   <Clock className="h-3.5 w-3.5" />
                   {item.date || "ŞİMDİ"}
                </div>
                <div>// {item.readTime || "5 MIN"} READ</div>
             </div>
             <div className="absolute -bottom-10 -right-10 opacity-[0.05] pointer-events-none">
                <BookOpen className="h-80 w-80" />
             </div>
          </header>

          <article className="bg-terminal-surface border border-terminal-surface-high shadow-2xl p-10 md:p-20 relative">
             <div className="prose prose-invert prose-xl max-w-none opacity-90 leading-relaxed font-light rich-content-display">
                <div dangerouslySetInnerHTML={{ __html: smartSanitize(processedContent) }} />
             </div>
             
             {/* Terminal End Watermark */}
             <div className="mt-20 pt-10 border-t border-terminal-surface-high flex items-center justify-between opacity-20 text-[10px] font-black tracking-widest uppercase">
                <span>END_OF_RECORD // {item.id}</span>
                <div className="flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-terminal-accent" />)}
                </div>
             </div>
          </article>

          {/* GOLDEN WORDS: SYNTHESIS BRIDGE (MOVED HERE) */}
          {item.goldenWords && (
            <section id="golden-words-bridge" className="bg-terminal-accent/5 p-8 lg:p-12 border-l-4 border-terminal-accent shadow-2xl relative overflow-hidden group hover:bg-terminal-accent/10 transition-all duration-300">
               <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-4 w-4 text-terminal-accent animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.4em] text-terminal-accent uppercase">
                    KRİTİK SENTEZ // ALTIN NOTLAR
                  </span>
               </div>
               <div 
                 className="text-base md:text-[18px] font-bold text-neutral-800 dark:text-neutral-200 leading-relaxed italic rich-content-display opacity-90"
                 dangerouslySetInnerHTML={{ __html: smartSanitize(item.goldenWords) }}
               />
               <div className="absolute -bottom-4 -right-4 opacity-[0.02] pointer-events-none">
                  <Activity className="h-32 w-32" />
               </div>
            </section>
          )}

          {/* SOURCES / CITATIONS */}
          {(item.sources || item.medVibeSources) && (
            <div className="bg-terminal-bg p-12 border-t-4 border-terminal-accent/20 shadow-xl">
               <h4 className="text-[10px] font-black text-terminal-accent tracking-[0.4em] uppercase mb-8">REFERANSLAR // KAYNAKÇA // CITATIONS</h4>
               <div 
                 className="text-sm font-medium text-neutral-600 dark:text-terminal-dim/80 leading-loose rich-content-display"
                 dangerouslySetInnerHTML={{ __html: smartSanitize(item.sources || item.medVibeSources) }}
               />
            </div>
          )}
       </div>

       {/* RIGHT SIDEBAR (3 COLUMNS) */}
       <aside className="lg:col-span-3 space-y-8 sticky top-24 h-fit">
          {/* NAVIGATION AND INSIGHTS SIDEBAR */}
          <div className="bg-terminal-surface p-8 border border-terminal-surface-high shadow-xl">
             <h4 className="text-[10px] font-black text-terminal-accent tracking-[0.4em] uppercase border-b border-terminal-accent/30 pb-4 mb-6">
               DİNAMİK KONU NAVİGASYONU
             </h4>
             
             {/* Special Jump Node for Golden Words */}
             {item.goldenWords && (
               <button
                 onClick={() => {
                    setActiveId("golden-words");
                    const el = document.getElementById("golden-words-bridge");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className={`w-full text-left group flex items-start gap-3 py-4 px-4 border-b-2 border-terminal-accent/30 mb-4 transition-all duration-300 ${
                    activeId === "golden-words" 
                    ? "bg-terminal-accent text-black shadow-2xl translate-x-1" 
                    : "bg-terminal-accent/10 border-terminal-accent text-terminal-accent hover:bg-terminal-accent hover:text-black"
                 }`}
               >
                 <Sparkles className={`h-4 w-4 ${activeId === "golden-words" ? "text-black" : "text-terminal-accent animate-pulse"}`} />
                 <span className="text-[11px] font-black uppercase tracking-widest">ALTIN NOTLAR</span>
               </button>
             )}

             <nav className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {headings.map((h, i) => (
                   <button
                     key={h.id}
                     onClick={() => {
                        setActiveId(h.id);
                        const el = document.getElementById(h.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className={`w-full text-left group flex items-start gap-3 py-3 px-4 border-b border-terminal-surface-high/20 transition-all duration-300 ${
                        activeId === h.id 
                        ? "bg-terminal-accent/10 border-l-4 border-l-terminal-accent shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.1)] translate-x-1" 
                        : "hover:border-terminal-accent/50 hover:bg-terminal-bg/50"
                     }`}
                   >
                     <span className={`text-[9px] font-black transition-colors ${activeId === h.id ? "text-terminal-accent" : "text-terminal-accent/40 group-hover:opacity-100"}`}>0{i+1}</span>
                     <span className={`text-[10px] font-bold uppercase transition-colors ${activeId === h.id ? "text-neutral-900 dark:text-white" : "text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white"}`}>
                        {h.text}
                     </span>
                   </button>
                 ))}
               </nav>
             </div>

             {/* GLOBAL ACTIONS */}
             <div className="flex flex-col gap-4 pt-4 border-t border-terminal-surface-high/20">
                <button 
                  onClick={() => router.push(`/med-core/new?id=${item.id}`)}
                  className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black font-black py-4 tracking-[0.5em] uppercase text-[10px] hover:bg-terminal-accent hover:text-black transition-all shadow-xl"
                >
                  DÖKÜMANI DÜZENLE
                </button>
             </div>
          </aside>
       </div>
    );
 }


function TechnicalBlock({ label, icon, content, accent = false, isOrderSection = false }: { label: string, icon: React.ReactNode, content: string, accent?: boolean, isOrderSection?: boolean }) {
  if (!content) return null;
  
  return (
    <div className={`bg-terminal-surface p-12 lg:p-16 border-l-4 border-terminal-surface-high shadow-xl group hover:bg-terminal-bg/50 transition-all duration-500 flex flex-col relative`}>
       <div className="flex items-center gap-4 mb-10 text-neutral-400 dark:text-terminal-dim/60 group-hover:text-terminal-accent transition-colors">
         {icon}
         <h3 className="font-label text-xs font-black uppercase tracking-[0.4em]">{label}</h3>
       </div>
       <div 
         className={`text-[16px] lg:text-[18px] font-medium leading-[2] font-body whitespace-pre-wrap max-w-5xl ${accent ? 'text-terminal-accent font-bold' : 'text-neutral-800 dark:text-neutral-200'} ${isOrderSection ? 'font-mono text-base bg-terminal-bg/30 p-8 border border-terminal-surface-high' : ''}`}
         dangerouslySetInnerHTML={{ __html: smartSanitize(content) }}
       />
       
       {/* Diagnostic corner watermark */}
       <div className="absolute top-4 right-6 font-mono text-[8px] opacity-20 font-bold tracking-tighter text-terminal-accent">
          SİSTEM_DÜĞÜM_DEĞERİ_04
       </div>
    </div>
  );
}
