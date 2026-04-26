"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
    ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, Check, Trash2,
    Inbox, LayoutGrid, Settings, MoreVertical, MapPin, Tag, Bell, Search,
    Coffee, Book, Laptop, Bike, Dumbbell, Utensils, Music, Heart, Camera, Briefcase, Moon, Sun,
    RefreshCcw, Paperclip, ListTodo, Edit3, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Subtask = { id: string; text: string; completed: boolean };

type Task2 = {
    id: string;
    title: string;
    date: string; // "YYYY-MM-DD"
    startTime?: string; // "10:30" (24h)
    duration: number; // in minutes
    icon: string;
    color: string;
    completed: boolean;
    inbox: boolean;
    notes?: string;
    isAllDay?: boolean;
    subtasks?: Subtask[];
};

const ICONS = [
    { id: "coffee", icon: Coffee, color: "#ff9f43" },
    { id: "book", icon: Book, color: "#ee5253" },
    { id: "laptop", icon: Laptop, color: "#54a0ff" },
    { id: "bike", icon: Bike, color: "#10ac84" },
    { id: "dumbbell", icon: Dumbbell, color: "#5f27cd" },
    { id: "utensils", icon: Utensils, color: "#ff9f43" },
    { id: "music", icon: Music, color: "#ff6b6b" },
    { id: "heart", icon: Heart, color: "#ff6b6b" },
    { id: "camera", icon: Camera, color: "#48dbfb" },
    { id: "briefcase", icon: Briefcase, color: "#feca57" },
    { id: "moon", icon: Moon, color: "#54a0ff" },
    { id: "sun", icon: Sun, color: "#ff9f43" },
];

const COLORS = [
    "#ff9f43", "#ee5253", "#54a0ff", "#10ac84", "#5f27cd", "#ff6b6b", "#48dbfb", "#feca57"
];

const getTodayYMD = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export default function PlannerPage() {
    const [tasks, setTasks] = useState<Task2[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(getTodayYMD());
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isInboxOpen, setIsInboxOpen] = useState(false);
    
    // Form state
    const [editingTask, setEditingTask] = useState<Task2 | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newStartTime, setNewStartTime] = useState("10:00");
    const [newDuration, setNewDuration] = useState(60);
    const [newIcon, setNewIcon] = useState("laptop");
    const [newColor, setNewColor] = useState(COLORS[2]);
    const [isInbox, setIsInbox] = useState(false);
    const [isAllDay, setIsAllDay] = useState(false);
    const [notes, setNotes] = useState("");
    const [newSubtasks, setNewSubtasks] = useState<Subtask[]>([]);

    // UI Enhancements State
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [actionToast, setActionToast] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Task2 | null>(null);
    const [undoToast, setUndoToast] = useState<{ task: Task2 } | null>(null);
    const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const showActionToast = (msg: string) => {
        setActionToast(msg);
        setTimeout(() => setActionToast(null), 3500);
    };

    // Keyboard ESC Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsDrawerOpen(false);
                setDeleteConfirm(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Date Navigation Logic
    const handlePrevDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    };

    const handleNextDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    };

    // Load tasks
    useEffect(() => {
        const stored = localStorage.getItem("planner2-tasks");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setTasks(parsed);
            } catch (e) {
                console.error("Failed to load planner2 tasks", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save tasks
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("planner2-tasks", JSON.stringify(tasks));
        }
    }, [tasks, isLoaded]);

    const dailyTasks = useMemo(() => {
        return tasks.filter(t => t.date === selectedDate && !t.inbox)
                    .sort((a, b) => {
                        if (a.isAllDay && !b.isAllDay) return -1;
                        if (!a.isAllDay && b.isAllDay) return 1;
                        return (a.startTime || "").localeCompare(b.startTime || "");
                    });
    }, [tasks, selectedDate]);

    const dailyProgress = useMemo(() => {
        if (dailyTasks.length === 0) return 0;
        const completed = dailyTasks.filter(t => t.completed).length;
        return Math.round((completed / dailyTasks.length) * 100);
    }, [dailyTasks]);

    const inboxTasks = useMemo(() => {
        return tasks.filter(t => t.inbox);
    }, [tasks]);

    const weekDays = useMemo(() => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay()); // Sunday
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            days.push({
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                day: d.getDate(),
                ymd: ymd,
                active: ymd === selectedDate
            });
        }
        return days;
    }, [selectedDate]);

    const handleAddTask = () => {
        if (!newTitle.trim()) {
            showToast("Görev başlığı boş bırakılamaz.");
            return;
        }
        
        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? {
                ...t,
                title: newTitle,
                date: selectedDate,
                startTime: isInbox || isAllDay ? undefined : newStartTime,
                duration: newDuration,
                icon: newIcon,
                color: newColor,
                inbox: isInbox,
                isAllDay: isAllDay,
                notes: notes,
                subtasks: newSubtasks
            } : t));
            showToast("Görev başarıyla güncellendi.");
        } else {
            const newTask: Task2 = {
                id: Date.now().toString(),
                title: newTitle,
                date: selectedDate,
                startTime: isInbox || isAllDay ? undefined : newStartTime,
                duration: newDuration,
                icon: newIcon,
                color: newColor,
                completed: false,
                inbox: isInbox,
                isAllDay: isAllDay,
                notes: notes,
                subtasks: newSubtasks
            };
            setTasks([...tasks, newTask]);
            showToast("Yeni görev eklendi.");
        }
        setIsDrawerOpen(false);
        resetForm();
    };

    const openEditDrawer = (task: Task2) => {
        setEditingTask(task);
        setNewTitle(task.title);
        setNewStartTime(task.startTime || "10:00");
        setNewDuration(task.duration);
        setNewIcon(task.icon);
        setNewColor(task.color);
        setIsInbox(task.inbox);
        setIsAllDay(!!task.isAllDay);
        setNotes(task.notes || "");
        setNewSubtasks(task.subtasks || []);
        
        if (!task.inbox) {
            setSelectedDate(task.date);
        }
        
        setIsDrawerOpen(true);
    };

    const resetForm = () => {
        setNewTitle("");
        setNewStartTime("10:00");
        setNewDuration(60);
        setNewIcon("laptop");
        setNewColor(COLORS[2]);
        setIsInbox(false);
        setIsAllDay(false);
        setNotes("");
        setNewSubtasks([]);
        setEditingTask(null);
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const confirmAndDeleteTask = (task: Task2) => {
        setTasks(prev => prev.filter(t => t.id !== task.id));
        setDeleteConfirm(null);
        if (editingTask?.id === task.id) {
            setIsDrawerOpen(false);
            resetForm();
        }
        
        // Trigger Undo
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        setUndoToast({ task });
        undoTimeoutRef.current = setTimeout(() => {
            setUndoToast(null);
        }, 4000);
    };

    const handleUndo = () => {
        if (undoToast) {
            setTasks(prev => [...prev, undoToast.task]);
            if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
            setUndoToast(null);
            showToast("Görev başarıyla geri yüklendi.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#ffd21f]/30 relative overflow-x-hidden transition-colors duration-300">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border py-4 px-4 md:px-8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setIsInboxOpen(!isInboxOpen)}
                        className={cn(
                            "flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all border shadow-sm",
                            isInboxOpen ? "bg-[#ffd21f] border-[#ffd21f] text-black" : "bg-white dark:bg-card border-border hover:bg-accent text-foreground"
                        )}
                    >
                        <Inbox className="w-4 h-4" />
                        <span>Inbox</span>
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold tracking-tight">
                                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long' })} <span className="text-[#ffd21f]">{new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric' })}</span>
                            </h1>
                            {dailyTasks.length > 0 && (
                                <div className="px-3 py-1 bg-accent/30 rounded-full flex items-center gap-2 border border-border/40 shadow-sm" title={`${dailyProgress}% Completed Today`}>
                                    <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center overflow-hidden relative rotate-180">
                                        <motion.div 
                                            className="absolute top-0 left-0 right-0 bg-[#ffd21f]" 
                                            initial={{ height: 0 }} 
                                            animate={{ height: `${dailyProgress}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] font-black">{dailyProgress}%</span>
                                </div>
                            )}
                        </div>

                        <div className="flex bg-accent/30 p-1 rounded-xl">
                            <button onClick={handlePrevDay} className="p-1 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={handleNextDay} className="p-1 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-accent/30 p-1 rounded-2xl">
                    {["Day", "Multi-Day", "Week", "Month"].map(tab => (
                        <button 
                            key={tab}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                                tab === "Day" ? "bg-[#ffd21f] text-black shadow-lg" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <button className="p-3 bg-accent/30 rounded-2xl hover:bg-accent/50 transition-all text-muted-foreground hover:text-foreground">
                    <Settings className="w-4 h-4" />
                </button>
            </header>

            <nav className="sticky top-[73px] z-20 bg-background border-b border-border py-4 px-4 md:px-12 overflow-x-auto no-scrollbar">
                <div className="max-w-4xl mx-auto flex justify-between gap-4">
                    {weekDays.map((day, i) => (
                        <button 
                            key={i}
                            onClick={() => setSelectedDate(day.ymd)}
                            className="flex flex-col items-center gap-2 group min-w-[60px]"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{day.label}</span>
                            <span className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                day.active 
                                    ? "bg-[#ffd21f] text-black shadow-[0_0_20px_rgba(255,210,31,0.3)]" 
                                    : "text-muted-foreground group-hover:text-foreground"
                            )}>
                                {day.day}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-16 flex flex-col md:flex-row relative gap-6">
                {/* Inbox Sliding Menu */}
                <AnimatePresence>
                    {isInboxOpen && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0, marginRight: 0 }}
                            animate={{ width: 260, opacity: 1, marginRight: 24 }}
                            exit={{ width: 0, opacity: 0, marginRight: 0 }}
                            className="shrink-0 overflow-hidden"
                        >
                            <div className="w-full md:w-[260px] space-y-6">
                                <div className="space-y-4">
                                    {/* Quick Add Input */}
                                    <div className="relative group">
                                        <input 
                                            placeholder="Add a new inbox task..."
                                            className="w-full h-12 bg-white dark:bg-card border border-border/40 rounded-full pl-6 pr-12 text-sm font-medium placeholder:opacity-40 outline-none focus:border-[#ffd21f] transition-all shadow-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                                                    const val = (e.target as HTMLInputElement).value;
                                                    setTasks([...tasks, {
                                                        id: Date.now().toString(),
                                                        title: val,
                                                        date: selectedDate,
                                                        duration: 15,
                                                        icon: "laptop",
                                                        color: "#ffd21f",
                                                        completed: false,
                                                        inbox: true
                                                    }]);
                                                    (e.target as HTMLInputElement).value = "";
                                                    showToast("Inbox'a görev eklendi.");
                                                }
                                            }}
                                        />
                                        <button className="absolute right-1 top-1 w-10 h-10 bg-[#ffd21f] text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-md">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                {/* Inbox List */}
                                    <div className="space-y-3">
                                        {inboxTasks.map(task => (
                                            <div key={task.id} className="p-3 bg-white dark:bg-card border border-border/40 rounded-2xl flex items-center gap-3 group hover:border-[#ffd21f]/60 transition-all shadow-sm relative pr-20">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#ffd21f]/10 text-[#ffd21f]">
                                                    {ICONS.find(i => i.id === task.icon)?.icon && React.createElement(ICONS.find(i => i.id === task.icon)!.icon, { className: "w-4 h-4" })}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{task.duration}m</p>
                                                    <p className="text-xs font-bold text-foreground truncate">{task.title}</p>
                                                </div>

                                                {/* Hover Actions Overlay */}
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-white/90 dark:bg-card/90 backdrop-blur-sm p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                                    <button 
                                                        onClick={() => openEditDrawer(task)}
                                                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                                        title="Edit Task"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteConfirm(task)}
                                                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-red-500 transition-colors"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setTasks(tasks.map(t => t.id === task.id ? { ...t, inbox: false } : t));
                                                            showToast("Görev bugüne taşındı.");
                                                        }}
                                                        className="w-7 h-7 bg-[#ffd21f]/10 text-[#ffd21f] rounded-full flex items-center justify-center transition-all hover:bg-[#ffd21f] hover:text-black ml-1"
                                                        title="Move to Today"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {inboxTasks.length === 0 && (
                                            <div className="px-4 py-12 text-center opacity-30 italic">
                                                <p className="text-[11px] font-medium">Inbox is empty</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Timeline */}
                <section className="flex-1 min-w-0 md:min-w-[500px]">
                    <div className="relative space-y-0 pb-32">
                        {/* The Axis Line */}
                        <div className="absolute left-[70px] md:left-[88px] top-4 bottom-0 w-[2px] bg-border z-0" />

                        {dailyTasks.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-40">
                                <Clock className="w-16 h-16 mb-6 text-muted-foreground" />
                                <h3 className="text-2xl font-bold italic tracking-tighter text-foreground">Day is clear</h3>
                                <p className="text-sm font-medium">Enjoy your interval or set a new protocol.</p>
                            </div>
                        ) : (
                            dailyTasks.map((task, index) => {
                                const nextTask = dailyTasks[index + 1];
                                
                                return (
                                    <React.Fragment key={task.id}>
                                        <div className="relative flex items-center gap-4 md:gap-8 py-6 group">
                                            {/* Time Column (Left) */}
                                            <div className="w-12 md:w-16 text-right pt-1 tabular-nums">
                                                <p className="text-xs font-black text-muted-foreground uppercase">{task.isAllDay ? "ALL DAY" : task.startTime}</p>
                                            </div>

                                            {/* Axis Icon Node (Center) */}
                                            <div className="relative z-10 shrink-0">
                                                <div 
                                                    className={cn(
                                                        "w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                                                        task.completed && "opacity-40"
                                                    )}
                                                    style={{ backgroundColor: task.color }}
                                                >
                                                    {ICONS.find(i => i.id === task.icon)?.icon && React.createElement(ICONS.find(i => i.id === task.icon)!.icon, { className: "w-5 h-5 text-[#0c0c0e]" })}
                                                </div>
                                            </div>

                                            {/* Task Context (Right) */}
                                            <div className="flex-1 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className={cn("text-lg font-bold tracking-tight", task.completed && "line-through opacity-40")}>{task.title}</h3>
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <div className="flex items-center gap-1 mt-1.5 opacity-60">
                                                            <ListTodo className="w-3 h-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} Subtasks</span>
                                                        </div>
                                                    )}
                                                    {task.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.notes}</p>}
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {/* Hover Actions */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => openEditDrawer(task)}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                                            title="Edit Task"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeleteConfirm(task)}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-red-500 transition-colors"
                                                            title="Delete Task"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Completion Ring (Far Right) */}
                                                    <div 
                                                        onClick={() => toggleTask(task.id)}
                                                        className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center cursor-pointer hover:border-[#ffd21f]/50 transition-all relative group/ring shrink-0"
                                                    >
                                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                                            <motion.circle 
                                                                cx="18" cy="18" r="15" fill="none" stroke={task.color} strokeWidth="2.5" 
                                                                initial={{ pathLength: 0 }}
                                                                animate={{ pathLength: task.completed ? 1 : 0 }}
                                                                transition={{ duration: 0.5 }}
                                                            />
                                                        </svg>
                                                        <div className={cn("w-3 h-3 rounded-full transition-all duration-300", task.completed ? "bg-[#ffd21f] scale-100 shadow-[0_0_10px_#ffd21f]" : "bg-muted-foreground/20 scale-0 group-hover/ring:scale-50")} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interval Placeholder */}
                                        {nextTask && (
                                            <div className="relative flex items-center gap-4 md:gap-8 py-2 ml-[70px] md:ml-[88px]">
                                                <div className="absolute left-[0px] top-0 bottom-0 w-[2px] border-l-2 border-dotted border-border" style={{ marginLeft: "-1px" }} />
                                                <div className="pl-12 py-8 grayscale transition-all opacity-40 italic hover:opacity-80">
                                                    <p className="text-xs font-medium tracking-wide text-muted-foreground">Interval Over. What's next?</p>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </div>
                </section>
            </main>

            {/* FAB */}
            <button 
                onClick={() => {
                    resetForm();
                    setIsDrawerOpen(true);
                }}
                className="fixed bottom-6 right-6 md:bottom-12 md:right-12 w-14 h-14 md:w-16 md:h-16 bg-[#ffd21f] text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,210,31,0.4)] hover:shadow-[0_0_40px_rgba(255,210,31,0.6)] hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Plus className="w-8 h-8 stroke-[3]" />
            </button>

            {/* RIGHT SIDE DRAWER */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background dark:bg-[#0c0c0e] shadow-2xl z-[60] flex flex-col border-l border-border"
                        >
                            {/* Dynamic Header Peak */}
                            <div className="relative h-[240px] shrink-0 p-8 flex flex-col justify-end transition-colors duration-500 overflow-hidden" style={{ backgroundColor: newColor }}>
                                <div className="absolute top-8 right-8 z-20">
                                    <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all text-white border border-white/20">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Timeline Axial Decor */}
                                <div className="absolute left-[88px] top-0 bottom-0 flex flex-col items-center z-0">
                                    <div className="w-[2px] h-full bg-white opacity-40 shadow-[0_0_10px_white]" />
                                    <div className="absolute top-1/2 -translate-y-1/2 w-16 h-36 bg-white/30 rounded-full blur-xl" />
                                    <div className="absolute top-1/2 -translate-y-1/2 w-14 h-24 bg-white border-2 border-white/30 rounded-full flex items-center justify-center shadow-lg">
                                        {ICONS.find(i => i.id === newIcon)?.icon && React.createElement(ICONS.find(i => i.id === newIcon)!.icon, { className: "w-8 h-8", style: { color: newColor } })}
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-1">
                                    <p className="text-white/80 text-xs font-black uppercase tracking-widest tabular-nums">
                                        {isAllDay ? "All Day Event" : `${newStartTime} — ${new Date(new Date(`2000-01-01T${newStartTime}`).getTime() + newDuration * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} (${newDuration}m)`}
                                    </p>
                                    <div className="relative flex items-center justify-between">
                                        <div className="relative flex-1">
                                            <input 
                                                autoFocus
                                                value={newTitle}
                                                onChange={e => setNewTitle(e.target.value)}
                                                placeholder="Structure Your Day"
                                                className="w-full bg-transparent border-none p-0 text-[1.75rem] leading-tight font-bold text-white placeholder:text-white/40 outline-none pb-1"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white opacity-30" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full border-2 border-white/40 ml-4 shrink-0" />
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6 bg-[#f5f5f7] dark:bg-[#0c0c0e]">
                                {/* Date Section */}
                                <div className="bg-white dark:bg-[#1c1c1e] rounded-[1.8rem] p-5 space-y-4 border border-border/40 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-[#ffd21f]/10 rounded-lg">
                                                <CalendarIcon className="w-5 h-5 text-[#ffd21f]" />
                                            </div>
                                            <p className="text-sm font-bold opacity-90">
                                                {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center bg-accent/30 rounded-2xl p-1">
                                            <input 
                                                type="checkbox" 
                                                checked={isAllDay} 
                                                onChange={e => setIsAllDay(e.target.checked)} 
                                                className="w-5 h-5 accent-[#ffd21f] rounded-md"
                                            />
                                            <span className="text-xs font-bold text-muted-foreground ml-2 mr-2">All-Day</span>
                                        </div>
                                    </div>
                                    {!isAllDay && (
                                        <div className="flex items-center gap-4 pt-4 border-t border-border">
                                            <div className="p-2 bg-[#ffd21f]/10 rounded-lg">
                                                <Clock className="w-5 h-5 text-[#ffd21f]" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="time" 
                                                    value={newStartTime}
                                                    onChange={e => setNewStartTime(e.target.value)}
                                                    className="bg-transparent text-sm font-bold outline-none"
                                                />
                                                <span className="opacity-30 font-bold mx-1">→</span>
                                                <select 
                                                    value={newDuration}
                                                    onChange={e => setNewDuration(Number(e.target.value))}
                                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                                                >
                                                    <option value={15}>15 min</option>
                                                    <option value={30}>30 min</option>
                                                    <option value={60}>1 hour</option>
                                                    <option value={120}>2 hours</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Repeat Toggle */}
                                <div onClick={() => showActionToast("Tekrar (Repeat) özelliği yakında eklenecek.")} className="bg-white dark:bg-[#1c1c1e] rounded-[1.8rem] px-5 py-4 border border-border/40 flex items-center justify-between group cursor-pointer hover:bg-neutral-50 dark:hover:bg-accent transition-all shadow-sm max-w-[max-content]">
                                    <div className="flex items-center gap-4">
                                        <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-bold opacity-60">Repeat</span>
                                        <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-white/5 rounded text-[7px] font-black tracking-widest opacity-40 uppercase border border-border/20">★ PRO</span>
                                    </div>
                                </div>

                                {/* Active Subtasks Section */}
                                <div className="bg-white dark:bg-[#1c1c1e] rounded-[1.8rem] border border-border/40 overflow-hidden shadow-sm">
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Alt Görevler</span>
                                            <button 
                                                onClick={() => setNewSubtasks([...newSubtasks, { id: Date.now().toString(), text: "", completed: false }])} 
                                                className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center hover:bg-[#ffd21f] hover:text-black transition-all text-muted-foreground"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {newSubtasks.map((st, i) => (
                                            <div key={st.id} className="flex items-center gap-3 group">
                                                <div 
                                                    onClick={() => setNewSubtasks(newSubtasks.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s))}
                                                    className={cn("w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all shrink-0", st.completed ? "bg-[#ffd21f] text-black" : "border-2 border-border/80 hover:border-[#ffd21f]/50")}
                                                >
                                                    {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <input 
                                                    value={st.text} 
                                                    autoFocus={st.text === ""}
                                                    onChange={e => setNewSubtasks(newSubtasks.map((s, idx) => idx === i ? { ...s, text: e.target.value } : s))}
                                                    placeholder="Alt görev açıklaması..."
                                                    className={cn("flex-1 bg-transparent border-none outline-none text-sm font-medium", st.completed && "line-through opacity-40")}
                                                />
                                                <button 
                                                    onClick={() => setNewSubtasks(newSubtasks.filter((_, idx) => idx !== i))} 
                                                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {newSubtasks.length === 0 && (
                                            <span className="text-xs font-medium text-muted-foreground opacity-60 italic ml-1 py-1">Henüz alt görev oluşturulmadı.</span>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-border/40 flex items-center gap-4 bg-black/5 dark:bg-white/5">
                                        <div className="p-2 shrink-0">
                                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <textarea 
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Notlar, bağlantılar veya telefon numaraları..."
                                            className="w-full bg-transparent p-0 text-sm font-medium opacity-60 placeholder:opacity-40 outline-none resize-none min-h-[60px]"
                                        />
                                    </div>
                                </div>

                                {/* Icons Selection */}
                                <div className="space-y-4 pt-4">
                                    <div className="grid grid-cols-6 gap-3">
                                        {ICONS.map(i => (
                                            <div key={i.id} className="relative">
                                                <button 
                                                    onClick={() => {
                                                        setNewIcon(i.id);
                                                        setNewColor(i.color);
                                                    }}
                                                    className={cn(
                                                        "aspect-square rounded-2xl flex items-center justify-center transition-all border-2",
                                                        newIcon === i.id ? "border-[#ffd21f] bg-[#ffd21f]/10 scale-110" : "border-transparent bg-white dark:bg-card hover:bg-accent shadow-sm"
                                                    )}
                                                    style={{ color: i.color }}
                                                >
                                                    <i.icon className="w-6 h-6 outline-none" />
                                                </button>
                                                {newIcon === i.id && (
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#ffd21f] rounded-full" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-[#f5f5f7] dark:bg-background border-t border-border/20 flex justify-end gap-3">
                                {editingTask && (
                                    <button 
                                        onClick={() => setDeleteConfirm(editingTask)}
                                        className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full font-bold text-xs tracking-wide transition-all border border-red-500/20"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button 
                                    onClick={handleAddTask}
                                    className={cn(
                                        "px-8 py-3 rounded-full font-bold text-xs tracking-wide transition-all",
                                        editingTask 
                                            ? "bg-[#ffd21f] text-black shadow-[0_0_20px_rgba(255,210,31,0.3)]" 
                                            : "bg-[#e0e3e5] dark:bg-card text-muted-foreground rounded-full shadow-inner border border-border/10 hover:bg-[#ffd21f] hover:text-black"
                                    )}
                                >
                                    {editingTask ? "Save Changes" : "Create Task"}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {deleteConfirm && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirm(null)}
                            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20, x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.95, y: 20, x: "-50%" }}
                            className="fixed top-1/2 left-1/2 z-[80] bg-background dark:bg-[#0c0c0e] p-8 rounded-[2rem] shadow-2xl w-[400px] border border-border/40 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Görevi Sil</h3>
                            <p className="text-muted-foreground text-sm mb-8">
                                <strong className="text-foreground">"{deleteConfirm.title}"</strong> görevini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </p>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-3 bg-accent hover:bg-accent/80 rounded-xl font-bold text-sm transition-all"
                                >
                                    İptal
                                </button>
                                <button 
                                    onClick={() => confirmAndDeleteTask(deleteConfirm)}
                                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/30"
                                >
                                    Sil
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* TOAST & UNDO NOTIFICATIONS */}
            <AnimatePresence>
                {/* Standard Success Toast */}
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-10 left-1/2 z-[100] bg-[#1c1c1e] text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3"
                    >
                        <Check className="w-4 h-4 text-[#ffd21f]" />
                        <span className="text-sm font-medium">{toastMessage}</span>
                    </motion.div>
                )}
                
                {/* Action Required Toast */}
                {actionToast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-24 left-1/2 z-[100] bg-blue-500/10 backdrop-blur-xl text-blue-500 px-6 py-3 rounded-full shadow-2xl border border-blue-500/20 flex items-center gap-3"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{actionToast}</span>
                    </motion.div>
                )}

                {/* Undo Toast */}
                {undoToast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-24 left-1/2 z-[100] bg-background dark:bg-[#1c1c1e] text-foreground px-4 py-3 rounded-xl shadow-2xl border border-border/40 flex items-center gap-4 min-w-[300px]"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium flex-1 truncate">"{undoToast.task.title}" silindi.</span>
                        <button 
                            onClick={handleUndo}
                            className="bg-accent hover:bg-accent/80 text-foreground px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all uppercase"
                        >
                            Geri Al
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                input[type="time"]::-webkit-calendar-picker-indicator {
                    filter: var(--tw-brightness, invert(1));
                    opacity: 0.5;
                }
                :root {
                    --tw-brightness: invert(0);
                }
                .dark {
                    --tw-brightness: invert(1);
                }
            `}</style>
        </div>
    );
}
