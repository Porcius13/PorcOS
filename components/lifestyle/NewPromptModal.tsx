"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Terminal, Code2, History, ChevronDown, Save, Sparkles, Command, Sliders, Image as ImageIcon, Cpu, Plus, Info } from "lucide-react";
import { promptsDb, PromptData } from "./lib/prompts-db";
import { ImageUpload } from "@/components/image-upload";

const MODELS = [
  { name: "Gemini 2.0 Flash (Exp)", color: "bg-blue-500" },
  { name: "Gemini 1.5 Pro", color: "bg-blue-600" },
  { name: "Gemini 1.5 Flash", color: "bg-blue-400" },
  { name: "GPT-4o (OMNI)", color: "bg-amber-400" },
  { name: "Claude-3.5 Sonnet", color: "bg-purple-600" },
  { name: "Llama-3 (Local)", color: "bg-neutral-400" },
];
const AI_TOOLS = ["Default", "Nano", "Pro", "Deep Research", "Reasoning"];

interface NewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: PromptData | null;
}

export const NewPromptModal = ({ isOpen, onClose, onSuccess, editData }: NewPromptModalProps) => {
  const [formData, setFormData] = useState<Partial<PromptData>>({
    title: "",
    content: "",
    category: "STRATEGIC",
    aiModel: "Gemini 1.5 Pro",
    aiTool: "Default",
    explanation: "",
    temperature: 0.7,
    isFavorite: false,
    usageCount: 0,
    tags: [],
    image: undefined,
  });

  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const loadCategories = async () => {
    const list = await promptsDb.getAllPrompts();
    const cats = Array.from(new Set(list.map(p => p.category))).sort();
    setExistingCategories(cats.length > 0 ? cats : ["STRATEGIC", "CODING", "LOGIC", "CREATIVE"]);
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (editData) {
        setFormData(editData);
      } else {
        setFormData({
          title: "",
          content: "",
          category: "STRATEGIC",
          aiModel: "Gemini 1.5 Pro",
          aiTool: "Default",
          explanation: "",
          temperature: 0.7,
          isFavorite: false,
          usageCount: 0,
          tags: [],
          image: undefined,
        });
      }
      setIsAddingNewCategory(false);
      setNewCategoryName("");
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editData?.id || crypto.randomUUID();
    const date = new Date().toISOString();
    
    const finalCategory = isAddingNewCategory ? newCategoryName.trim().toUpperCase() : formData.category;
    
    if (!finalCategory) return;

    await promptsDb.savePrompt({
      ...formData as PromptData,
      id,
      date,
      category: finalCategory,
      modelColor: MODELS.find(m => m.name === formData.aiModel)?.color,
    });
    
    onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-white dark:bg-neutral-900 shadow-2xl rounded-[3rem] border border-neutral-200 dark:border-white/10 flex flex-col overflow-hidden max-h-[92vh]"
          >
            {/* Modal Header */}
            <header className="px-10 pt-10 pb-6 flex justify-between items-center relative z-10 font-sans border-b border-neutral-100 dark:border-white/5 bg-white dark:bg-neutral-900">
              <div className="flex flex-col">
                <h1 className="font-headline font-black text-2xl tracking-[0.2em] text-amber-500 uppercase italic">PROMPT ENGINE</h1>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 tracking-[0.3em] uppercase mt-1">Intelligence v.2.2.0 - Command Rationale Integration</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar font-sans bg-white dark:bg-neutral-900">
              <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-10">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase ml-1">Command Designation</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter objective title..." 
                      className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-white/10 rounded-2xl px-8 py-5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm font-bold outline-none"
                    />
                  </div>

                  {/* PROMPT EXPLANATION / RATIONALE */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase ml-1 flex items-center gap-2">
                        Operational Logic <Info className="w-3.5 h-3.5" />
                    </label>
                    <textarea 
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      rows={2}
                      placeholder="What does this prompt accomplish? (Operational summary...)" 
                      className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-white/10 rounded-2xl px-8 py-4 text-neutral-800 dark:text-neutral-200 text-xs italic placeholder:text-neutral-400 dark:placeholder:text-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[11px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase">Operational Sphere</label>
                        <button 
                            onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                            className="text-[10px] font-black text-amber-500 hover:underline flex items-center gap-1 uppercase tracking-widest"
                        >
                            {isAddingNewCategory ? "SELECT EXISTING" : "ADD NEW CATEGORY"}
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    {isAddingNewCategory ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <input 
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="ENTER NEW CATEGORY NAME..."
                                className="w-full bg-amber-500/5 border border-amber-500/30 rounded-2xl px-8 py-5 text-amber-600 dark:text-amber-500 placeholder:text-amber-500/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all text-sm font-black tracking-widest outline-none uppercase"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2.5">
                        {existingCategories.map(category => (
                            <button
                            key={category}
                            type="button"
                            onClick={() => setFormData({ ...formData, category })}
                            className={`px-5 py-2 rounded-full border text-[10px] font-black tracking-widest transition-all uppercase ${
                                formData.category === category 
                                ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                                : 'border-neutral-100 dark:border-white/5 text-neutral-400 dark:text-neutral-600 hover:border-neutral-300 dark:hover:border-white/20 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                            >
                            {category}
                            </button>
                        ))}
                        </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[11px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase">Kernel Prompt Syntax</label>
                      <div className="flex gap-4">
                        <Terminal className="w-4 h-4 text-neutral-400 dark:text-neutral-600 hover:text-amber-500 cursor-pointer" />
                        <Code2 className="w-4 h-4 text-neutral-400 dark:text-neutral-600 hover:text-amber-500 cursor-pointer" />
                        <History className="w-4 h-4 text-neutral-400 dark:text-neutral-600 hover:text-amber-500 cursor-pointer" />
                      </div>
                    </div>
                    <div className="relative group">
                      <textarea 
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={10}
                        placeholder="// Define your intelligence parameters here..." 
                        className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-white/10 rounded-[2rem] p-8 text-neutral-700 dark:text-neutral-300 font-mono text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none outline-none leading-relaxed"
                      />
                      <div className="absolute bottom-6 right-8 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Compiler Ready</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-10">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase ml-1 flex items-center gap-2">
                        Multimodal Visuals <ImageIcon className="w-3.5 h-3.5" />
                    </label>
                    <div className="bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 hover:border-amber-500/30 transition-all">
                        <ImageUpload 
                            onImageChange={(base64) => setFormData({ ...formData, image: base64 || undefined })}
                            initialImage={formData.image} 
                        />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase ml-1 flex items-center gap-2">
                        Engine Core <Cpu className="w-3.5 h-3.5" />
                    </label>
                    <div className="relative">
                      <select 
                        value={formData.aiModel}
                        onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-white/10 rounded-2xl px-8 py-5 text-neutral-900 dark:text-neutral-100 font-bold appearance-none outline-none focus:border-amber-500/50 transition-all text-xs tracking-widest"
                      >
                        {MODELS.map(model => (
                          <option key={model.name} value={model.name} className="bg-white dark:bg-neutral-900">{model.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 dark:text-neutral-600 w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase ml-1 flex items-center gap-2">
                        Operational Tooling <Sliders className="w-3.5 h-3.5" />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {AI_TOOLS.map(tool => (
                            <button
                                key={tool}
                                type="button"
                                onClick={() => setFormData({ ...formData, aiTool: tool })}
                                className={`px-4 py-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                    formData.aiTool === tool
                                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-500 transition-all'
                                    : 'border-neutral-100 dark:border-white/5 text-neutral-400 dark:text-neutral-600 hover:border-neutral-300 dark:hover:border-white/10 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                            >
                                <Sparkles className={`w-3 h-3 ${formData.aiTool === tool ? "opacity-100 shadow-[0_0_8px_currentColor]" : "opacity-30"}`} />
                                {tool}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase ml-1">Neural Temperature</label>
                    <div className="px-8 py-4 bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-white/10 rounded-2xl flex items-center gap-6">
                      <input 
                        type="range" 
                        min="0" max="1" step="0.1" 
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                        className="flex-1 accent-amber-500 bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full cursor-pointer appearance-none outline-none"
                      />
                      <span className="text-xs font-black text-amber-600 dark:text-amber-500 w-8">{formData.temperature?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <footer className="px-10 py-8 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-100 dark:border-white/5 flex justify-end items-center gap-10 font-sans backdrop-blur-md relative z-20">
              <button 
                type="button" 
                onClick={onClose}
                className="text-[10px] font-black tracking-[0.2em] text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase transition-all"
              >
                CANCEL
              </button>
              <button 
                onClick={handleSubmit}
                className="group flex items-center gap-3 px-12 py-5 rounded-full bg-amber-500 text-black font-black text-[10px] tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase"
              >
                SAVE COMMAND
                <Zap className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
