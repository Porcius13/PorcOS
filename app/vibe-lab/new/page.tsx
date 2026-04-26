"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";
import { MarkdownEditor } from "@/components/markdown-editor";

type VibeView = "logs" | "zine";

function VibeLabNewContent() {
  const [view, setView] = useState<VibeView>("logs");
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  useEffect(() => {
    if (editId) {
      try {
        const stored = JSON.parse(localStorage.getItem("vibeLabItems") || "[]");
        const item = stored.find((i: any) => i.id.toString() === editId);
        if (item) {
          setView(item.type === "Technical Logs" ? "logs" : "zine");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [editId]);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-8">
      <div className="w-full max-w-3xl rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70 transition-all duration-300">
        <div className="mb-6 space-y-3">
          <Link
            href="/vibe-lab"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard'a Dön
          </Link>
          <div className="space-y-1 mt-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {editId ? "Vibe Lab - Düzenle" : "Vibe Lab - Yeni Ekle"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Engineering zine: hem teknik log, hem de hikâye anlatımı.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setView("logs")}
              disabled={!!editId}
              className={`flex-1 rounded-full px-4 py-1.5 transition ${view === "logs"
                  ? "bg-primary text-primary-foreground shadow-sm dark:bg-primary dark:text-primary-foreground"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                } ${editId ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Technical Logs
            </button>
            <button
              type="button"
              onClick={() => setView("zine")}
              disabled={!!editId}
              className={`flex-1 rounded-full px-4 py-1.5 transition ${view === "zine"
                  ? "bg-primary text-primary-foreground shadow-sm dark:bg-primary dark:text-primary-foreground"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                } ${editId ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Magazine View
            </button>
          </div>
        </div>

        {view === "logs" ? <TechnicalLogs editId={editId} /> : <MagazineView editId={editId} />}
      </div>
    </div>
  );
}

export default function VibeLabNewPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-neutral-400" /></div>}>
      <VibeLabNewContent />
    </Suspense>
  );
}

function TechnicalLogs({ editId }: { editId: string | null }) {
  const router = useRouter();
  const [project, setProject] = useState("");
  const [taskType, setTaskType] = useState("");
  const [learned, setLearned] = useState("");
  const [snippet, setSnippet] = useState("");
  const [status, setStatus] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      try {
        const stored = JSON.parse(localStorage.getItem("vibeLabItems") || "[]");
        const item = stored.find((i: any) => i.id.toString() === editId && i.type === "Technical Logs");
        if (item) {
          setProject(item.category || "");
          setLearned(item.learned || "");
          setSnippet(item.snippet || "");
          setStatus(item.status || "");
          setNextStep(item.nextStep || "");
          setImage(item.image || null);
          
          if (item.title.includes(" - ")) {
            setTaskType(item.title.split(" - ")[1]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [editId]);

  const handleSave = () => {
    if (!project || !taskType) {
      alert("Lütfen proje ve görev tipi seçin.");
      return;
    }

    const newItem = {
      id: editId ? Number(editId) : Date.now(),
      title: `${project} - ${taskType}`,
      type: "Technical Logs",
      category: project,
      readTime: "1m read",
      learned,
      snippet,
      status,
      nextStep,
      date: new Date().toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }),
      isLocal: true,
      image,
    };

    const existing = JSON.parse(localStorage.getItem("vibeLabItems") || "[]");
    
    if (editId) {
      const updated = existing.map((i: any) => 
        i.id.toString() === editId ? { ...i, ...newItem } : i
      );
      localStorage.setItem("vibeLabItems", JSON.stringify(updated));
    } else {
      localStorage.setItem("vibeLabItems", JSON.stringify([newItem, ...existing]));
    }
    
    alert(editId ? "Kayıt güncellendi!" : "Başarıyla kaydedildi!");
    router.push("/vibe-lab");

    setProject("");
    setTaskType("");
    setLearned("");
    setSnippet("");
    setStatus("");
    setNextStep("");
  };

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <ImageUpload onImageChange={(base64) => setImage(base64)} initialImage={image} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Proje
          </label>
          <select 
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900">
            <option value="">Seç</option>
            <option value="favduck">FavDuck</option>
            <option value="trustnet">TrustNet</option>
            <option value="cornerbet">CornerBet</option>
            <option value="new">New Idea</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Görev Tipi
          </label>
          <select 
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900">
            <option value="">Seç</option>
            <option value="feature">Feature</option>
            <option value="bugfix">Bug Fix</option>
            <option value="research">Research</option>
          </select>
        </div>
      </div>

      <MarkdownEditor
        label="Learned New Info"
        rows={3}
        value={learned}
        onChange={setLearned}
        placeholder="Bugün ne öğrendin? Küçük cümlelerle yakala."
      />

      <MarkdownEditor
        label="Technical Note / Snippet"
        rows={4}
        value={snippet}
        onChange={setSnippet}
        placeholder={`Kısa bir kod parçası veya teknik not bırak.\nÖrn.\nconst state = useMemo(() => ..., [deps]);`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Status
          </label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900">
            <option value="">Seç</option>
            <option value="live">Live</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Next Step
          </label>
          <input
            type="text"
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            placeholder="Bir sonraki küçük adım nedir?"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
          />
        </div>
      </div>
      
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
        >
          {editId ? "Güncelle" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}

function MagazineView({ editId }: { editId: string | null }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      try {
        const stored = JSON.parse(localStorage.getItem("vibeLabItems") || "[]");
        const item = stored.find((i: any) => i.id.toString() === editId && i.type === "Magazine View");
        if (item) {
          setTitle(item.title || "");
          setContent(item.content || "");
          setImage(item.image || null);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [editId]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Lütfen bir başlık girin.");
      return;
    }

    const newItem = {
      id: editId ? Number(editId) : Date.now(),
      title,
      type: "Magazine View",
      category: "Zine",
      readTime: "3m read",
      content,
      date: new Date().toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }),
      isLocal: true,
      image,
    };

    const existing = JSON.parse(localStorage.getItem("vibeLabItems") || "[]");
    
    if (editId) {
      const updated = existing.map((i: any) => 
        i.id.toString() === editId ? { ...i, ...newItem } : i
      );
      localStorage.setItem("vibeLabItems", JSON.stringify(updated));
    } else {
      localStorage.setItem("vibeLabItems", JSON.stringify([newItem, ...existing]));
    }
    
    alert(editId ? "Kayıt güncellendi!" : "Başarıyla kaydedildi!");
    router.push("/vibe-lab");

    setTitle("");
    setContent("");
  };

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="rounded-2xl bg-neutral-50/80 p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-900/60 dark:ring-neutral-800/80">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500">
          Vibe Lab Zine
        </p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Markdown destekli, export friendly bir engineering journal.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. How a tiny refactor unlocked performance"
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
        />
      </div>

      <MarkdownEditor
        label="Story / Eureka (Markdown compatible)"
        rows={8}
        value={content}
        onChange={setContent}
        placeholder={`Buraya markdown ile yazabilirsin.\n\nÖrn.\n## Eureka\n\n- Latency ~300ms'den ~40ms'e indi\n- useMemo + pagination + server components\n\n> "Shipping beats perfect."`}
      />

      <div className="space-y-2">
        <ImageUpload onImageChange={(base64) => setImage(base64)} initialImage={image} />
      </div>
      
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
        >
          {editId ? "Güncelle" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
