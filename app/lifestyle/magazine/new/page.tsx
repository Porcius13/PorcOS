"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Book, Upload, FileUp, Loader2, Plus } from "lucide-react";
import { magazineDb } from "@/components/lifestyle/lib/magazine-db";
import { useRouter, useSearchParams } from "next/navigation";

export default function MagazineNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [existingMagazine, setExistingMagazine] = useState<any>(null);

  useEffect(() => {
    if (editId) {
      const loadExisting = async () => {
        const stored = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
        const item = stored.find((i: any) => i.id.toString() === editId && i.type === "Magazine");
        if (item) {
          setTitle(item.title);
          setExistingMagazine(item);
        }
      };
      loadExisting();
    }
  }, [editId]);

  const extractCoverAndPages = async (file: File) => {
    return new Promise<{ cover: string | null; totalPages: number }>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = async () => {
        try {
          // @ts-ignore
          const pdfjsLib = window.pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const totalPages = pdf.numPages;

          // Render first page as cover
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context!, viewport }).promise;
          const cover = canvas.toDataURL("image/jpeg", 0.7);
          resolve({ cover, totalPages });
        } catch (error) {
          console.error("Cover extraction failed:", error);
          resolve({ cover: null, totalPages: 0 });
        }
      };
      document.head.appendChild(script);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      if (!title) setTitle(file.name.replace(".pdf", ""));
    } else if (file) {
      alert("Lütfen geçerli bir PDF dosyası seçin.");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Lütfen başlık girin.");
      return;
    }

    if (!editId && !pdfFile) {
      alert("Lütfen bir PDF dosyası seçin.");
      return;
    }

    setIsSaving(true);
    try {
      const id = editId ? Number(editId) : Date.now();
      const addedAt = editId ? existingMagazine.addedAt : new Date().toISOString();
      let cover = existingMagazine?.image || null;
      let totalPages = existingMagazine?.readTime ? parseInt(existingMagazine.readTime) : 0;

      if (pdfFile) {
        // Extract cover if new file provided
        const extracted = await extractCoverAndPages(pdfFile);
        cover = extracted.cover;
        totalPages = Math.max(extracted.totalPages, 0);

        // Save to IndexedDB
        await magazineDb.saveMagazine({
          id,
          title,
          pdfBlob: pdfFile,
          coverImage: cover || undefined,
          totalPages,
          addedAt,
        });
      } else if (editId && existingMagazine) {
        // Only title updated
        const mag = await magazineDb.getMagazine(id);
        if (mag) {
          mag.title = title;
          await magazineDb.saveMagazine(mag);
        }
      }

      // Save metadata to LocalStorage
      const newItem = {
        id,
        title,
        type: "Magazine",
        category: "Dijital Dergi",
        readTime: `${totalPages} Sayfa`,
        isLocal: true,
        image: cover,
        addedAt
      };

      const existing = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
      let updated;
      if (editId) {
        updated = existing.map((i: any) => i.id.toString() === editId ? { ...i, ...newItem } : i);
      } else {
        updated = [newItem, ...existing];
      }
      localStorage.setItem("lifestyleItems", JSON.stringify(updated));

      alert(editId ? "Dergi güncellendi!" : "Dergi başarıyla kolleksiyona eklendi!");
      router.push("/lifestyle/magazine");
    } catch (error) {
      console.error(error);
      alert("Hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-8">
      <div className="w-full max-w-3xl rounded-[3rem] border border-neutral-200 bg-white/80 p-10 shadow-2xl shadow-neutral-200/50 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="mb-10 space-y-4">
          <Link
            href="/lifestyle/magazine"
            className="inline-flex items-center gap-2 text-sm font-black text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" />
            Arşive Dön
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight">
              {editId ? "Dergiyi Düzenle" : "Yeni Dergi Yükle"}
            </h1>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {editId ? "Dergi başlığını veya dosyasını güncelleyebilirsiniz." : "PDF formatındaki dergini yükle ve saniyeler içinde kütüphanene ekle."}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="relative group">
            <label className="flex flex-col items-center justify-center h-64 w-full border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800/80 transition-all cursor-pointer overflow-hidden group-hover:border-amber-500/50">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {pdfFile ? (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="p-6 bg-amber-500/10 rounded-3xl text-amber-600 mb-2">
                    <Book size={48} />
                  </div>
                  <p className="text-lg font-black text-neutral-900 dark:text-neutral-100 line-clamp-1">
                    {pdfFile.name}
                  </p>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Dökümanı
                  </p>
                </div>
              ) : editId && existingMagazine ? (
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  {existingMagazine.image ? (
                    <img src={existingMagazine.image} className="h-32 w-24 object-cover rounded-xl shadow-lg mb-2" alt="Current cover" />
                  ) : (
                    <Book size={48} className="opacity-20" />
                  )}
                  <p className="text-sm font-bold italic">Mevcut dosya korunacak. Değiştirmek için tıklayın.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-neutral-400 dark:text-neutral-500">
                  <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-3xl group-hover:scale-110 transition-transform group-hover:bg-amber-500/10 group-hover:text-amber-600">
                    <FileUp size={48} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-neutral-900 dark:text-neutral-100 italic">PDF Dosyasını Sürükle veya Seç</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Maksimum önerilen boyut: 50MB</p>
                  </div>
                </div>
              )}
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 px-2">
              Dergi Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn. National Geographic - Mart 2026"
              className="w-full rounded-[1.5rem] border border-neutral-200 bg-neutral-50/50 px-6 py-4 text-sm font-bold shadow-inner outline-none transition focus:border-amber-500/50 focus:bg-white focus:ring-4 focus:ring-amber-500/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-amber-500/40 dark:focus:bg-neutral-900"
            />
          </div>

          <div className="p-6 rounded-[2rem] bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xl shadow-amber-500/30">
                <Upload size={24} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-900 dark:text-amber-400 mb-1">Flipbook Storage</h4>
                <p className="text-[12px] font-medium text-amber-800/80 dark:text-amber-300/60 leading-relaxed">
                  Dergileriniz IndexedDB üzerinde güvenli bir şekilde saklanır. Dosya boyutu arttıkça yükleme süresi uzayabilir, lütfen sabırlı olun.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-neutral-900 px-10 py-4 text-sm font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 dark:bg-neutral-50 dark:text-neutral-950"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  {editId ? "Güncelle" : "Koleksiyona Ekle"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
