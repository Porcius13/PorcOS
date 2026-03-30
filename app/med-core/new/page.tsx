"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Book, Upload, FileUp, Loader2, Plus, Sparkles, Heart, Activity } from "lucide-react";
import { InteractiveAnatomy, type AnatomyPart } from "@/components/interactive-anatomy";
import { ImageUpload } from "@/components/image-upload";
import { MarkdownEditor } from "@/components/markdown-editor";
import { DifferentialTable, type DifferentialRow } from "@/components/med-core/DifferentialTable";
import { PatientChecklist, type ChecklistItem } from "@/components/med-core/PatientChecklist";
import { RichTechnicalEntry } from "@/components/med-core/RichTechnicalEntry";
import { medDb } from "@/lib/med-db";

type MedCoreTab = "research" | "clinical" | "medvibe";

export default function MedCoreNewPage() {
  const [activeTab, setActiveTab] = useState<MedCoreTab>("clinical");
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  useEffect(() => {
    async function checkEdit() {
      if (editId) {
        const itemToEdit = await medDb.getById(editId);
        if (itemToEdit) {
          if (itemToEdit.type === "Research") {
            setActiveTab("research");
          } else if (itemToEdit.type === "Med Vibe") {
            setActiveTab("medvibe");
          } else {
            setActiveTab("clinical");
          }
        }
      }
    }
    checkEdit();
  }, [editId]);

  return (
    <div className="flex flex-col min-h-screen bg-terminal-bg selection:bg-terminal-accent selection:text-black">
      <div className="w-full max-w-7xl mx-auto py-12 px-6 sm:px-12 flex flex-col pt-24 text-neutral-900 dark:text-white">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-6 border-b border-terminal-surface-high pb-8">
          <div className="w-full sm:w-auto">
            <Link
              href="/med-core"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-neutral-500 dark:text-terminal-dim hover:text-neutral-900 dark:hover:text-white uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              TERMİNALE DÖN
            </Link>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900 dark:text-white">KLİNİK KAYIT</h1>
            <p className="text-[10px] font-black text-terminal-accent tracking-[0.3em] uppercase mt-2">PROTOKOL_GİRİŞİ_GÜVENLİ</p>
          </div>

          <div className="inline-flex p-1 bg-terminal-surface border border-terminal-surface-high shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("clinical")}
              className={`px-6 py-2.5 text-[10px] uppercase tracking-widest font-black transition-all ${
                activeTab === "clinical"
                  ? "bg-terminal-accent text-black"
                  : "text-neutral-500 dark:text-terminal-dim hover:text-neutral-900 dark:hover:text-white hover:bg-terminal-surface-high"
              }`}
            >
              KLİNİK MUAYENE
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("research")}
              className={`px-6 py-2.5 text-[10px] uppercase tracking-widest font-black transition-all ${
                activeTab === "research"
                  ? "bg-terminal-accent text-black"
                  : "text-neutral-500 dark:text-terminal-dim hover:text-neutral-900 dark:hover:text-white hover:bg-terminal-surface-high"
              }`}
            >
              ARAŞTIRMA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("medvibe")}
              className={`px-6 py-2.5 text-[10px] uppercase tracking-widest font-black transition-all ${
                activeTab === "medvibe"
                  ? "bg-terminal-accent text-black"
                  : "text-neutral-500 dark:text-terminal-dim hover:text-neutral-900 dark:hover:text-white hover:bg-terminal-surface-high"
              }`}
            >
              MED VIBE
            </button>
          </div>
        </div>

        {activeTab === "research" ? (
          <ResearchSection editId={editId} />
        ) : activeTab === "medvibe" ? (
          <MedVibeSection editId={editId} />
        ) : (
          <ClinicalSection editId={editId} />
        )}
      </div>
    </div>
  );
}

function ResearchSection({ editId }: { editId: string | null }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [researchContent, setResearchContent] = useState("");
  const [goldenWords, setGoldenWords] = useState("");
  const [sources, setSources] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      if (editId) {
        const item = await medDb.getById(editId);
        if (item && item.type === "Research") {
          setTitle(item.title || "");
          setResearchContent(item.researchContent || "");
          setGoldenWords(item.goldenWords || "");
          setSources(item.sources || "");
          setImage(item.image || null);
        }
      }
    }
    loadItem();
  }, [editId]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("TITLE_REQUIRED");
      return;
    }

    const newItem = {
      id: editId ? Number(editId) : Date.now(),
      title,
      type: "Research",
      readTime: "3m read",
      category: "Research",
      date: new Date().toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }),
      isLocal: true,
      image,
      researchContent,
      goldenWords,
      sources,
    };

    await medDb.save(newItem);
    alert(editId ? "PROTOCOL_UPDATED" : "PROTOCOL_COMMITTED");
    router.push("/med-core");
  };

  return (
    <form className="mx-auto w-full space-y-8 pb-32" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <header className="relative overflow-hidden border-l-8 border-terminal-accent bg-terminal-surface p-10 shadow-2xl">
        {image && (
          <div className="absolute inset-0 z-0 opacity-40 transition-all duration-700">
            <img src={image} alt="Background" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 space-y-4">
           <label className="font-label text-xs font-bold text-terminal-accent tracking-[0.2em] uppercase">ARAŞTIRMA MAKALESİ BAŞLIĞI</label>
           <input 
             className="w-full bg-transparent border-b border-terminal-surface-high py-2 text-2xl font-black text-neutral-900 dark:text-white focus:outline-none focus:border-terminal-accent transition-colors"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             placeholder="E.g. NEUROGENIC_ADAPTATION_ANALYSIS..."
           />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 space-y-8">
           <MarkdownEditor
             label="DETAILED_RESEARCH_ANALYSIS"
             rows={15}
             value={researchContent}
             onChange={setResearchContent}
             placeholder="Full implementation data... (Markdown supported)"
           />
           <MarkdownEditor
             label="GOLDEN_WORDS // CRITICAL_PEARLS"
             rows={4}
             value={goldenWords}
             onChange={setGoldenWords}
             placeholder="Key technical findings..."
           />
         </div>
         <div className="space-y-8">
            <div className="bg-terminal-surface p-6 border-t border-terminal-surface-high">
               <h4 className="font-label text-[10px] font-bold text-terminal-dim mb-4 uppercase tracking-widest">VISUAL_FEED_UPLOAD</h4>
               <ImageUpload onImageChange={(base64) => setImage(base64)} />
            </div>
            <MarkdownEditor
              label="SOURCES_AND_CITATIONS"
              rows={6}
              value={sources}
              onChange={setSources}
              placeholder="Citations..."
            />
         </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-end items-center pointer-events-none z-50">
        <div className="pointer-events-auto flex items-center gap-4 bg-terminal-bg border border-terminal-surface-high p-4 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-terminal-accent opacity-50" />
          <button
            type="button"
            onClick={() => router.push('/med-core')}
            className="px-8 py-3 text-neutral-500 dark:text-terminal-dim font-bold uppercase tracking-widest text-[10px] hover:text-neutral-900 dark:hover:text-white"
          >
            TASLAĞI İPTAL ET
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-terminal-accent text-black px-12 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-terminal-accent/90 transition-all"
          >
            MAKALEYİ YAYINLA
          </button>
        </div>
      </div>
    </form>
  );
}

function ClinicalSection({ editId }: { editId: string | null }) {
  const router = useRouter();
  const [selectedOrgan, setSelectedOrgan] = useState<AnatomyPart | null>(null);
  
  const [title, setTitle] = useState("");
  const [fullResearch, setFullResearch] = useState("");
  const [complaint, setComplaint] = useState("");
  const [exam, setExam] = useState("");
  const [differentialRows, setDifferentialRows] = useState<DifferentialRow[]>([
    { diagnosis: "ACUTE_MI_STEMI", hint: "ST elevation in contiguous leads", scoring: "CRITICAL", isLethal: true }
  ]);
  const [labs, setLabs] = useState("");
  const [imaging, setImaging] = useState("");
  const [erOrders, setErOrders] = useState("");
  const [prescription, setPrescription] = useState("");
  const [erEducation, setErEducation] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: "1", label: "TRIAGE_ASSESSMENT", status: "COMPLETE" },
    { id: "2", label: "CONSENT_VERIFIED", status: "PENDING" },
    { id: "3", label: "BLOOD_WORK_DRAWN", status: "PENDING" },
    { id: "4", label: "RADIOLOGY_QUEUE", status: "PENDING" }
  ]);
  const [image, setImage] = useState<string | null>(null);
  const [goldenWords, setGoldenWords] = useState("");

  useEffect(() => {
    async function loadItem() {
      if (editId) {
        const item = await medDb.getById(editId);
        if (item && item.type === "Clinical Guide") {
          setTitle(item.title || "");
          setFullResearch(item.fullResearch || "");
          setComplaint(item.complaint || "");
          setExam(item.exam || item.history || "");
          setDifferentialRows(item.differentialRows || []);
          setLabs(item.labs || "");
          setImaging(item.imaging || "");
          setErOrders(item.erOrders || item.order || "");
          setPrescription(item.prescription || "");
          setErEducation(item.erEducation || item.redFlags || "");
          setChecklistItems(item.checklistItems || []);
          setImage(item.image || null);
          setGoldenWords(item.goldenWords || "");
          if (item.selectedOrgan) setSelectedOrgan(item.selectedOrgan);
        }
      }
    }
    loadItem();
  }, [editId]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("TITLE_REQUIRED");
      return;
    }

    const newItem = {
      id: editId ? Number(editId) : Date.now(),
      title,
      type: "Clinical Guide",
      category: "Clinical Protocol",
      readTime: "5m read",
      isLocal: true,
      date: new Date().toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }),
      image,
      fullResearch,
      complaint,
      exam,
      differentialRows,
      labs,
      imaging,
      erOrders,
      prescription,
      erEducation,
      checklistItems,
      selectedOrgan,
      goldenWords,
    };

    await medDb.save(newItem);
    alert(editId ? "PROTOCOL_UPDATED" : "PROTOCOL_COMMITTED");
    router.push("/med-core");
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-40">
      <div className="lg:col-span-9 space-y-8">
        <header className="relative overflow-hidden border-l-8 border-terminal-accent bg-terminal-surface p-10 shadow-2xl">
          {image && (
             <div className="absolute inset-0 z-0 opacity-40 transition-all duration-700">
                <img src={image} alt="Background" className="w-full h-full object-cover" />
             </div>
          )}
          <div className="relative z-10 space-y-4">
            <label className="font-label text-xs font-bold text-terminal-accent tracking-[0.2em] uppercase">Vaka / Konu Başlığı</label>
            <input 
              className="w-full bg-transparent border-b border-terminal-surface-high py-2 text-2xl font-black text-neutral-900 dark:text-white focus:outline-none focus:border-terminal-accent transition-colors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn. AKUT KORONER SENDROM..."
            />
          </div>
        </header>

        <section className="bg-terminal-surface p-8 border-l-8 border-terminal-accent space-y-6">
           <RichTechnicalEntry 
             label="ALTIN NOTLAR // KLİNİK İNCİLER" 
             value={goldenWords} 
             onChange={setGoldenWords} 
             placeholder="Vakanın en can alıcı noktası/özeti..." 
             accent
           />
           <MarkdownEditor 
             label="FULL_RESEARCH_PROTOCOL" 
             rows={12} 
             value={fullResearch} 
             onChange={setFullResearch} 
             placeholder="Klinik rehberin akademik temeli..."
           />
        </section>

        <DifferentialTable rows={differentialRows} isEditable={true} onUpdate={setDifferentialRows} />

        <div className="flex flex-col gap-10">
          <RichTechnicalEntry label="01 ŞİKAYET" value={complaint} onChange={setComplaint} placeholder="Şikayet..." />
          <RichTechnicalEntry label="02 FİZİK MUAYENE" value={exam} onChange={setExam} placeholder="Muayene..." />
          <RichTechnicalEntry label="03 LABORATUVAR" value={labs} onChange={setLabs} placeholder="Lablar..." accent />
          <RichTechnicalEntry label="04 GÖRÜNTÜLEME" value={imaging} onChange={setImaging} placeholder="Görüntüleme..." />
          <RichTechnicalEntry label="05 ACİL TEDAVİ PLANI" value={erOrders} onChange={setErOrders} placeholder="Order..." />
          <RichTechnicalEntry label="06 REÇETE" value={prescription} onChange={setPrescription} placeholder="Reçete..." />
          <RichTechnicalEntry label="07 HASTA EĞİTİMİ" value={erEducation} onChange={setErEducation} placeholder="Eğitim..." />
          <div className="bg-terminal-surface p-12 lg:p-16 border-l-4 border-terminal-surface-high flex flex-col items-center justify-center min-h-[300px] shadow-2xl relative group hover:bg-terminal-bg/50 transition-all duration-500">
             <ImageUpload onImageChange={setImage} />
             <div className="absolute top-6 left-6 font-label text-[10px] font-black text-terminal-accent tracking-[0.4em] uppercase opacity-40">08 KLİNİK GÖRSEL KANALI</div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-terminal-surface p-6 border border-terminal-surface-high shadow-xl">
           <PatientChecklist items={checklistItems} isEditable={true} onUpdate={setChecklistItems} />
        </div>
        <div className="bg-terminal-bg p-6 border border-terminal-surface-high space-y-4">
          <button 
            type="button"
            onClick={handleSave}
            className="w-full bg-terminal-accent hover:bg-terminal-accent/90 text-black font-black py-4 transition-all tracking-widest uppercase text-xs"
          >
            {editId ? "PROTOKOLÜ GÜNCELLE" : "PROTOKOLÜ TAMAMLA"}
          </button>
        </div>
      </div>
    </div>
  );
}


function MedVibeSection({ editId }: { editId: string | null }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [medVibeContent, setMedVibeContent] = useState("");
  const [goldenWords, setGoldenWords] = useState("");
  const [medVibeSources, setMedVibeSources] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      if (editId) {
        const item = await medDb.getById(editId);
        if (item && item.type === "Med Vibe") {
          setTitle(item.title || "");
          setMedVibeContent(item.medVibeContent || "");
          setGoldenWords(item.goldenWords || "");
          setMedVibeSources(item.medVibeSources || "");
          setImage(item.image || null);
        }
      }
    }
    loadItem();
  }, [editId]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("TITLE_REQUIRED");
      return;
    }

    const newItem = {
      id: editId ? Number(editId) : Date.now(),
      title,
      type: "Med Vibe",
      readTime: "2m read",
      category: "Med Vibe",
      date: new Date().toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }),
      isLocal: true,
      image,
      medVibeContent,
      goldenWords,
      medVibeSources,
    };

    await medDb.save(newItem);
    alert(editId ? "VIBE_UPDATED" : "VIBE_PUBLISHED");
    router.push("/med-core");
  };

  return (
    <form className="mx-auto w-full space-y-8 pb-32" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
       <header className="relative overflow-hidden border-l-8 border-terminal-accent bg-terminal-surface p-10 shadow-2xl">
        {image && (
          <div className="absolute inset-0 z-0 opacity-40 transition-all duration-700">
            <img src={image} alt="Background" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 space-y-4">
           <label className="font-label text-xs font-bold text-terminal-accent tracking-[0.2em] uppercase">MED_VIBE_TOPIC_TITLE</label>
           <input 
             className="w-full bg-transparent border-b border-terminal-surface-high py-2 text-2xl font-black text-neutral-900 dark:text-white focus:outline-none focus:border-terminal-accent transition-colors"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             placeholder="E.g. PHILOSOPHY_OF_CARE..."
           />
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <MarkdownEditor
            label="CONTENT_AND_INSIGHTS"
            rows={15}
            value={medVibeContent}
            onChange={setMedVibeContent}
            placeholder="Technical and philosophical insights..."
          />
        </div>
        <div className="space-y-8">
          <div className="bg-terminal-surface p-6 border-t border-terminal-surface-high">
            <h4 className="font-label text-[10px] font-bold text-terminal-dim mb-4 uppercase tracking-widest">VISUAL_FEED_UPLOAD</h4>
            <ImageUpload onImageChange={setImage} />
          </div>
          <MarkdownEditor
            label="GOLDEN_WORDS"
            rows={4}
            value={goldenWords}
            onChange={setGoldenWords}
            placeholder="Impactful quotes..."
          />
          <MarkdownEditor
            label="CITATIONS_AND_LINKS"
            rows={4}
            value={medVibeSources}
            onChange={setMedVibeSources}
            placeholder="References..."
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-end items-center pointer-events-none z-50">
        <div className="pointer-events-auto flex items-center gap-4 bg-terminal-bg border border-terminal-surface-high p-4 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-x-0 top-0 h-[2px] bg-terminal-accent opacity-50" />
           <button
             type="button"
             onClick={() => router.push('/med-core')}
             className="px-8 py-3 text-neutral-500 dark:text-terminal-dim font-bold uppercase tracking-widest text-[10px] hover:text-neutral-900 dark:hover:text-white"
           >
             ABORT_PUBLICATION
           </button>
           <button
             type="submit"
             className="bg-terminal-accent text-black px-10 py-4 font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
           >
             PUBLISH_TO_NETWORK
           </button>
        </div>
      </div>
    </form>
  );
}
