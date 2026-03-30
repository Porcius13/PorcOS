"use client";

import { useEffect, useState, useRef } from "react";
import { CheckSquare, Clock, Plus, X as CloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    color: string;
    completed: boolean;
};

const getTodayYMD = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
};

export function DailyTasksWidget() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [todayCompleted, setTodayCompleted] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const loadTasks = () => {
        const stored = localStorage.getItem("planner-tasks");
        if (stored) {
            try {
                const parsed: Task[] = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    const today = getTodayYMD();
                    const todayTasks = parsed.filter((t) => t.date === today);
                    // Sort tasks by time roughly based on parsing AM/PM, but string sort usually fails for 12hr time.
                    // For simplicity, we just use the order they were added or keep them as is.
                    setTasks(todayTasks);
                    setTodayCompleted(todayTasks.filter((t) => t.completed).length);
                }
            } catch (e) {
                console.error("Failed to parse tasks for widget", e);
            }
        }
    };

    useEffect(() => {
        loadTasks();

        const handleUpdate = () => loadTasks();
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "planner-tasks") loadTasks();
        };

        window.addEventListener("planner-tasks-updated", handleUpdate);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("planner-tasks-updated", handleUpdate);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    useEffect(() => {
        if (isAdding) inputRef.current?.focus();
    }, [isAdding]);

    const addNewTask = () => {
        if (!newTaskTitle.trim()) return;

        const now = new Date();
        const startH = now.getHours();
        const startM = "00";
        const ampm = startH >= 12 ? "PM" : "AM";
        const h12 = startH % 12 || 12;
        const startTime = `${h12}:${startM} ${ampm}`;
        
        const h12_end = (startH + 1) % 12 || 12;
        const ampm_end = (startH + 1) >= 12 ? "PM" : "AM";
        const endTime = `${h12_end}:${startM} ${ampm_end}`;

        const newTask: Task = {
            id: crypto.randomUUID(),
            title: newTaskTitle.trim(),
            date: getTodayYMD(),
            startTime,
            endTime,
            duration: "1h 00m",
            color: "bg-emerald-500", // Default Active Color for Quick Add
            completed: false,
        };

        const stored = localStorage.getItem("planner-tasks");
        const allTasks = stored ? JSON.parse(stored) : [];
        const updated = [...allTasks, newTask];
        
        localStorage.setItem("planner-tasks", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("planner-tasks-updated"));
        
        setNewTaskTitle("");
        setIsAdding(false);
        loadTasks();
    };

    const toggleTask = (taskId: string) => {
        const stored = localStorage.getItem("planner-tasks");
        if (stored) {
            try {
                const allTasks: Task[] = JSON.parse(stored);
                const updatedTasks = allTasks.map(t => 
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                );
                
                localStorage.setItem("planner-tasks", JSON.stringify(updatedTasks));
                
                // Dispatch event for other components to sync
                window.dispatchEvent(new CustomEvent("planner-tasks-updated"));
                
                // Local update
                loadTasks();
            } catch (e) {
                console.error("Failed to toggle task completion", e);
            }
        }
    };

    const progress = tasks.length > 0 ? Math.round((todayCompleted / tasks.length) * 100) : 0;

    return (
        <div className="flex flex-col rounded-[2rem] bg-neutral-900/60 p-6 shadow-xl backdrop-blur-xl border border-neutral-800/50 text-white overflow-hidden w-full max-w-sm h-full max-h-[400px]">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-emerald-500" />
                        Bugünün Görevleri
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                        {todayCompleted} / {tasks.length} Tamamlandı
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            isAdding ? "bg-red-500/10 text-red-500 rotate-45" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                        )}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Quick Add Input */}
            {isAdding && (
                <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                        <input 
                            ref={inputRef}
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addNewTask()}
                            placeholder="Yeni görev adı..."
                            className="w-full bg-neutral-800/50 border border-emerald-500/30 rounded-2xl px-5 py-3 text-sm font-bold text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                        />
                        <button 
                            onClick={addNewTask}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 font-bold text-[10px] uppercase tracking-widest"
                        >
                            EKLE
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {tasks.length > 0 && (
                <div className="w-full h-1.5 rounded-full bg-neutral-800 mb-6 overflow-hidden mt-4">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-700 rounded-full shadow-[0_0_10px_#10b981]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                {tasks.length === 0 && !isAdding ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 mt-8 opacity-40">
                        <CheckSquare className="w-8 h-8 mb-2" />
                        <p className="text-sm font-bold uppercase tracking-widest">Görev Yok</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div 
                            key={task.id} 
                            onClick={() => toggleTask(task.id)}
                            className={cn(
                                "group flex items-center gap-3 p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden",
                                task.completed 
                                    ? "bg-neutral-800/20 border-neutral-800/40 opacity-40 grayscale" 
                                    : "bg-neutral-800/40 border-neutral-700/30 hover:bg-neutral-800/60 hover:border-emerald-500/30"
                            )}
                        >
                            {/* Color Bar */}
                            <div className={cn("w-1.5 h-10 rounded-full shrink-0", task.color)} />
                            
                            <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                    "font-bold text-sm tracking-tight transition-all", 
                                    task.completed ? "line-through text-neutral-500" : "text-neutral-100"
                                )}>
                                    {task.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.startTime} - {task.endTime}</span>
                                </div>
                            </div>

                            {/* Custom Checkbox UI */}
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                task.completed 
                                    ? "bg-emerald-500 border-emerald-500 text-neutral-900" 
                                    : "border-neutral-700 group-hover:border-emerald-500/50"
                            )}>
                                {task.completed && <CheckSquare className="w-3.5 h-3.5 fill-current" />}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
