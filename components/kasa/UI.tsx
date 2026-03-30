import * as React from 'react';
import { cn } from './lib/utils';
import { motion } from 'framer-motion';

export function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center gap-1 transition-all relative p-2 text-foreground/40 hover:text-foreground/80",
                active && "text-primary dark:text-primary"
            )}
        >
            <motion.div
                animate={{ scale: active ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {icon}
            </motion.div>
            {label && <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>}
        </button>
    );
}

export function SummaryCard({ title, amount, icon, color = "indigo", lang = 'tr' }: { title: string, amount: number, icon: React.ReactNode, color?: string, lang?: string }) {
    const accents = {
        indigo: "var(--accent-indigo)",
        emerald: "var(--accent-emerald)",
        rose: "var(--accent-rose)",
        amber: "var(--accent-gold)"
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass p-6"
        >
            <div className="flex justify-between items-start mb-6">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10"
                    style={{ background: `linear-gradient(135deg, ${accents[color as keyof typeof accents] || color}, transparent)` }}
                >
                    {React.cloneElement(icon as React.ReactElement<any>, { className: "text-foreground group-hover:text-primary transition-colors" })}
                </div>
            </div>
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tighter">
                {(amount || 0).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} <span className="text-sm font-medium opacity-30">₺</span>
            </p>
        </motion.div>
    );
}

export function MenuButton({ icon, label, onClick, color }: { icon: React.ReactElement, label: string, onClick: () => void, color: string }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-3 p-6 rounded-[2.5rem] glass hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-none transition-all", color)}>
                {React.cloneElement(icon, { size: 28 } as any)}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 group-hover:text-foreground transition-colors text-center">
                {label}
            </span>
        </button>
    );
}
