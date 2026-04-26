"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Brain, Clock, Archive, Star, Trash2, Plus, Search, Settings, 
  UserCircle, FolderGit2, Repeat, Lightbulb, Wallet, Focus, Layers, 
  Activity, Minus, Menu, X, ArrowUpRight, Send, Link2, Undo, Type, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as htmlToImage from "html-to-image";
import ReactMarkdown from "react-markdown";

type NodeData = {
  id: string;
  x: number;
  y: number;
  title: string;
  iconName: "FolderGit2" | "Repeat" | "Lightbulb" | "Wallet" | "Brain";
  children?: { id: string; title: string; dx: number; dy: number }[];
  isFavorite?: boolean;
  isArchived?: boolean;
  // --- Professional Fields ---
  description?: string;
  color?: string; // Hex or tailwind color class
  tags?: string[];
  extraConnections?: string[]; // Array of node IDs to draw free-form lines to
  deepLink?: string; // URL or internal OS path
};

const iconMap = {
  FolderGit2,
  Repeat,
  Lightbulb,
  Wallet,
  Brain
};

const defaultNodes: NodeData[] = [
  { 
    id: "1", x: -350, y: -250, title: "Projeler", iconName: "FolderGit2",
    children: [{ id: "c1", title: "Research", dx: -80, dy: -80 }, { id: "c2", title: "Drafts", dx: -100, dy: 60 }]
  },
  { 
    id: "2", x: 350, y: -250, title: "Rutinler", iconName: "Repeat",
    children: [{ id: "c3", title: "Workout", dx: 80, dy: -80 }, { id: "c4", title: "Habits", dx: 100, dy: 60 }]
  },
  { id: "3", x: -350, y: 250, title: "Fikir Çöplüğü", iconName: "Lightbulb" },
  { id: "4", x: 350, y: 250, title: "Finans", iconName: "Wallet" },
];

export default function NeuralHubPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("Atlas");
  const [activeMenu, setActiveMenu] = useState("Brain");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null); // Node ID initiating link
  const [linkTarget, setLinkTarget] = useState<{x: number, y: number} | null>(null); // Mouse pos for drawing line
  const [notesPreview, setNotesPreview] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Canvas State -> Default to 0,0 and 1 zoom before load
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const lastMousePosCanvas = useRef({ x: 0, y: 0 });
  
  // Node State
  const [selectedNode, setSelectedNode] = useState<{ id: string, type: 'main'|'child', parentId?: string } | null>(null);
  const [draggedNode, setDraggedNode] = useState<{ id: string, type: 'main'|'child', parentId?: string } | null>(null);
  const [editingNode, setEditingNode] = useState<{ id: string, type: 'main'|'child', parentId?: string } | null>(null);
  const lastMousePosNode = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ dx: 0, dy: 0 }); // PERFORMANCE TRICK: For dragging without re-rending state.
  
  const [trashedNodes, setTrashedNodes] = useState<NodeData[]>([]);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [history, setHistory] = useState<NodeData[][]>([]);

  // Load from Local Storage on Mount
  useEffect(() => {
    setIsMounted(true);
    
    const savedNodes = localStorage.getItem("mindmap_nodes");
    if (savedNodes) {
      try { setNodes(JSON.parse(savedNodes)); } catch (e) { setNodes(defaultNodes); }
    } else {
      setNodes(defaultNodes);
    }
    
    const savedTrash = localStorage.getItem("mindmap_trash");
    if (savedTrash) {
      try { setTrashedNodes(JSON.parse(savedTrash)); } catch (e) {}
    }

    const savedView = localStorage.getItem("mindmap_view");
    if (savedView) {
      try {
        const { pan: savedPan, zoom: savedZoom } = JSON.parse(savedView);
        if (savedPan) setPan(savedPan);
        if (savedZoom) setZoom(savedZoom);
      } catch (e) {}
    }
  }, []);

  // Sync to Local Storage
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("mindmap_nodes", JSON.stringify(nodes));
  }, [nodes, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("mindmap_trash", JSON.stringify(trashedNodes));
  }, [trashedNodes, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("mindmap_view", JSON.stringify({ pan, zoom }));
  }, [pan, zoom, isMounted]);

  // Push history on changes (Throttled roughly)
  const pushHistory = useCallback((newNodes: NodeData[]) => {
    setHistory(prev => {
      const newHistory = [...prev, newNodes];
      if (newHistory.length > 20) newHistory.shift(); // Keep last 20 states
      return newHistory;
    });
  }, []);

  // Global Keydown for Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        // Allow Cmd+F for search anywhere though
        if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
           e.preventDefault();
           searchInputRef.current?.focus();
        }
        return;
      }
      
      // Cmd + F Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Cmd + Z Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        setHistory(prev => {
          if (prev.length === 0) return prev;
          const lastState = prev[prev.length - 1];
          setNodes(lastState);
          return prev.slice(0, prev.length - 1);
        });
      }

      // Delete Node
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode) {
          pushHistory(nodes);
          setNodes(prev => {
            if (selectedNode.type === 'main') {
              const toTrash = prev.find(n => n.id === selectedNode.id);
              if (toTrash) setTrashedNodes(t => [...t, toTrash]);
              return prev.filter(n => n.id !== selectedNode.id);
            } else {
              return prev.map(n => {
                if (n.id === selectedNode.parentId) {
                  return { ...n, children: n.children?.filter(c => c.id !== selectedNode.id) };
                }
                return n;
              });
            }
          });
          setSelectedNode(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, nodes, pushHistory]);

  // --- Canvas Drag Handlers ---
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.mind-node')) return;
    setSelectedNode(null); // Deselect nodes when clicking canvas
    setIsDraggingCanvas(true);
    lastMousePosCanvas.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCanvas) return;
    const dx = e.clientX - lastMousePosCanvas.current.x;
    const dy = e.clientY - lastMousePosCanvas.current.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePosCanvas.current = { x: e.clientX, y: e.clientY };
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    setIsDraggingCanvas(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.002;
      setZoom((prev) => Math.min(Math.max(0.2, prev - e.deltaY * zoomSensitivity), 3));
    } else {
      setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.2));
  const handleRecenter = () => { setPan({ x: 0, y: 0 }); setZoom(1); };
  
  const handleToggleFavorite = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  const handleToggleArchive = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, isArchived: !n.isArchived } : n));
    setSelectedNode(null);
    setShowDetails(false);
  };

  const handleUpdateNode = (id: string, updates: Partial<NodeData>) => {
    pushHistory(nodes);
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
  };

  const handleSync = () => {
    // Mock sync
    const notification = document.createElement("div");
    notification.className = "fixed top-20 right-10 bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-2xl z-50 animate-bounce font-bold";
    notification.innerText = "✓ Sync Successful";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handleNewNode = (initX?: number, initY?: number) => {
    pushHistory(nodes);
    // Generate new node slightly away from center (0,0 is center in our setup)
    const angle = Math.random() * Math.PI * 2;
    const distance = 400 + Math.random() * 200;
    
    setNodes((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        x: initX !== undefined ? initX : Math.cos(angle) * distance,
        y: initY !== undefined ? initY : Math.sin(angle) * distance,
        title: "New Node",
        iconName: "Brain" as const,
        children: []
      }
    ]);
  };

  const handleAddSubNode = (parentId: string) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 160 + Math.random() * 40;
    
    setNodes(prev => prev.map(n => {
      if (n.id === parentId) {
        const newChild = { 
          id: Math.random().toString(), 
          title: "New Item", 
          dx: Math.cos(angle) * distance, 
          dy: Math.sin(angle) * distance 
        };
        // Auto-select the child so user can interact and it gets born with style
        setSelectedNode({ id: newChild.id, type: 'child', parentId: n.id });
        return {
          ...n,
          children: [...(n.children || []), newChild]
        };
      }
      return n;
    }));
  };

  // --- Node Drag Handlers ---
  const handleNodePointerDown = (e: React.PointerEvent, id: string, type: 'main'|'child', parentId?: string) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left click
    
    if (isLinking) {
      // Connect organically
      if (type === 'main' && isLinking !== id) {
        pushHistory(nodes);
        setNodes(prev => prev.map(n => {
          if (n.id === isLinking) {
            return { ...n, extraConnections: [...(n.extraConnections || []), id] };
          }
          return n;
        }));
      }
      setIsLinking(null);
      setLinkTarget(null);
      return;
    }

    // Select the node
    setSelectedNode({ id, type, parentId });
    if (type === 'main') setShowDetails(true);
    
    // Do not initiate drag if we are editing text
    if (editingNode?.id === id) return; 

    setDraggedNode({ id, type, parentId });
    lastMousePosNode.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { dx: 0, dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleNodePointerMove = (e: React.PointerEvent) => {
    if (isLinking && e.currentTarget.closest('.canvas-container')) {
      const dx = (e.clientX - window.innerWidth / 2 - pan.x) / zoom;
      const dy = (e.clientY - window.innerHeight / 2 - pan.y) / zoom;
      setLinkTarget({ x: dx, y: dy });
      return;
    }

    if (!draggedNode) return;
    e.stopPropagation();

    // DOM-based performance drag: We update via ref instead of setNodes for butter smooth 60fps
    const dx = (e.clientX - lastMousePosNode.current.x) / zoom;
    const dy = (e.clientY - lastMousePosNode.current.y) / zoom;
    lastMousePosNode.current = { x: e.clientX, y: e.clientY };
    
    dragOffsetRef.current.dx += dx;
    dragOffsetRef.current.dy += dy;
    
    const nodeEl = document.getElementById(`node-${draggedNode.id}`);
    if (nodeEl) {
      // Fast DOM manipulation
      nodeEl.style.transform = `translate(${dragOffsetRef.current.dx}px, ${dragOffsetRef.current.dy}px)`;
    }
  };

  const handleNodePointerUp = (e: React.PointerEvent) => {
    if (!draggedNode) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    
    // Commit the drag offset to state
    if (dragOffsetRef.current.dx !== 0 || dragOffsetRef.current.dy !== 0) {
      pushHistory(nodes);
      const { dx, dy } = dragOffsetRef.current;
      setNodes((prev) => prev.map(n => {
        if (draggedNode.type === 'main' && n.id === draggedNode.id) {
          return { ...n, x: n.x + dx, y: n.y + dy };
        }
        if (draggedNode.type === 'child' && n.id === draggedNode.parentId) {
          return {
            ...n,
            children: n.children?.map(c => c.id === draggedNode.id ? { ...c, dx: c.dx + dx, dy: c.dy + dy } : c)
          };
        }
        return n;
      }));
    }
    
    // Reset temporary transforms
    const nodeEl = document.getElementById(`node-${draggedNode.id}`);
    if (nodeEl) nodeEl.style.transform = '';
    
    setDraggedNode(null);
    dragOffsetRef.current = { dx: 0, dy: 0 };
  };

  // --- Node Edit Handlers ---
  const handleSaveTitle = (val: string) => {
    if (!editingNode || !val.trim()) {
      setEditingNode(null);
      return;
    }

    setNodes(prev => prev.map(n => {
      if (editingNode.type === 'main' && n.id === editingNode.id) {
        return { ...n, title: val };
      }
      if (editingNode.type === 'child' && n.id === editingNode.parentId) {
        return {
          ...n,
          children: n.children?.map(c => c.id === editingNode.id ? { ...c, title: val } : c)
        };
      }
      return n;
    }));
    setEditingNode(null);
  };

  // --- Neural Features ---
  const handleNeuralReorganize = () => {
    pushHistory(nodes);
    setNodes(prev => {
      // Basic Hierarchical Layout Algorithm
      const resolvedNodes = [...prev];
      const mainNodes = resolvedNodes.filter(n => n.children && n.children.length >= 0);
      
      const levelWidth = 350;
      const levelHeight = 250;
      
      mainNodes.forEach((node, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        node.x = (col - 1) * levelWidth;
        node.y = row * levelHeight - (Math.floor(mainNodes.length/3) * levelHeight) / 2;
        
        // Arrange children in a small circle around the parent
        if (node.children) {
          node.children.forEach((child, j) => {
            const angle = (j / node.children!.length) * Math.PI * 2;
            const dist = 140;
            child.dx = Math.cos(angle) * dist;
            child.dy = Math.sin(angle) * dist;
          });
        }
      });
      return resolvedNodes;
    });
  };

  // Filtered nodes for the canvas based on sidebar
  const filteredCanvasNodes = nodes.filter(node => {
    if (activeMenu === 'Brain') return !node.isArchived;
    if (activeMenu === 'Vault') return node.isArchived;
    if (activeMenu === 'Favorites') return node.isFavorite && !node.isArchived;
    if (activeMenu === 'Recents') return !node.isArchived; 
    if (activeMenu === 'Trash') return false; 
    return true;
  });

  const handleExportImage = () => {
    if (canvasRef.current) {
      // Temporarily hide UI overlays (optional) before capture
      const options = { backgroundColor: document.documentElement.classList.contains('dark') ? '#0a0a0a' : '#fafafa', pixelRatio: 2 };
      htmlToImage.toPng(canvasRef.current, options)
        .then(function (dataUrl) {
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = dataUrl;
          a.download = `neural-hub-export-${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
        .catch(function (error) {
          console.error('oops, something went wrong!', error);
        });
    }
  };

  const handleExportMarkdown = () => {
    let md = `# Neural Hub Export - ${new Date().toISOString().split('T')[0]}\n\n`;
    
    nodes.forEach(node => {
      md += `## ${node.title}\n\n`;
      if (node.description) md += `${node.description}\n\n`;
      if (node.tags && node.tags.length > 0) md += `**Tags:** ${node.tags.join(', ')}\n\n`;
      
      if (node.children && node.children.length > 0) {
        md += `### Sub-nodes:\n`;
        node.children.forEach(child => {
          md += `- ${child.title}\n`;
        });
        md += '\n';
      }
      
      if (node.extraConnections && node.extraConnections.length > 0) {
        md += `### Connections:\n`;
        node.extraConnections.forEach(connId => {
          const target = nodes.find(n => n.id === connId);
          if (target) md += `- Link to: ${target.title}\n`;
        });
        md += '\n';
      }
      md += '---\n\n';
    });
    
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `neural-hub-export-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentSelectedNode = selectedNode?.type === 'main' 
    ? nodes.find(n => n.id === selectedNode.id) 
    : null;

  // --- PersonalOS Integrations ---
  const sendToPlanner = () => {
    if (!currentSelectedNode) return;
    
    // Create Planner2 format task
    const newTask = {
      id: Date.now().toString(),
      title: currentSelectedNode.title,
      date: new Date().toISOString().split('T')[0],
      duration: 30, // default
      icon: "brain",
      color: currentSelectedNode.color || "#54a0ff",
      completed: false,
      inbox: true,
      notes: currentSelectedNode.description || "Sent from Neural Hub"
    };

    try {
      const stored = localStorage.getItem("planner2-tasks");
      let tasks = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(tasks)) tasks = [];
      tasks.push(newTask);
      localStorage.setItem("planner2-tasks", JSON.stringify(tasks));
      
      // Visual feedback
      const notification = document.createElement("div");
      notification.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 font-bold text-sm animate-pulse flex items-center gap-2";
      notification.innerHTML = `<svg class="w-4 h-4 text-[#ffd21f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Added to Planner Inbox`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch(e) {}
  };

  if (!isMounted) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center -m-4 sm:-m-6 lg:-m-8 bg-neutral-50 dark:bg-[#0a0a0a]">
        <Brain className="h-10 w-10 text-primary animate-pulse opacity-50" />
      </div>
    );
  }

  return (
    <div className="relative -m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-800 dark:text-zinc-300 overflow-hidden flex font-sans transition-colors duration-300">
      
      {/* Detail Panel Placeholder - Will animate in based on showDetails */}
      <AnimatePresence>
        {showDetails && currentSelectedNode && (
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 z-50 shadow-2xl p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-black text-xl text-primary uppercase tracking-tighter">Node Details</h3>
               <button onClick={() => setShowDetails(false)} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                 <X className="h-5 w-5" />
               </button>
            </div>

            <div className="space-y-10">
              <section>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Title</label>
                <input 
                  type="text" 
                  value={currentSelectedNode.title}
                  onChange={(e) => handleUpdateNode(currentSelectedNode.id, { title: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </section>

              <section>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">Description / Notes</label>
                  <button 
                    onClick={() => setNotesPreview(!notesPreview)}
                    className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded font-bold hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Type className="h-3 w-3" /> {notesPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {notesPreview ? (
                  <div className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none min-h-[150px] max-h-[300px] overflow-y-auto">
                    {currentSelectedNode.description ? <ReactMarkdown>{currentSelectedNode.description}</ReactMarkdown> : <span className="opacity-50 italic">No notes added. Support markdown.</span>}
                  </div>
                ) : (
                  <textarea 
                    rows={6}
                    placeholder="Add deep notes or brain dump here... (Markdown supported)"
                    value={currentSelectedNode.description || ""}
                    onChange={(e) => handleUpdateNode(currentSelectedNode.id, { description: e.target.value })}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl text-sm leading-relaxed focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                )}
              </section>

               <section>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Neural Connections</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {currentSelectedNode.extraConnections?.map(connId => {
                      const target = nodes.find(n => n.id === connId);
                      return (
                        <div key={connId} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold flex items-center gap-2 group">
                          {target?.title || "Unknown"}
                          <button 
                            onClick={() => {
                              const newConns = currentSelectedNode.extraConnections?.filter(id => id !== connId);
                              handleUpdateNode(currentSelectedNode.id, { extraConnections: newConns });
                            }}
                            className="bg-primary/20 hover:bg-primary text-white p-0.5 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <select 
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const current = currentSelectedNode.extraConnections || [];
                      if (!current.includes(e.target.value)) {
                        handleUpdateNode(currentSelectedNode.id, { extraConnections: [...current, e.target.value] });
                      }
                      e.target.value = "";
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">+ Link to another Node...</option>
                    {nodes.filter(n => n.id !== currentSelectedNode.id).map(n => (
                      <option key={n.id} value={n.id}>{n.title}</option>
                    ))}
                  </select>
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Tags / Clusters</label>
                <input 
                  type="text" 
                  placeholder="marketing, research, idea (comma separated)"
                  value={currentSelectedNode.tags?.join(", ") || ""}
                  onChange={(e) => handleUpdateNode(currentSelectedNode.id, { tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </section>

              <section>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">OS Deep Link</label>
                <div className="flex gap-2">
                   <div className="grow bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl flex items-center gap-2">
                     <Layers className="h-4 w-4 text-primary" />
                     <input 
                        type="text" 
                        placeholder="/lifestyle/research/ai-ethics"
                        value={currentSelectedNode.deepLink || ""}
                        onChange={(e) => handleUpdateNode(currentSelectedNode.id, { deepLink: e.target.value })}
                        className="bg-transparent border-none outline-none text-xs grow"
                     />
                   </div>
                   {currentSelectedNode.deepLink && (
                     <button 
                       onClick={() => router.push(currentSelectedNode.deepLink!)}
                       className="p-4 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all"
                       title="Open Deep Link"
                     >
                       <ArrowUpRight className="h-4 w-4" />
                     </button>
                   )}
                </div>
              </section>

              <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-4">
                 <button 
                  onClick={sendToPlanner}
                  className="w-full py-4 bg-black dark:bg-[#ffd21f] text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                 >
                   <Send className="h-4 w-4" />
                   Send to Planner Inbox
                 </button>
                 <div className="flex gap-4">
                   <button 
                    onClick={() => handleToggleFavorite(currentSelectedNode.id)}
                    className={`flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${currentSelectedNode.isFavorite ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-600' : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500'}`}
                   >
                     <Star className={`h-4 w-4 ${currentSelectedNode.isFavorite ? 'fill-current' : ''}`} />
                     {currentSelectedNode.isFavorite ? 'Favorited' : 'Favorite'}
                   </button>
                   <button 
                    onClick={() => handleToggleArchive(currentSelectedNode.id)}
                    className="flex-1 py-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                   >
                     <Archive className="h-4 w-4" />
                     Archive Node
                   </button>
                 </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sub-Sidebar / Navigation for Neural Hub */}
      <aside className={`shrink-0 bg-white/80 dark:bg-neutral-950/90 border-neutral-200 dark:border-neutral-800/50 flex flex-col z-20 backdrop-blur-2xl transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 border-r opacity-100' : 'w-0 border-none opacity-0 overflow-hidden'}`}>
        <div className="p-6 pt-10 min-w-[16rem]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-primary font-black text-sm uppercase tracking-wider">Neural Hub</h2>
              <p className="text-[10px] text-neutral-500 dark:text-zinc-500 uppercase tracking-widest">Personal OS Edition</p>
            </div>
          </div>
          
          <button 
            onClick={() => handleNewNode()}
            className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl mb-8 hover:bg-primary/80 transition-colors active:scale-95 duration-150 flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Node
          </button>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveMenu('Brain')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === 'Brain' ? 'border-2 border-primary text-primary shadow-sm dark:bg-primary/5' : 'text-neutral-600 dark:text-zinc-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Brain className="h-4 w-4" /> <span className="text-sm font-medium">Brain</span>
            </button>
            <button 
              onClick={() => setActiveMenu('Recents')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === 'Recents' ? 'bg-primary/10 text-primary font-bold shadow-inner' : 'text-neutral-600 dark:text-zinc-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Clock className="h-4 w-4" /> <span className="text-sm">Recents</span>
            </button>
            <button 
              onClick={() => setActiveMenu('Vault')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === 'Vault' ? 'border-2 border-primary text-primary shadow-sm dark:bg-primary/5' : 'text-neutral-600 dark:text-zinc-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Archive className="h-4 w-4" /> <span className="text-sm font-medium">Vault</span>
            </button>
            <button 
              onClick={() => setActiveMenu('Favorites')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === 'Favorites' ? 'border-2 border-primary text-primary shadow-sm dark:bg-primary/5' : 'text-neutral-600 dark:text-zinc-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Star className="h-4 w-4" /> <span className="text-sm font-medium">Favorites</span>
            </button>
            <button 
              onClick={() => setActiveMenu('Trash')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === 'Trash' ? 'border-2 border-primary text-primary shadow-sm dark:bg-primary/5' : 'text-neutral-600 dark:text-zinc-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <span className="flex items-center gap-3"><Trash2 className="h-4 w-4" /> <span className="text-sm font-medium">Trash</span></span>
              {trashedNodes.length > 0 && <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">{trashedNodes.length}</span>}
            </button>
          </nav>
          
          <div className="mt-auto p-4 bg-neutral-100 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800/50">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Neural Status</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold">Cerebro-Link Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Top App Bar inside Canvas */}
        <header className="absolute top-0 w-full z-30 flex justify-between items-center px-4 sm:px-8 h-16 bg-white/60 dark:bg-neutral-950/60 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800/50">
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Sidebar Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-zinc-400 hover:text-primary transition-colors focus:outline-none"
              title="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <span className="text-xl font-bold text-primary italic hidden sm:block">MindPlex</span>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveTab("Nodes")}
                className={`transition-colors h-16 px-1 ${activeTab === "Nodes" ? "text-primary font-semibold border-b-2 border-primary" : "text-neutral-500 hover:text-neutral-800 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
              >Nodes</button>
              <button 
                onClick={() => setActiveTab("Atlas")}
                className={`transition-colors h-16 px-1 ${activeTab === "Atlas" ? "text-primary font-semibold border-b-2 border-primary" : "text-neutral-500 hover:text-neutral-800 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
              >Atlas</button>
              <button 
                onClick={() => setActiveTab("Sync")}
                className={`transition-colors h-16 px-1 ${activeTab === "Sync" ? "text-primary font-semibold border-b-2 border-primary" : "text-neutral-500 hover:text-neutral-800 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
              >Sync</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-neutral-100 dark:bg-neutral-900 rounded-full px-4 py-2 flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 hidden sm:flex">
              <Search className="h-4 w-4 text-neutral-400 dark:text-zinc-400" />
              <input 
                ref={searchInputRef}
                className="bg-transparent border-none outline-none focus:ring-0 text-sm text-neutral-800 dark:text-zinc-300 w-32 md:w-48 placeholder-neutral-500" 
                placeholder="Search Hub..." 
                type="text"
              />
            </div>
          </div>
        </header>
        {activeTab === "Atlas" && (
          <>
            {/* Canvas Background Logic */}
            <div 
              className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing touch-none canvas-container"
              ref={canvasRef}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onWheel={handleWheel}
              onDoubleClick={(e) => {
                if ((e.target as HTMLElement).closest('.mind-node')) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const dx = (e.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
                const dy = (e.clientY - rect.top - rect.height / 2 - pan.y) / zoom;
                handleNewNode(dx, dy);
              }}
            >
              {/* Subtle Grid dots */}
              {showGrid && (
                <div 
                  className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
                  style={{ 
                    backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', 
                    backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`
                  }}
                />
              )}

              {/* Transformed Canvas Container for nodes & SVG */}
              <div 
                className="absolute inset-0 origin-center pointer-events-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                }}
              >
                <div className="absolute top-1/2 left-1/2">
                  {Array.from(new Set(nodes.flatMap(n => n.tags || []))).map(tag => {
                    const taggedNodes = nodes.filter(n => n.tags?.includes(tag));
                    if (taggedNodes.length < 2) return null;
                    
                    const minX = Math.min(...taggedNodes.map(n => n.x)) - 150;
                    const maxX = Math.max(...taggedNodes.map(n => n.x)) + 150;
                    const minY = Math.min(...taggedNodes.map(n => n.y)) - 100;
                    const maxY = Math.max(...taggedNodes.map(n => n.y)) + 100;
                    
                    return (
                      <div 
                        key={`cluster-${tag}`}
                        className="absolute bg-primary/5 dark:bg-primary/10 border-2 border-dashed border-primary/20 rounded-[100px] backdrop-blur-[2px] -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                        style={{
                          left: (minX + maxX) / 2,
                          top: (minY + maxY) / 2,
                          width: maxX - minX,
                          height: maxY - minY
                        }}
                      >
                        <span className="absolute top-4 left-10 text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-40">{tag} Group</span>
                      </div>
                    );
                  })}
                </div>

                {/* SVG Connections Container */}
                {showConnections && (
                  <svg className="absolute top-1/2 left-1/2 pointer-events-none text-primary opacity-60" style={{ overflow: 'visible' }}>
                    {/* Floating Link Target Line */}
                    {isLinking && linkTarget && (
                       <path 
                         d={`M ${nodes.find(n => n.id === isLinking)?.x || 0} ${nodes.find(n => n.id === isLinking)?.y || 0} L ${linkTarget.x} ${linkTarget.y}`} 
                         fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse"
                       />
                    )}
                    {filteredCanvasNodes.map(node => {
                      const midX = node.x / 2;
                      return (
                        <g key={`group-${node.id}`}>
                          {/* Main Line */}
                          <path 
                            d={`M 0 0 C ${midX} ${0}, ${midX} ${node.y}, ${node.x} ${node.y}`} 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            style={{ filter: "drop-shadow(0 0 8px currentColor)" }} 
                          />
                          {/* Sub Nodes Lines */}
                          {node.children?.map(child => {
                            const childAbsX = node.x + child.dx;
                            const childAbsY = node.y + child.dy;
                            return (
                              <line 
                                key={`line-child-${child.id}`}
                                x1={node.x}
                                y1={node.y}
                                x2={childAbsX}
                                y2={childAbsY}
                                stroke="currentColor" 
                                strokeWidth="2"
                                opacity="0.75"
                              />
                            );
                          })}
                          {/* Extra Neural Connections (Free-form) */}
                          {node.extraConnections?.map(targetId => {
                            const target = nodes.find(n => n.id === targetId);
                            if (!target) return null;
                            const midXFree = (node.x + target.x) / 2;
                            const midYFree = (node.y + target.y) / 2;
                            return (
                              <path 
                                key={`extra-${node.id}-${targetId}`}
                                d={`M ${node.x} ${node.y} Q ${midXFree + 50} ${midYFree - 50}, ${target.x} ${target.y}`} 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="1"
                                strokeDasharray="5,5"
                                opacity="0.4"
                                className="animate-pulse"
                              />
                            );
                          })}
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* Nodes Container */}
                <div className="absolute top-1/2 left-1/2 pointer-events-auto">
                  {/* Nucleus */}
                  <div 
                    className="absolute z-20 mind-node -translate-x-1/2 -translate-y-1/2"
                    onClick={handleRecenter}
                  >
                    <div className="w-32 h-32 rounded-full bg-primary/10 border border-primary/50 flex flex-col items-center justify-center backdrop-blur-md cursor-pointer hover:scale-105 transition-transform duration-300 shadow-[0_0_50px_var(--tw-shadow-color)] shadow-primary/20 hover:shadow-[0_0_80px_var(--tw-shadow-color)] hover:shadow-primary/40">
                      <Brain className="h-10 w-10 text-primary mb-1" />
                      <span className="text-[10px] font-black text-primary tracking-widest uppercase mt-1">Nucleus</span>
                    </div>
                  </div>

                  {/* Mapped Nodes */}
                  {filteredCanvasNodes.map(node => {
                    const IconComponent = iconMap[node.iconName] || Brain;
                    const isEditing = editingNode?.id === node.id && editingNode.type === 'main';
                    const isSelected = selectedNode?.id === node.id && selectedNode.type === 'main';

                    return (
                      <div 
                        key={node.id} 
                        id={`node-${node.id}`}
                        className="absolute z-10 mind-node -translate-x-1/2 -translate-y-1/2 cursor-move"
                        style={{ left: node.x, top: node.y }}
                        onPointerDown={(e) => handleNodePointerDown(e, node.id, 'main')}
                        onPointerMove={handleNodePointerMove}
                        onPointerUp={handleNodePointerUp}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingNode({ id: node.id, type: 'main' }); }}
                      >
                        <div className={`px-8 py-4 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-neutral-900/90 transition-all flex items-center justify-center min-w-[12rem] cursor-pointer relative
                          ${(selectedNode?.id === node.id && selectedNode?.type === 'main')
                            ? 'border-2 border-primary shadow-[0_0_30px_var(--tw-shadow-color)] shadow-primary/40 ring-1 ring-primary/50 scale-105' 
                            : 'border border-neutral-200 dark:border-neutral-700/80 hover:border-primary/50 hover:shadow-[0_0_20px_var(--tw-shadow-color)] hover:shadow-primary/20 shadow-lg group'
                          }`}
                        >
                          <span className="text-neutral-900 dark:text-zinc-100 font-bold text-lg flex items-center justify-center gap-3 whitespace-nowrap">
                            <IconComponent className={`h-5 w-5 ${(selectedNode?.id === node.id && selectedNode?.type === 'main') ? 'text-primary' : 'text-neutral-500 dark:text-primary'} shrink-0`} />
                            {(editingNode?.id === node.id && editingNode?.type === 'main') ? (
                              <input 
                                autoFocus
                                defaultValue={node.title}
                                onBlur={(e) => handleSaveTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.currentTarget.blur();
                                  e.stopPropagation();
                                }}
                                className="bg-transparent border-b-2 border-primary outline-none focus:ring-0 w-32 text-center text-current"
                              />
                            ) : (
                              <span className="min-w-[4rem] text-center select-none" title="Double click to edit">{node.title}</span>
                            )}
                          </span>

                          {/* Finans Widget Mock */}
                          {(node.title.toLowerCase() === 'finans' || node.title.toLowerCase() === 'budget') && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1 shadow-md text-[10px] font-black text-green-500 whitespace-nowrap flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ₺12,450
                            </div>
                          )}
                          
                          {/* Floating ADD SUB NODE Button */}
                          {(selectedNode?.id === node.id && selectedNode?.type === 'main') && (
                            <button 
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                handleAddSubNode(node.id);
                              }}
                              className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center shadow-lg shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-20 border-2 border-white dark:border-neutral-900 focus:outline-none"
                              title="Add Sub Item"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          )}

                          {/* Floating ACTION Buttons */}
                          {(selectedNode?.id === node.id && selectedNode?.type === 'main') && (
                            <div className="absolute -left-3 -top-12 flex items-center gap-2">
                               <button 
                                onPointerDown={(e) => { e.stopPropagation(); setIsLinking(isLinking === node.id ? null : node.id); }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all border-2 border-white dark:border-neutral-900 ${isLinking === node.id ? 'bg-primary text-white scale-110 shadow-primary/30' : 'bg-white/80 dark:bg-neutral-800 text-neutral-400'}`}
                                title="Link to another node"
                              >
                                <Link2 className="h-5 w-5" />
                              </button>
                               <button 
                                onPointerDown={(e) => { e.stopPropagation(); handleToggleFavorite(node.id); }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all border-2 border-white dark:border-neutral-900 ${node.isFavorite ? 'bg-yellow-400 text-white' : 'bg-white/80 dark:bg-neutral-800 text-neutral-400'}`}
                                title={node.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                              >
                                <Star className="h-5 w-5 fill-current" />
                              </button>
                              <button 
                                onPointerDown={(e) => { e.stopPropagation(); handleToggleArchive(node.id); }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all border-2 border-white dark:border-neutral-900 ${node.isArchived ? 'bg-primary text-white' : 'bg-white/80 dark:bg-neutral-800 text-neutral-400'}`}
                                title={node.isArchived ? "Restore from Vault" : "Send to Vault"}
                              >
                                <Archive className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sub Nodes visually attached relative to this node */}
                        {node.children && node.children.map(child => {
                          const isEditingChild = editingNode?.id === child.id && editingNode.type === 'child';
                          const isSelectedChild = selectedNode?.id === child.id && selectedNode.type === 'child';

                          return (
                            <div
                              key={child.id}
                              className={`absolute px-4 py-2 rounded-full border bg-neutral-100/90 dark:bg-neutral-800/90 text-sm font-semibold text-neutral-700 dark:text-zinc-300 backdrop-blur-md shadow-md hover:text-primary dark:hover:text-primary transition-all cursor-move z-0
                                ${(selectedNode?.id === child.id && selectedNode?.type === 'child')
                                  ? 'border-primary ring-2 ring-primary/50 scale-110 shadow-[0_0_15px_var(--tw-shadow-color)] shadow-primary/30 text-primary'
                                  : 'border-neutral-200 dark:border-neutral-700/50 hover:border-primary'
                                }`}
                              style={{
                                top: '50%', left: '50%',
                                transform: `translate(calc(-50% + ${child.dx}px), calc(-50% + ${child.dy}px))`
                              }}
                              onPointerDown={(e) => handleNodePointerDown(e, child.id, 'child', node.id)}
                              onPointerMove={handleNodePointerMove}
                              onPointerUp={handleNodePointerUp}
                              onDoubleClick={(e) => { e.stopPropagation(); setEditingNode({ id: child.id, type: 'child', parentId: node.id }); }}
                            >
                              {isEditingChild ? (
                                <input
                                  autoFocus
                                  defaultValue={child.title}
                                  onBlur={(e) => handleSaveTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.currentTarget.blur();
                                    e.stopPropagation();
                                  }}
                                  className="bg-transparent border-b border-primary outline-none focus:ring-0 w-20 text-center text-current text-xs"
                                />
                              ) : (
                                <span className="select-none" title="Double click to edit">{child.title}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "Nodes" && (
          <div className="flex-1 overflow-y-auto p-12 pt-24 bg-neutral-50/50 dark:bg-black/20">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Brain className="text-primary" /> Node Index
              </h3>
              <div className="grid gap-4">
                {nodes.map(node => (
                  <div key={node.id} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between group hover:border-primary transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{node.title}</h4>
                        <p className="text-sm text-neutral-500">{node.children?.length || 0} items linked</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveTab("Atlas"); setPan({ x: -node.x, y: -node.y }); setZoom(1.5); }}
                      className="bg-neutral-100 dark:bg-neutral-800 hover:bg-primary hover:text-white px-6 py-2 rounded-xl font-bold transition-all opacity-0 group-hover:opacity-100"
                    >
                      View on Canvas
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Sync" && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Repeat className="h-10 w-10 text-primary animate-spin-slow" />
            </div>
            <h3 className="text-3xl font-black mb-4 italic text-primary">Neural Synchronization</h3>
            <p className="max-w-md text-neutral-500 leading-relaxed mb-8">
              Keep your nodes in harmony across the neuro-network. Local storage is currently being mirrored to the primary core.
            </p>
            <button 
              onClick={handleSync}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
            >
              Force Sync Now
            </button>
          </div>
        )}

        {/* Floating Canvas Controls */}
        <div className="absolute bottom-10 right-10 flex flex-col gap-3 z-30">
          <button 
            onClick={handleZoomIn}
            className="w-12 h-12 rounded-full backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/50 flex items-center justify-center text-neutral-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary hover:border-primary/50 transition-all active:scale-95 shadow-xl"
            title="Zoom In"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button 
            onClick={handleZoomOut}
            className="w-12 h-12 rounded-full backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/50 flex items-center justify-center text-neutral-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary hover:border-primary/50 transition-all active:scale-95 shadow-xl"
            title="Zoom Out"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button 
            onClick={handleNeuralReorganize}
            className="w-12 h-12 rounded-full backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-xl"
            title="Neural Reorganize"
          >
            <Repeat className="h-5 w-5" />
          </button>
          <button 
            onClick={handleExportImage}
            className="w-12 h-12 rounded-full backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-xl"
            title="Export Visual Network"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={handleExportMarkdown}
            className="w-12 h-12 rounded-full backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/50 flex items-center justify-center text-neutral-500 hover:text-green-500 transition-all active:scale-95 shadow-xl"
            title="Export Markdown"
          >
            <Archive className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom Dock / Nav */}
        <nav className="absolute bottom-0 left-0 w-full z-20 flex justify-center pb-8 pointer-events-none">
          <div className="pointer-events-auto rounded-full flex gap-4 sm:gap-8 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800/80 shadow-[0_0_40px_var(--tw-shadow-color)] shadow-primary/10 px-8 py-3">
             <button 
               onClick={() => setActiveTab("Atlas")}
               className={`flex flex-col items-center justify-center p-3 px-5 transition-all active:scale-90 duration-200 border rounded-2xl ${activeTab === "Atlas" ? 'bg-primary/10 text-primary border-primary/20' : 'text-neutral-500 dark:text-zinc-500 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900/50'}`}
             >
              <Activity className="h-5 w-5" />
              <span className="font-bold text-[10px] uppercase tracking-widest mt-1">Canvas</span>
            </button>
            <button 
              onClick={handleRecenter}
              className="flex flex-col items-center justify-center text-neutral-500 dark:text-zinc-500 p-3 px-5 hover:text-primary dark:hover:text-primary/80 transition-all active:scale-90 duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 rounded-2xl"
            >
              <Focus className="h-5 w-5" />
              <span className="font-bold text-[10px] uppercase tracking-widest mt-1">Focus</span>
            </button>
            <button 
              onClick={handleFocusSearch}
              className="flex flex-col items-center justify-center text-neutral-500 dark:text-zinc-500 p-3 px-5 hover:text-primary dark:hover:text-primary/80 transition-all active:scale-90 duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 rounded-2xl"
            >
              <Search className="h-5 w-5" />
              <span className="font-bold text-[10px] uppercase tracking-widest mt-1">Search</span>
            </button>
            <button 
              onClick={() => { setShowGrid(!showGrid); setShowConnections(!showConnections); }}
              className={`flex flex-col items-center justify-center p-3 px-5 transition-all active:scale-90 duration-200 rounded-2xl ${showGrid ? 'text-primary' : 'text-neutral-500 dark:text-zinc-500 hover:bg-neutral-100 dark:hover:bg-neutral-900/50'}`}
            >
              <Layers className="h-5 w-5" />
              <span className="font-bold text-[10px] uppercase tracking-widest mt-1">Layers</span>
            </button>
          </div>
        </nav>

      </div>
    </div>
  );
}
