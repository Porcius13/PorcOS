"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export default function ProfilPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [intent, setIntent] = useState("");
  const [routine, setRoutine] = useState("");
  const [theme, setTheme] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("user-profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setName(parsed.name || "");
        setRole(parsed.role || "");
        setIntent(parsed.intent || "");
        setRoutine(parsed.routine || "");
        setTheme(parsed.theme || "");
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const profile = { name, role, intent, routine, theme };
    localStorage.setItem("user-profile", JSON.stringify(profile));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70 relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
        
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-black tracking-tight uppercase text-neutral-900 dark:text-neutral-50 leading-none">
            Profil &amp; Ayarlar
          </h1>
          <p className="text-xs font-label uppercase tracking-widest text-neutral-400">
            Kişisel OS&apos;un temel parametreleri
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              İsim
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-50 dark:focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Rol / Kimlik
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Örn. Asistan hekim, developer, founder"
              className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-50 dark:focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Günün Ana Niyeti
            </label>
            <textarea
              rows={3}
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Bugünün high-level niyetini kısa bir cümle ile yaz."
              className="w-full resize-none rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-50 dark:focus:border-primary/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Rutin Modu
              </label>
              <select 
                value={routine}
                onChange={(e) => setRoutine(e.target.value)}
                className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-50 dark:focus:border-primary/50"
              >
                <option value="">Seç</option>
                <option value="deep">Deep work</option>
                <option value="light">Light mode</option>
                <option value="off">Off / Recovery</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Tema Tercihi
              </label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-50 dark:focus:border-primary/50"
              >
                <option value="">Sistem</option>
                <option value="light">Açık</option>
                <option value="dark">Koyu</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
               type="submit"
               className="bg-black dark:bg-white text-white dark:text-black px-10 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
            >
              {isSaved ? (
                <>
                  <Check size={16} /> KAYDEDİLDİ
                </>
              ) : (
                "DEĞİŞİKLİKLERİ KAYDET"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

