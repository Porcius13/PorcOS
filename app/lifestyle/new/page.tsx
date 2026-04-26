"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Book, Upload, FileUp, Loader2, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";
import { MarkdownEditor } from "@/components/markdown-editor";

type LifestyleTab = "spearfishing" | "bar";

function LifestyleNewContent() {
  const [activeTab, setActiveTab] = useState<LifestyleTab>("spearfishing");
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  useEffect(() => {
    if (editId) {
      const stored = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
      const itemToEdit = stored.find((i: any) => i.id.toString() === editId);
      if (itemToEdit) {
        if (itemToEdit.type === "Spearfishing") {
          setActiveTab("spearfishing");
        } else if (itemToEdit.type === "The Bar") {
          setActiveTab("bar");
        }
      }
    }
  }, [editId]);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-8">
      <div className="w-full max-w-3xl rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70 transition-all duration-300">
        <div className="mb-6 space-y-3">
          <Link
            href="/lifestyle"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard'a Dön
          </Link>
          <div className="space-y-1 mt-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {editId ? "Kaydı Düzenle" : "Yeni Lifestyle Kaydı"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Derin mavi veya The Bar koleksiyonunuzdaki kaydı güncelleyin.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setActiveTab("spearfishing")}
              disabled={!!editId}
              className={`flex-1 rounded-full px-4 py-1.5 transition ${activeTab === "spearfishing"
                  ? "bg-primary text-primary-foreground shadow-sm dark:bg-primary dark:text-primary-foreground"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                } ${editId ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Mera &amp; Derin Mavi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bar")}
              disabled={!!editId}
              className={`flex-1 rounded-full px-4 py-1.5 transition ${activeTab === "bar"
                  ? "bg-primary text-primary-foreground shadow-sm dark:bg-primary dark:text-primary-foreground"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                } ${editId ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              The Bar
            </button>
          </div>
        </div>

        {activeTab === "spearfishing" ? <SpearfishingSection editId={editId} /> : <BarSection editId={editId} />}
      </div>
    </div>
  );
}

function SpearfishingSection({ editId }: { editId: string | null }) {
  const router = useRouter();
  const [mera, setMera] = useState("");
  const [depth, setDepth] = useState("");
  const [visibility, setVisibility] = useState("");
  const [weather, setWeather] = useState("");
  const [vibe, setVibe] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      const stored = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
      const item = stored.find((i: any) => i.id.toString() === editId && i.type === "Spearfishing");
      if (item) {
        setMera(item.title || "");
        setDepth(item.depth || "");
        setVisibility(item.visibility || "");
        setWeather(item.weather || "");
        setVibe(item.vibe || "");
        setImage(item.image || null);
      }
    }
  }, [editId]);

  const handleSave = () => {
    if (!mera.trim()) {
      alert("Lütfen bir mera girin.");
      return;
    }

    const newItem = {
      id: editId ? Number(editId) : Date.now(),
      title: mera,
      type: "Spearfishing",
      category: "Mera",
      readTime: "1m read",
      depth,
      visibility,
      weather,
      vibe,
      date: new Date().toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }),
      isLocal: true,
      image,
    };

    const existing = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
    
    if (editId) {
      const updated = existing.map((i: any) => 
        i.id.toString() === editId ? { ...i, ...newItem } : i
      );
      localStorage.setItem("lifestyleItems", JSON.stringify(updated));
    } else {
      localStorage.setItem("lifestyleItems", JSON.stringify([newItem, ...existing]));
    }

    alert(editId ? "Kayıt güncellendi!" : "Başarıyla kaydedildi!");
    router.push("/lifestyle");
  };

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <ImageUpload onImageChange={(base64) => setImage(base64)} initialImage={image} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          Mera Name
        </label>
        <input
          type="text"
          value={mera}
          onChange={(e) => setMera(e.target.value)}
          placeholder="Örn. Datça - Kuzey Resif"
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Depth (m)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            placeholder="Örn. 12.5"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Visibility / Clarity
          </label>
          <input
            type="text"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            placeholder="Örn. 8–10 m, kristal / bulanık"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
          />
        </div>
      </div>

      <MarkdownEditor
        label="Wind / Weather"
        rows={3}
        value={weather}
        onChange={setWeather}
        placeholder="Rüzgar yönü & şiddeti, akıntı, hava durumu, su sıcaklığı..."
      />

      <MarkdownEditor
        label="Av & Vibe"
        rows={4}
        value={vibe}
        onChange={setVibe}
        placeholder="Avladığın türler, mola anları, zihinsel state, akılda kalan detaylar..."
      />

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

function BarSection({ editId }: { editId: string | null }) {
  const router = useRouter();
  const [cocktail, setCocktail] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      const stored = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
      const item = stored.find((i: any) => i.id.toString() === editId && i.type === "The Bar");
      if (item) {
        setCocktail(item.title || "");
        setIngredients(item.ingredients || "");
        setScore(item.score || "");
        setNotes(item.notes || "");
        setImage(item.image || null);
      }
    }
  }, [editId]);

  const handleSave = () => {
    if (!cocktail.trim()) {
      alert("Lütfen bir kokteyl ismi girin.");
      return;
    }

    const newItem = {
      id: editId ? Number(editId) : Date.now(),
      title: cocktail,
      type: "The Bar",
      category: "Cocktail",
      readTime: "1m read",
      ingredients,
      score,
      notes,
      date: new Date().toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }),
      isLocal: true,
      image,
    };

    const existing = JSON.parse(localStorage.getItem("lifestyleItems") || "[]");
    
    if (editId) {
      const updated = existing.map((i: any) => 
        i.id.toString() === editId ? { ...i, ...newItem } : i
      );
      localStorage.setItem("lifestyleItems", JSON.stringify(updated));
    } else {
      localStorage.setItem("lifestyleItems", JSON.stringify([newItem, ...existing]));
    }

    alert(editId ? "Kayıt güncellendi!" : "Başarıyla kaydedildi!");
    router.push("/lifestyle");
  };

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <ImageUpload onImageChange={(base64) => setImage(base64)} initialImage={image} />
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          Cocktail Name
        </label>
        <input
          type="text"
          value={cocktail}
          onChange={(e) => setCocktail(e.target.value)}
          placeholder="Örn. Datça Negroni, Citrus Mule"
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
        />
      </div>

      <MarkdownEditor
        label="Ingredients / Ratios"
        rows={4}
        value={ingredients}
        onChange={setIngredients}
        placeholder="Birimlerle yaz (ör. 3 cl gin, 3 cl vermut, 3 cl bitter). Küçük not: buz tipi, garnish..."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Sour Balance Score (1–10)
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Örn. 7"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Tasting Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Örn. fresh, dengeli, bitter uzun final..."
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

export default function LifestyleNewPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-neutral-400" /></div>}>
      <LifestyleNewContent />
    </Suspense>
  );
}
