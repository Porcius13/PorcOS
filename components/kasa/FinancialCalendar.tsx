import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Transaction } from './types';
import { cn } from './lib/utils';

import { t, Lang } from './services/i18nService';
import { tr, enUS } from 'date-fns/locale';

interface FinancialCalendarProps {
    transactions: Transaction[];
    lang: Lang;
}

export default function FinancialCalendar({ transactions, lang }: FinancialCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const dayTransactions = transactions.filter(t =>
        selectedDay && isSameDay(new Date(t.date), selectedDay)
    );

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const getDayTotal = (day: Date) => {
        return transactions
            .filter(t => isSameDay(new Date(t.date), day) && t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">{format(currentDate, 'MMMM yyyy', { locale: lang === 'tr' ? tr : enUS })}</h2>
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('spendingCalendarSubtitle', lang)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <ChevronLeft size={20} className="text-slate-400" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <ChevronRight size={20} className="text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="premium-card p-6 rounded-[2.5rem] bg-card shadow-xl overflow-hidden">
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {[t('mon', lang), t('tue', lang), t('wed', lang), t('thu', lang), t('fri', lang), t('sat', lang), t('sun', lang)].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, i) => {
                        const total = getDayTotal(day);
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.01 }}
                                onClick={() => setSelectedDay(day)}
                                className={cn(
                                    "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group cursor-pointer",
                                    isToday(day) ? "ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900" : "",
                                    isSameDay(day, selectedDay || new Date(0)) ? "bg-primary text-black" :
                                        total > 0 ? "bg-primary/10 dark:bg-primary/5" : "bg-foreground/5"
                                )}
                            >
                                <span className={cn(
                                    "text-xs font-black",
                                    isSameDay(day, selectedDay || new Date(0)) ? "text-white" :
                                        total > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {total > 0 && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg whitespace-nowrap z-10">
                                        {total} ₺
                                    </div>
                                )}
                                <div className={cn(
                                    "w-1 h-1 rounded-full mt-1 transition-all",
                                    total > 2000 ? "bg-rose-500 scale-150 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : total > 500 ? "bg-amber-500" : total > 0 ? "bg-indigo-500" : "transparent"
                                )} />
                            </motion.div>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {selectedDay && dayTransactions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                    {format(selectedDay, 'd MMMM', { locale: lang === 'tr' ? tr : enUS })} {t('detailsFor', lang)}
                                </h4>
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="text-[10px] font-black uppercase text-slate-400"
                                >
                                    {t('close', lang)}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {dayTransactions.map(t => (
                                    <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.category_color }} />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{t.description}</p>
                                                <p className="text-[9px] font-black uppercase text-slate-400">{t.category_name}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-black",
                                            t.type === 'income' ? "text-emerald-500" : "text-foreground"
                                        )}>
                                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} ₺
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
