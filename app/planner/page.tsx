"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
    ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, Check, Trash2,
    Inbox, LayoutGrid, Settings, MoreVertical, MapPin, Tag, Bell, Search,
    Coffee, Book, Laptop, Bike, Dumbbell, Utensils, Music, Heart, Camera, Briefcase, Moon, Sun,
    RefreshCcw, Paperclip, ListTodo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
                    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    }, [tasks, selectedDate]);

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
        if (!newTitle.trim()) return;
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
            notes: notes
        };
        setTasks([...tasks, newTask]);
        setIsDrawerOpen(false);
        resetForm();
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
        setEditingTask(null);
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#ffd21f]/30 relative overflow-x-hidden transition-colors duration-300">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border py-4 px-8 flex items-center justify-between">
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
                        <h1 className="text-xl font-bold tracking-tight">
                            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long' })} <span className="text-[#ffd21f]">{new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric' })}</span>
                        </h1>
                        <div className="flex bg-accent/30 p-1 rounded-xl">
                            <button className="p-1 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /></button>
                            <button className="p-1 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></button>
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

            <nav className="sticky top-[73px] z-20 bg-background border-b border-border py-4 px-12 overflow-x-auto no-scrollbar">
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

            <main className="max-w-5xl mx-auto px-8 py-16 flex relative gap-6">
                {/* Inbox Sliding Menu */}
                <AnimatePresence>
                    {isInboxOpen && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0, marginRight: 0 }}
                            animate={{ width: 260, opacity: 1, marginRight: 24 }}
                            exit={{ width: 0, opacity: 0, marginRight: 0 }}
                            className="shrink-0 overflow-hidden"
                        >
                            <div className="w-[260px] space-y-6">
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
                                            <div key={task.id} className="p-3 bg-white dark:bg-card border border-border/40 rounded-2xl flex items-center gap-3 group hover:border-[#ffd21f]/60 transition-all cursor-pointer shadow-sm relative">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#ffd21f]/10 text-[#ffd21f]">
                                                    {ICONS.find(i => i.id === task.icon)?.icon && React.createElement(ICONS.find(i => i.id === task.icon)!.icon, { className: "w-4 h-4" })}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{task.duration}m</p>
                                                    <p className="text-xs font-bold text-foreground truncate">{task.title}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, inbox: false } : t))}
                                                    className="w-7 h-7 bg-[#ffd21f]/10 text-[#ffd21f] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ffd21f] hover:text-black"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
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
                <section className="flex-1 min-w-[500px]">
                    <div className="relative space-y-0 pb-32">
                        {/* The Axis Line */}
                        <div className="absolute left-[88px] top-4 bottom-0 w-[2px] bg-border z-0" />

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
                                        <div className="relative flex items-center gap-8 py-6 group">
                                            {/* Time Column (Left) */}
                                            <div className="w-16 text-right pt-1 tabular-nums">
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
                                                    {task.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.notes}</p>}
                                                </div>
                                                
                                                {/* Completion Ring (Far Right) */}
                                                <div 
                                                    onClick={() => toggleTask(task.id)}
                                                    className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center cursor-pointer hover:border-[#ffd21f]/50 transition-all relative group/ring"
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

                                        {/* Interval Placeholder */}
                                        {nextTask && (
                                            <div className="relative flex items-center gap-8 py-2 ml-[88px]">
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
                className="fixed bottom-12 right-12 w-16 h-16 bg-[#ffd21f] text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,210,31,0.4)] hover:shadow-[0_0_40px_rgba(255,210,31,0.6)] hover:scale-110 active:scale-95 transition-all z-40"
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
                            className="fixed top-0 right-0 h-full w-[450px] bg-background dark:bg-[#0c0c0e] shadow-2xl z-[60] flex flex-col border-l border-border"
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
                                <div className="bg-white dark:bg-[#1c1c1e] rounded-[1.8rem] px-5 py-4 border border-border/40 flex items-center justify-between group cursor-pointer hover:bg-neutral-50 dark:hover:bg-accent transition-all shadow-sm max-w-[max-content]">
                                    <div className="flex items-center gap-4">
                                        <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-bold opacity-60">Repeat</span>
                                        <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-white/5 rounded text-[7px] font-black tracking-widest opacity-40 uppercase border border-border/20">★ PRO</span>
                                    </div>
                                </div>

                                {/* Notes & Subtasks */}
                                <div className="bg-white dark:bg-[#1c1c1e] rounded-[1.8rem] border border-border/40 overflow-hidden shadow-sm">
                                    <div className="p-5 flex items-center gap-4 border-b border-border/40 group cursor-pointer hover:bg-neutral-50 dark:hover:bg-accent transition-all">
                                        <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded" />
                                        <span className="text-sm font-bold text-muted-foreground opacity-60">Add Subtask</span>
                                    </div>
                                    <div className="p-5 flex items-center gap-4">
                                        <div className="p-2 shrink-0">
                                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <textarea 
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Add notes, meeting links or phone numbers..."
                                            className="w-full bg-transparent p-0 text-sm font-medium opacity-60 placeholder:opacity-20 outline-none resize-none min-h-[100px]"
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

                            <div className="p-8 bg-[#f5f5f7] dark:bg-background border-t border-border/20 flex justify-end">
                                <button 
                                    onClick={handleAddTask}
                                    className="px-8 py-3 bg-[#e0e3e5] dark:bg-card text-muted-foreground/60 rounded-full font-bold text-xs tracking-wide transition-all shadow-inner border border-border/10"
                                >
                                    Create Task
                                </button>
                            </div>
                        </motion.div>
                    </>
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

