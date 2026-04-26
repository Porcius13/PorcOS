"use client";

import React, { useState, useRef } from "react";
import { X, Plus, Image as ImageIcon, ArrowRight, Upload, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownEditor } from "@/components/markdown-editor";

import { researchDb, ResearchData } from "./lib/research-db";

interface NewResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editItem?: ResearchData | null;
  existingCategories?: string[];
}

export const NewResearchModal = ({ isOpen, onClose, onSave, editItem, existingCategories = [] }: NewResearchModalProps) => {
  const [title, setTitle] = useState("");
  const defaultCategories = ["Teknoloji", "Gastronomi", "Fotoğrafçılık", "Verimlilik", "Mimari"];
  const [categories, setCategories] = useState(defaultCategories);
  const [category, setCategory] = useState("Teknoloji");
  const [description, setDescription] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [goldenWords, setGoldenWords] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Sync with existing categories from parent
    if (isOpen) {
      const merged = Array.from(new Set([...defaultCategories, ...existingCategories]));
      setCategories(merged.sort());
    }
  }, [isOpen, existingCategories]);

  React.useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || "");
      setCategory(editItem.category || "Teknoloji");
      setDescription(editItem.description || "");
      setGoldenWords(editItem.goldenWords || "");
      setCoverImage(editItem.coverImage || null);
      setStep(1);
    } else {
      setTitle("");
      setCategory("Teknoloji");
      setDescription("");
      setGoldenWords("");
      setCoverImage(null);
      setStep(1);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, newCategoryName.trim()]);
      setCategory(newCategoryName.trim());
      setNewCategoryName("");
      setIsAddingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white/85 dark:bg-neutral-900/85 backdrop-blur-2xl w-full max-w-2xl rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-white/40 dark:border-neutral-800/40 relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-neutral-100/50 dark:border-neutral-800/50">
          <div className="space-y-1">
            <h2 className="font-headline font-extrabold text-2xl tracking-tight text-neutral-900 dark:text-neutral-50">
              {editItem ? "Edit Research" : "Start New Research"}
            </h2>
            <p className="text-xs font-label text-neutral-400 uppercase tracking-wider">
              {editItem ? "Update your curation node" : "Initialize a new curation node"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 flex gap-1">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                s <= step ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            />
          ))}
        </div>

        {/* Modal Body - Sliding Step Wrapper */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="p-8 overflow-y-auto space-y-8 flex-1 no-scrollbar"
            >
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Research Title */}
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Research Title</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-body text-sm py-4 px-4 outline-none transition-all dark:text-neutral-50 shadow-sm"
                      placeholder="e.g. The Evolution of Haptics"
                    />
                  </div>

                  {/* Category Selector */}
                  <div className="space-y-3">
                    <label className="font-label text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            category === cat
                              ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                              : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 hover:border-amber-500 hover:text-amber-600 shadow-sm"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                      
                      {isAddingNew ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                          <input
                            autoFocus
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddNewCategory()}
                            className="px-3 py-1 bg-white dark:bg-neutral-800 border border-amber-500 rounded-full text-xs outline-none w-24 dark:text-neutral-50"
                            placeholder="Kategori..."
                          />
                          <button 
                            onClick={handleAddNewCategory}
                            className="p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => setIsAddingNew(false)}
                            className="p-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsAddingNew(true)}
                          className="px-3 py-1.5 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-400 flex items-center gap-1 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add New
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Cover Image</label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {coverImage ? (
                      <div className="relative rounded-2xl overflow-hidden group border border-neutral-200 dark:border-neutral-800 shadow-xl animate-in fade-in duration-500">
                        <img src={coverImage} alt="Cover preview" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setCoverImage(null)}
                            className="p-2.5 bg-red-500 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 flex flex-col items-center justify-center bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 hover:border-amber-500/50 transition-all cursor-pointer group"
                      >
                        <ImageIcon className="text-neutral-400 w-8 h-8 mb-3 group-hover:scale-110 transition-transform group-hover:text-amber-500" />
                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          Drop your file here or <span className="text-amber-600 underline">browse</span>
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-tighter">JPG, PNG or WEBP (MAX 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <MarkdownEditor
                    label="Brief Description / Content"
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe the intent and scope of this research..."
                    rows={12}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <MarkdownEditor
                    label="Golden Words (Key Insights)"
                    value={goldenWords}
                    onChange={setGoldenWords}
                    placeholder="Kritik özetler, altın sözler veya can alıcı noktalar..."
                    rows={12}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-neutral-100/50 dark:border-neutral-800/50 flex items-center justify-between gap-4 bg-white/40 dark:bg-black/20">
          <div className="flex-1">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 font-label text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 font-label text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={!title}
                className="bg-amber-500 text-black px-8 py-2.5 font-label text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/10 hover:scale-105 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-30 disabled:grayscale"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={() => onSave({ 
                  title, 
                  category, 
                  description, 
                  goldenWords, 
                  coverImage, 
                  id: editItem?.id,
                  date: editItem?.date || new Date().toISOString()
                })}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-2.5 font-label text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
              >
                <span>{editItem ? "Update Research" : "Finish Protocol"}</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
