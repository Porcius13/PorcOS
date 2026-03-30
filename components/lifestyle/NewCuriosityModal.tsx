"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Image as ImageIcon, Sparkles, MapPin, Calendar, Camera, Trash2, Save, Wand2 } from "lucide-react";
import { CuriosityData } from "./lib/curiosity-db";

interface NewCuriosityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editItem?: CuriosityData | null;
}

export const NewCuriosityModal = ({ isOpen, onClose, onSave, editItem }: NewCuriosityModalProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Doğa");
  const [description, setDescription] = useState("");
  const [didYouKnow, setDidYouKnow] = useState("");
  const [status, setStatus] = useState<'Wishlist' | 'Planned' | 'Achieved'>('Wishlist');
  const [location, setLocation] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["Doğa", "Bilim", "Uzay", "Hayat", "Tarih", "Rota", "Etkinlik", "Hayal"];

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || "");
      setCategory(editItem.category || "Doğa");
      setDescription(editItem.description || "");
      setDidYouKnow(editItem.didYouKnow || "");
      setStatus(editItem.status || 'Wishlist');
      setLocation(editItem.location || "");
      setTargetDate(editItem.targetDate || "");
      setCoverImage(editItem.coverImage || null);
    } else {
      setTitle("");
      setCategory("Doğa");
      setDescription("");
      setDidYouKnow("");
      setStatus('Wishlist');
      setLocation("");
      setTargetDate("");
      setCoverImage(null);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ 
        title, 
        category, 
        description, 
        didYouKnow, 
        coverImage, 
        status, 
        location, 
        targetDate, 
        id: editItem?.id 
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      ></div>

      <div className="relative z-10 w-full max-w-5xl bg-[#fcf9f2] dark:bg-[#151e16] shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-500 paper-texture ring-1 ring-black/5 dark:ring-white/5">
        
        {/* Decorative Header (Subtle) */}
        <header className="px-8 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="font-serif italic text-sm text-[#151e16]/60 dark:text-[#fcf9f2]/60 tracking-tight">The Executive Life-Archive</span>
            <div className="flex items-center gap-6">
                <span className="font-label text-[9px] uppercase tracking-widest text-[#151e16]/40 dark:text-[#fcf9f2]/40">Entry № {editItem ? editItem.id : "Auto-Gen"}</span>
                <button 
                    onClick={onClose}
                    className="text-[#151e16]/30 hover:text-[#151e16] dark:text-[#fcf9f2]/30 dark:hover:text-[#fcf9f2] transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 md:p-16">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 text-center">
                    <h1 className="font-headline italic text-4xl md:text-5xl text-[#151e16] dark:text-[#fcf9f2] mb-3 tracking-tight">
                        {editItem ? "Keşfi Güncelle" : "Yeni Keşif Arşivle"}
                    </h1>
                    <div className="w-12 h-px bg-amber-900/20 mx-auto"></div>
                </header>

                <form className="grid grid-cols-1 lg:grid-cols-12 gap-16" onSubmit={(e) => e.preventDefault()}>
                    {/* Text Content Area */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Title Input */}
                        <div className="group">
                            <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#151e16]/40 dark:text-[#fcf9f2]/40 mb-3 group-focus-within:text-amber-900 transition-colors">Keşif Başlığı</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-black/10 dark:border-white/10 focus:border-amber-900/40 focus:ring-0 px-0 py-4 font-headline text-2xl text-[#151e16] dark:text-[#fcf9f2] placeholder:text-black/10 dark:placeholder:text-white/10 placeholder:italic transition-all outline-none" 
                                placeholder="Unutulmaz bir anın ismi..." 
                            />
                        </div>

                        {/* Date & Location Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="group">
                                <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#151e16]/40 dark:text-[#fcf9f2]/40 mb-3 group-focus-within:text-amber-900">Tarih</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-black/10 dark:border-white/10 focus:border-amber-900/40 focus:ring-0 px-0 py-3 font-body text-base text-[#151e16] dark:text-[#fcf9f2] transition-all outline-none" 
                                        placeholder="12 Ekim 2023" 
                                    />
                                    <Calendar className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-black/10 dark:text-white/10" />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#151e16]/40 dark:text-[#fcf9f2]/40 mb-3 group-focus-within:text-amber-900">Konum</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-black/10 dark:border-white/10 focus:border-amber-900/40 focus:ring-0 px-0 py-3 font-body text-base text-[#151e16] dark:text-[#fcf9f2] transition-all outline-none" 
                                        placeholder="Paris, Fransa" 
                                    />
                                    <MapPin className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-black/10 dark:text-white/10" />
                                </div>
                            </div>
                        </div>

                        {/* Category Row (Subtle Integration) */}
                        <div className="space-y-4">
                            <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#151e16]/40 dark:text-[#fcf9f2]/40">Kategori</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-500 border ${
                                            category === cat
                                                ? "bg-[#151e16] text-[#fcf9f2] border-[#151e16] dark:bg-[#fcf9f2] dark:text-[#151e16] dark:border-[#fcf9f2]"
                                                : "bg-transparent border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:border-black/30 dark:hover:border-white/30"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reflections Area */}
                        <div className="group">
                            <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#151e16]/40 dark:text-[#fcf9f2]/40 mb-3 group-focus-within:text-amber-900">Anılar & Yansımalar</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/[0.02] dark:bg-white/[0.02] border-0 border-l-2 border-amber-900/10 focus:border-amber-900/40 focus:ring-0 px-8 py-6 font-body text-lg leading-relaxed text-[#151e16] dark:text-[#fcf9f2] placeholder:text-black/10 dark:placeholder:text-white/10 transition-all resize-none min-h-[16rem] outline-none" 
                                placeholder="Bu keşfin ruhunuzdaki yankılarını buraya not edin..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Photo Upload Area (Polaroid Style) */}
                    <div className="lg:col-span-5 flex flex-col pt-6">
                        <div 
                            className={`relative aspect-[4/5] w-full bg-white dark:bg-zinc-800 p-5 shadow-2xl transition-all duration-700 cursor-pointer group ${!coverImage ? 'rotate-2 hover:rotate-0' : 'rotate-0'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-full h-full border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center p-8 bg-[#fcf9f2] dark:bg-[#1c1c18] overflow-hidden relative">
                                {coverImage ? (
                                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <Camera className="text-[#151e16]/20 dark:text-[#fcf9f2]/20 w-12 h-12 group-hover:text-amber-900 transition-colors" />
                                        <p className="font-headline italic text-xl text-[#151e16]/40 dark:text-[#fcf9f2]/40">Görsel Ekle</p>
                                        <p className="font-label text-[9px] uppercase tracking-widest text-black/20 dark:text-white/20 mt-2">Maximum 25MB .RAW / .JPG</p>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-black/5 dark:bg-white/5"></div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        {/* Status Toggle (Subtle Grid) */}
                        <div className="mt-12 space-y-4">
                            <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#151e16]/40 dark:text-[#fcf9f2]/40">Keşif Durumu</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Wishlist', 'Planned', 'Achieved'] as const).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`py-3 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all ${
                                            status === s
                                                ? "bg-amber-900/10 text-amber-900 border border-amber-900/20"
                                                : "bg-black/[0.02] dark:bg-white/[0.02] text-black/20 dark:text-white/20 hover:text-black/40 dark:hover:text-white/40"
                                        }`}
                                    >
                                        {s === 'Wishlist' ? 'HAYAL' : s === 'Planned' ? 'PLAN' : 'KEŞİF'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Insight Input */}
                        <div className="mt-12 group">
                            <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#151e16]/40 dark:text-[#fcf9f2]/40 mb-3 group-focus-within:text-amber-900">Anlık İzlenim</label>
                            <textarea 
                                value={didYouKnow}
                                onChange={(e) => setDidYouKnow(e.target.value)}
                                className="w-full bg-transparent border-0 border-b border-black/10 dark:border-white/10 focus:border-amber-900/40 focus:ring-0 px-0 py-3 font-body italic text-sm text-[#151e16] dark:text-[#fcf9f2] placeholder:text-black/10 transition-all outline-none resize-none h-20" 
                                placeholder="Küçük bir not..." 
                            />
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-16 space-y-4">
                            <button 
                                onClick={handleSave}
                                className="w-full py-5 bg-[#151e16] dark:bg-[#fcf9f2] text-[#fcf9f2] dark:text-[#151e16] font-body font-bold tracking-widest uppercase text-[10px] rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98]" 
                                type="button"
                            >
                                <span>{editItem ? "KAYDI GÜNCELLE" : "KALICI ARŞİVE KAYDET"}</span>
                                <Wand2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full py-4 bg-transparent text-[#151e16]/40 dark:text-[#fcf9f2]/40 font-body font-bold text-[9px] tracking-[0.3em] uppercase hover:text-red-500 transition-colors text-center" 
                                type="button"
                            >
                                TASLAĞI SİL
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};
