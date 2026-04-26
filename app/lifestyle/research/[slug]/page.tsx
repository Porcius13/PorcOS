"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Settings, User, Plus, List, X, BookOpen, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { researchDb } from "@/components/lifestyle/lib/research-db";
import { smartSanitize } from "@/lib/medical-sanitizer";

export default function ResearchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sections, setSections] = useState<{ id: string, title: string }[]>([]);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  
  const { processedContent, processedGoldenWords } = useMemo(() => {
    if (!item) return { processedContent: "", processedGoldenWords: "" };
    
    return {
      processedContent: smartSanitize(item.description),
      processedGoldenWords: smartSanitize(item.goldenWords || "")
    };
  }, [item]);

  useEffect(() => {
    const loadItem = async () => {
      if (slug) {
        const found = await researchDb.getResearchBySlug(slug);
        
        if (found) {
          // Parse headers for ToC
          const parser = new DOMParser();
          const doc = parser.parseFromString(found.description, 'text/html');
          const boldElements = Array.from(doc.querySelectorAll('strong, b, h1, h2, h3'));
          
          const detectedSections = boldElements
            .map((el, idx) => {
              const text = el.textContent?.trim() || "";
              if (text.length > 3 && text.length < 100) {
                return {
                  id: `section-${idx}`,
                  title: text
                };
              }
              return null;
            })
            .filter((s): s is { id: string, title: string } => s !== null);

          // Add IDs to original HTML
          let enhancedHtml = found.description;
          detectedSections.forEach(s => {
            const target = `>${s.title}<`;
            const replacement = ` id="${s.id}" class="scroll-mt-32">${s.title}<`;
            enhancedHtml = enhancedHtml.replace(target, replacement);
          });

          setItem({ ...found, description: enhancedHtml });
          setSections(detectedSections);
        }
        setLoading(false);
      }
    };
    loadItem();
  }, [slug]);

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { 
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, item]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      setActiveSection(id);
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] dark:bg-neutral-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9] dark:bg-neutral-950 gap-4">
        <h2 className="text-2xl font-bold">Kayıt Bulunamadı</h2>
        <Link href="/lifestyle/research" className="text-amber-600 font-medium underline">Geri Dön</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-neutral-950 font-body text-neutral-900 dark:text-neutral-50 selection:bg-amber-100 selection:text-amber-900">
      <main className="pt-8 pb-24 px-8 max-w-[1440px] mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 text-neutral-400 font-label text-[10px] tracking-[0.1em] uppercase">
              <Link href="/lifestyle/research" className="hover:text-neutral-900 dark:hover:text-neutral-50">Hub</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-neutral-900 dark:text-neutral-50">{item.category}</span>
            </nav>
            <h1 className="font-headline font-extrabold text-5xl md:text-6xl tracking-tighter max-w-4xl leading-tight text-neutral-900 dark:text-neutral-50 transition-all duration-700">
              {item.title}
            </h1>
          </div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 font-label text-sm font-semibold text-neutral-900 dark:text-neutral-50 hover:translate-x-[-4px] transition-transform duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            {item.coverImage && (
              <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800">
                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="rich-content-display prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 text-lg leading-relaxed">
               <div dangerouslySetInnerHTML={{ __html: processedContent }} />
            </div>

            {processedGoldenWords && (
              <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-neutral-900/40 dark:to-orange-950/20 p-12 border border-amber-200/40 dark:border-amber-900/20 shadow-xl mt-16 group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                  <Star className="w-32 h-32 text-amber-500 fill-current" />
                </div>
                
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-[2px] bg-amber-500 rounded-full"></div>
                      <h3 className="text-xs font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">Golden Words</h3>
                   </div>
                   
                   <div className="text-2xl md:text-3xl font-medium text-neutral-900 dark:text-neutral-50 italic leading-relaxed rich-content-display mb-2">
                      <div dangerouslySetInnerHTML={{ __html: processedGoldenWords }} />
                   </div>
                </div>
              </section>
            )}
          </div>
          
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-32 space-y-10">
              {sections.length > 0 && (
                <div className="bg-white dark:bg-neutral-900/50 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm border-l-4 border-l-amber-500/20">
                  <div className="flex items-center gap-2 mb-6">
                    <List className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-50">İçindekiler</h4>
                  </div>
                  <nav className="space-y-1">
                    {sections.map(s => (
                      <button
                        key={s.id}
                        onClick={() => scrollToId(s.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border border-transparent",
                          activeSection === s.id 
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 translate-x-1" 
                            : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                        )}
                      >
                        {s.title}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Metadata</span>
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Bu araştırma, {item.category} alanında kürate edilmiştir.</p>
                </div>
                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 group cursor-pointer">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Last Updated</span>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">{item.date}</p>
                </div>
                <button className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Export to Journal
                </button>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-900/50 p-8 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
                <h4 className="text-sm font-bold mb-4 uppercase tracking-tighter">Quick Notes</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic">
                  Bu alana gelecekte hızlı notlar veya linkler ekleyebilirsin. Şu an deneme aşamasında.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile ToC FAB */}
      <AnimatePresence>
        {sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-8 left-8 z-[60] lg:hidden"
          >
            <button
              onClick={() => setIsMobileTocOpen(true)}
              className="w-14 h-14 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <List className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile ToC Drawer */}
      <AnimatePresence>
        {isMobileTocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileTocOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-neutral-900 z-[101] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                   <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Navigasyon</p>
                   <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-tighter">İçindekiler</h3>
                </div>
                <button onClick={() => setIsMobileTocOpen(false)} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      scrollToId(s.id);
                      setIsMobileTocOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all border",
                      activeSection === s.id 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600" 
                        : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                       <span className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          activeSection === s.id ? "bg-amber-500 scale-150" : "bg-neutral-300 dark:bg-neutral-700"
                       )} />
                       <span className="text-sm font-bold uppercase tracking-tight">{s.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-32 py-24 px-8 bg-neutral-950 text-white">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-4">
            <div className="font-headline font-extrabold text-2xl tracking-tighter">The Personal OS</div>
            <p className="text-neutral-500 max-w-sm text-sm font-body leading-relaxed">
              Digital curator for the modern intellectual. Intentional research, minimal noise, maximum clarity.
            </p>
          </div>
          <div className="flex flex-wrap gap-12">
            <div className="space-y-4">
              <h5 className="font-label text-[10px] uppercase tracking-widest text-neutral-600">Explore</h5>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Digital Library</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Research Nodes</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Curation Tools</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-label text-[10px] uppercase tracking-widest text-neutral-600">Platform</h5>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Manifesto</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Settings</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-16 pt-8 border-t border-neutral-900 flex justify-between items-center text-[10px] font-label uppercase tracking-widest text-neutral-700">
          <span>© 2024 The Things — Digital Curator</span>
          <div className="flex gap-6">
            <span className="hover:text-neutral-500 cursor-pointer">Instagram</span>
            <span className="hover:text-neutral-500 cursor-pointer">Newsletter</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
