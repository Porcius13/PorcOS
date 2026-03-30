"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, UserPlus, Shield, Heart, Briefcase, Camera,
  Plus, Linkedin, Twitter, Target, Info
} from "lucide-react";
import { NetworkNode } from "./lib/network-db";
import { cn } from "@/lib/utils";
import { ImageUpload } from "../image-upload";

interface NewNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: NetworkNode) => void;
  editNode?: NetworkNode | null;
}

const TYPES = [
  { id: 'strategic', label: 'Strategic', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'personal', label: 'Personal', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'professional', label: 'Professional', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
];

export function NewNodeModal({ isOpen, onClose, onSave, editNode }: NewNodeModalProps) {
  const [name, setName] = useState(editNode?.name || "");
  const [role, setRole] = useState(editNode?.role || "");
  const [type, setType] = useState<NetworkNode['type']>(editNode?.type || 'professional');
  const [image, setImage] = useState(editNode?.image || "");
  const [notes, setNotes] = useState(editNode?.notes || "");
  const [tags, setTags] = useState<string[]>(editNode?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [linkedin, setLinkedin] = useState(editNode?.socialLinks?.linkedin || "");
  const [twitter, setTwitter] = useState(editNode?.socialLinks?.twitter || "");
  const [affinity, setAffinity] = useState(editNode?.affinity || 85);

  // Update state when editNode changes
  React.useEffect(() => {
    if (editNode) {
      setName(editNode.name);
      setRole(editNode.role);
      setType(editNode.type);
      setImage(editNode.image || "");
      setNotes(editNode.notes);
      setTags(editNode.tags || []);
      setLinkedin(editNode.socialLinks?.linkedin || "");
      setTwitter(editNode.socialLinks?.twitter || "");
      setAffinity(editNode.affinity || 85);
    } else {
      reset();
    }
  }, [editNode]);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput.toLowerCase())) {
      setTags([...tags, tagInput.toLowerCase().replace(/\s+/g, '_')]);
      setTagInput("");
    }
  };

  const handleSave = () => {
    if (!name || !role) return;

    const newNode: NetworkNode = {
      ...(editNode || {}),
      id: editNode?.id || crypto.randomUUID(),
      name,
      role,
      type,
      image,
      notes,
      tags,
      socialLinks: { linkedin, twitter },
      affinity,
      connections: editNode?.connections || ['core-self'],
      position: editNode?.position || { x: 400 + Math.random() * 200, y: 300 + Math.random() * 200 },
    } as NetworkNode;

    onSave(newNode);
    reset();
  };

  const reset = () => {
    setName("");
    setRole("");
    setType("professional");
    setImage("");
    setNotes("");
    setTags([]);
    setLinkedin("");
    setTwitter("");
    setAffinity(85);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-neutral-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">Deploy New Node</h2>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Intelligence Asset Registry</p>
              </div>
            </div>
            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </header>

          <div className="p-8 overflow-y-auto no-scrollbar space-y-8 flex-1">
            {/* Identity Card */}
            <div className="flex gap-8">
              <div className="flex-shrink-0 w-32 h-32">
                <ImageUpload 
                  initialImage={image} 
                  onImageChange={(val) => setImage(val || "")} 
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Asset Name</label>
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full identity..."
                    className="w-full bg-neutral-800/50 border border-white/5 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-neutral-600 focus:border-amber-500/30 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Operational Role</label>
                  <input 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Strategic VC, Mentor, etc."
                    className="w-full bg-neutral-800/50 border border-white/5 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-neutral-600 focus:border-amber-500/30 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Strategic Tags */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Strategic Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black rounded-lg uppercase tracking-widest flex items-center gap-2">
                    #{tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-white transition-colors">
                      <Plus className="w-3 h-3 rotate-45" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag (e.g. Investor)..."
                  className="flex-1 bg-neutral-800/50 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-amber-500/30 outline-none transition-all"
                />
                <button onClick={handleAddTag} className="p-2 bg-neutral-800 border border-white/5 rounded-xl hover:bg-neutral-700 transition-all text-neutral-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Social Protocols */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Social Protocols</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 opacity-50" />
                  <input 
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="w-full bg-neutral-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:border-blue-400/30 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 opacity-50" />
                  <input 
                    value={twitter}
                    onChange={e => setTwitter(e.target.value)}
                    placeholder="X / Twitter Handle"
                    className="w-full bg-neutral-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:border-white/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Neural Affinity Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                  <Target className="w-3 h-3 text-amber-500" />
                  Neural Affinity
                </label>
                <span className="text-amber-500 text-[10px] font-black">{affinity}% Match</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={affinity}
                onChange={e => setAffinity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Classification */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Neural Classification</label>
              <div className="grid grid-cols-3 gap-3">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id as any)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all group",
                      type === t.id 
                        ? `${t.bg} border-amber-500/30` 
                        : "bg-neutral-800/30 border-white/5 hover:border-white/10"
                    )}
                  >
                    <t.icon className={cn("w-6 h-6 transition-all", type === t.id ? t.color : "text-neutral-500")} />
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", type === t.id ? t.color : "text-neutral-500")}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Intel Notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Intelligence Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tactical details, contact info, affinity metrics..."
                rows={3}
                className="w-full bg-neutral-800/50 border border-white/5 rounded-2xl px-5 py-4 text-sm font-medium text-neutral-300 placeholder:text-neutral-600 focus:border-amber-500/30 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <footer className="p-8 border-t border-white/5 bg-white/5 flex gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              Abort Deployment
            </button>
            <button 
              onClick={handleSave}
              disabled={!name || !role}
              className="flex-1 py-4 bg-amber-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95"
            >
              Execute Deployment
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
