"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Bell, Settings, Network, 
  ZoomIn, ZoomOut, Target, Filter, 
  LayoutDashboard, Brain, Share2, Layers,
  ChevronDown, Hexagon, Fingerprint, Activity,
  Sparkles, Zap, Eye, BarChart3
} from "lucide-react";
import { networkDb, NetworkNode as NodeData } from "@/components/lifestyle/lib/network-db";
import { NetworkNode } from "@/components/lifestyle/NetworkNode";
import { NetworkCanvas } from "@/components/lifestyle/NetworkCanvas";
import { NodeDetailsPanel } from "@/components/lifestyle/NodeDetailsPanel";
import { NewNodeModal } from "@/components/lifestyle/NewNodeModal";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Universal", "Strategic", "Personal", "Professional"];

const INITIAL_CORE: NodeData = {
  id: "core-self",
  name: "CORE_UNIT_01",
  role: "Visionary CEO",
  type: "professional",
  notes: "Primary strategic node. Root of the Sovereign Intelligence ecosystem.",
  connections: [],
  position: { x: 500, y: 400 },
  affinity: 100
};

export default function NetworkTreePage() {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [activeCategory, setActiveCategory] = useState("Universal");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'focus' | 'heatmap'>('normal');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{ bridges: string[], gaps: {a: string, b: string}[] } | null>(null);
  const [scale, setScale] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const loadNodes = async () => {
    try {
      let all = await networkDb.getAllNodes();
      if (all.length === 0) {
        await networkDb.saveNode(INITIAL_CORE);
        all = [INITIAL_CORE];
      }
      setNodes(all);
    } catch (err) {
      console.error("Failed to load neural nodes", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNodes();
  }, []);

  const handleNodeDrag = useCallback((id: string, pos: { x: number; y: number }) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, position: pos } : n));
  }, []);

  const handleNodeSave = async (id: string, pos: { x: number; y: number }) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      await networkDb.saveNode({ ...node, position: pos });
    }
  };

  const handleNodeAdd = async (newNode: NodeData) => {
    await networkDb.saveNode(newNode);
    await loadNodes();
    setIsAddingNode(false);
    setEditingNode(null);
  };

  const runNeuralAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResults(null);
    
    // Artificial delay for "processing" feel
    setTimeout(() => {
      // Bridge Detection: Nodes with > 3 connections
      const bridges = nodes.filter(n => n.connections.length > 3).map(n => n.id);
      
      // Gap Detection: Nodes of same type but not connected
      const gaps: {a: string, b: string}[] = [];
      const types = ['strategic', 'personal', 'professional'];
      types.forEach(t => {
        const matching = nodes.filter(n => n.type === t);
        for(let i=0; i<matching.length; i++) {
          for(let j=i+1; j<matching.length; j++) {
            if(!matching[i].connections.includes(matching[j].id)) {
              if (gaps.length < 3) gaps.push({ a: matching[i].name, b: matching[j].name });
            }
          }
        }
      });

      setAnalysisResults({ bridges, gaps });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleNodeClick = async (node: NodeData) => {
    if (isConnecting && selectedNode && selectedNode.id !== node.id) {
      // Create connection
      const updatedSource = { 
        ...selectedNode, 
        connections: Array.from(new Set([...selectedNode.connections, node.id])) 
      };
      await networkDb.saveNode(updatedSource);
      
      // Mutual connection (optional, but good for this UI)
      const updatedTarget = { 
        ...node, 
        connections: Array.from(new Set([...node.connections, selectedNode.id])) 
      };
      await networkDb.saveNode(updatedTarget);
      
      await loadNodes();
      setIsConnecting(false);
      setSelectedNode(updatedSource);
    } else {
      setSelectedNode(node);
    }
  };

  const filteredNodes = nodes.filter(n => {
    const matchesCat = activeCategory === "Universal" || n.type === activeCategory.toLowerCase();
    const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-500">
      {/* Neural Background Layer */}
      <div className="absolute inset-0 z-0 radial-bg opacity-80" />
      <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(currentColor 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

      <main className="h-screen w-full relative overflow-hidden bg-black/5 dark:bg-black/20">
        {/* Connection Mode Helper */}
        <AnimatePresence>
          {isConnecting && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-32 left-1/2 -translate-x-1/2 z-[100] bg-primary px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl shadow-primary/20"
            >
              <Activity className="w-5 h-5 text-on-primary animate-pulse" />
              <p className="text-on-primary font-black text-xs uppercase tracking-widest">
                Linking Intelligence: Select target node for <span className="underline">{selectedNode?.name}</span>
              </p>
              <button 
                onClick={() => setIsConnecting(false)}
                className="ml-4 p-2 bg-black/10 rounded-lg hover:bg-black/20 transition-all text-on-primary"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filter Matrix Overlay */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 flex gap-2 p-1.5 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/10 shadow-3xl">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                activeCategory === cat 
                  ? "bg-primary text-on-primary shadow-xl scale-105" 
                  : "text-neutral-500 dark:text-neutral-500 hover:text-on-surface dark:hover:text-neutral-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Neural Analysis Portal */}
        <div className="absolute top-10 left-10 z-40 flex flex-col gap-4">
          <button 
            onClick={runNeuralAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl px-6 py-4 rounded-2xl border border-black/5 dark:border-white/10 group hover:border-primary/30 transition-all shadow-3xl overflow-hidden relative"
          >
            {isAnalyzing && (
              <motion.div 
                className="absolute inset-0 bg-primary/10"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <Sparkles className={cn("w-4 h-4 text-primary", isAnalyzing && "animate-spin")} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface dark:text-white">Neural Analysis</span>
              <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Identify Bridge Nodes</span>
            </div>
          </button>

          <AnimatePresence>
            {analysisResults && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-72 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-3xl p-6 rounded-3xl border border-black/10 dark:border-amber-500/20 shadow-4xl flex flex-col gap-6"
              >
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Intelligence Report
                  </span>
                  <button onClick={() => setAnalysisResults(null)} className="text-neutral-500 hover:text-on-surface dark:hover:text-white"><Plus className="w-4 h-4 rotate-45" /></button>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Bridge Assets Found</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.bridges.map(id => {
                      const n = nodes.find(node => node.id === id);
                      return n ? (
                        <span key={id} className="px-2 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-md text-[9px] font-bold text-on-surface-variant dark:text-neutral-300">{n.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Suggested Connections</h5>
                  <div className="space-y-2">
                    {analysisResults.gaps.map((gap, i) => (
                      <div key={i} className="flex items-center gap-2 text-[9px] text-neutral-500 p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                        <span className="text-primary font-bold">{gap.a}</span>
                        <ChevronDown className="w-3 h-3 -rotate-90" />
                        <span className="text-primary font-bold">{gap.b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Neural Grid Canvas */}
        <div className="absolute inset-0 z-10 p-20 cursor-move" style={{ transform: `scale(${scale})` }}>
          <NetworkCanvas nodes={filteredNodes} />
          
          {filteredNodes.map((node) => {
            const isFocusMode = viewMode === 'focus';
            const isHeatmap = viewMode === 'heatmap';
            const isRelated = selectedNode && (node.id === selectedNode.id || selectedNode.connections.includes(node.id) || node.connections.includes(selectedNode.id));
            
            return (
              <NetworkNode 
                key={node.id} 
                node={node}
                scale={scale * (isHeatmap ? (0.8 + (node.affinity || 85) / 100) : 1)}
                isSelected={selectedNode?.id === node.id || (isConnecting && selectedNode?.id === node.id)}
                opacity={isFocusMode && !isRelated ? 0.2 : 1}
                onClick={handleNodeClick}
                onDrag={(id, pos) => {
                  handleNodeDrag(id, pos);
                  handleNodeSave(id, pos);
                }}
              />
            );
          })}
        </div>

        {/* Control Interface (Bottom Right) */}
        <div className="absolute bottom-12 right-12 z-[100] flex flex-col items-end gap-4">
          <AnimatePresence>
            {isControlsVisible && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="flex flex-col gap-4"
              >
                <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-3xl p-3 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col gap-2 shadow-3xl">
                  {/* View Mode Switching */}
                  <div className="flex flex-col gap-1 mb-2 border-b border-black/5 dark:border-white/5 pb-2">
                    {[
                      { id: 'normal', icon: Eye, label: 'Standard' },
                      { id: 'focus', icon: Target, label: 'Focus' },
                      { id: 'heatmap', icon: BarChart3, label: 'Heatmap' }
                    ].map(mode => (
                      <button 
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                          viewMode === mode.id ? "bg-primary text-on-primary shadow-lg" : "text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                        title={mode.label}
                      >
                        <mode.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>

                  <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-on-surface-variant dark:text-neutral-400">
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-on-surface-variant dark:text-neutral-400">
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <div className="h-px bg-black/5 dark:bg-white/5 mx-2 my-1" />
                  <button onClick={() => setScale(1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 transition-all text-primary">
                    <Target className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setEditingNode(null);
                    setIsAddingNode(true);
                  }}
                  className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-3xl h-16 px-8 rounded-2xl border border-black/10 dark:border-white/10 flex items-center gap-4 shadow-3xl group hover:scale-105 active:scale-95 transition-all outline-none whitespace-nowrap"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                    <Network className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface dark:text-neutral-100">Deploy Global Node</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsControlsVisible(!isControlsVisible)}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl overflow-hidden group border",
              isControlsVisible 
                ? "bg-white dark:bg-neutral-900 border-black/10 dark:border-white/10 text-neutral-500 hover:text-on-surface dark:hover:text-white" 
                : "bg-primary border-primary text-on-primary shadow-primary/20"
            )}
          >
            {isControlsVisible ? (
              <ChevronDown className="w-6 h-6" />
            ) : (
              <div className="relative flex flex-col items-center">
                <Brain className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-error border border-primary animate-pulse" />
              </div>
            )}
          </motion.button>
        </div>

        {/* Side Info Panel */}
        <NodeDetailsPanel 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
          onEdit={(node) => {
            setEditingNode(node);
            setIsAddingNode(true);
          }}
          onConnect={() => setIsConnecting(true)}
        />
        
        {/* New/Edit Node Deployment Modal */}
        <NewNodeModal 
          isOpen={isAddingNode}
          onClose={() => {
            setIsAddingNode(false);
            setEditingNode(null);
          }}
          onSave={handleNodeAdd}
          editNode={editingNode}
        />
      </main>
    </div>
  );
}
