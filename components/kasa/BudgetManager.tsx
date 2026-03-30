import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    TrendingUp,
    TrendingDown,
    LayoutGrid,
    Plane,
    Utensils,
    Building2,
    Calendar,
    Upload
} from 'lucide-react';
import { Budget, Category, Transaction, Summary } from './types';
import { t, Lang } from './services/i18nService';
import { cn } from './lib/utils';
import { generateFinancialReport } from './services/pdfService';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

interface BudgetManagerProps {
    budgets: Budget[];
    categories: Category[];
    transactions: Transaction[];
    summary: Summary;
    onAddBudget: (budgetData: any) => void;
    onTabChange?: (tab: any) => void;
    lang: Lang;
}

export default function BudgetManager({ budgets, categories, transactions, summary, onAddBudget, onTabChange, lang }: BudgetManagerProps) {
    const historicalData = [
        { month: 'MAY', value: 20, intensity: 0.3 },
        { month: 'JUN', value: 30, intensity: 0.4 },
        { month: 'JUL', value: 25, intensity: 0.3 },
        { month: 'AUG', value: 25, intensity: 0.3 },
        { month: 'SEP', value: 35, intensity: 0.4 },
        { month: 'OCT', value: 50, intensity: 1 },
        { month: 'NOV', value: 30, intensity: 0.2, dashed: true },
    ];

    const operatingExpenses = [
        { id: 'EXP-001', name: t('fixedAssetsRent', lang), spent: 4500, limit: 5000, color: '#ffd21f' },
        { id: 'EXP-002', name: t('cateringDining', lang), spent: 840, limit: 1200, color: '#ffd21f' },
        { id: 'EXP-003', name: t('leisureTravel', lang), spent: 2150, limit: 2000, color: '#f43f5e' }
    ];

    const totalSpent = operatingExpenses.reduce((acc, exp) => acc + exp.spent, 0);

    const recentLedger = transactions.slice(0, 4).map(t => ({
        id: t.id,
        desc: t.description,
        cat: t.category_name || 'Utilities',
        amount: t.amount,
        date: '14 Oct'
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
        >
            <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mb-2">{t('executiveOverview', lang)}</p>
                    <h2 className="text-4xl font-black tracking-tight text-foreground leading-none">{t('monthlyLedger', lang)}</h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-1">{t('totalRemaining', lang)}</p>
                    <p className="text-3xl font-black text-primary">₺{(42500 - totalSpent).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Operating Expenses Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card-premium relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">{t('operatingExpenses', lang)}</h3>
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mt-1">{t('fiscalPeriod', lang)}: OCTOBER 2023</p>
                            </div>
                            <span className="px-4 py-1.5 rounded-full border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5">
                                {t('healthyStatus', lang)}
                            </span>
                        </div>

                        <div className="space-y-10">
                            {operatingExpenses.map(exp => (
                                <div key={exp.id} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="text-lg font-bold text-foreground leading-tight">{exp.name}</h4>
                                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mt-1">{t('id', lang)}: {exp.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-foreground">
                                                ₺{exp.spent.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} <span className="text-foreground/20">/ ₺{exp.limit.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((exp.spent / exp.limit) * 100, 100)}%` }}
                                            className="absolute h-full rounded-full"
                                            style={{ backgroundColor: exp.color }}
                                        />
                                    </div>
                                    {exp.spent > exp.limit && (
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                            ⚠️ {t('overBudgetBy', lang)} ₺{(exp.spent - exp.limit).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                                        </p>
                                    )}
                                    {exp.spent / exp.limit > 0.9 && exp.spent <= exp.limit && (
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-60">
                                            {t('criticalUtilized', lang)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="obsidian-card !p-8 border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer group">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">{t('burnRate', lang)}</p>
                            <div className="flex items-end gap-2 text-white">
                                <h4 className="text-3xl font-black">₺245</h4>
                                <span className="text-[10px] font-black text-white/40 uppercase mb-2">{t('perDay', lang)}</span>
                            </div>
                            <p className="text-[10px] font-black text-primary uppercase mt-4 opacity-60">{t('burnRateDescription', lang)}</p>
                        </div>
                        <div className="glass-card-premium !p-8 bg-foreground/5 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all group">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">{t('savingsProjection', lang)}</p>
                            <h4 className="text-3xl font-black text-white">₺8,200</h4>
                            <p className="text-[10px] font-black text-emerald-500 uppercase mt-4 opacity-60">{t('savingsProjectionDescription', lang)}</p>
                        </div>
                    </div>

                    {/* Historical Comparison */}
                    <div className="glass-card-premium">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-12">{t('historicalComparison', lang)}</p>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historicalData}>
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'currentColor', opacity: 0.2, fontSize: 10, fontWeight: 900 }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(18, 18, 18, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        cursor={{ fill: 'currentColor', opacity: 0.05 }}
                                    />
                                    <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={24}>
                                        {historicalData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.intensity === 1 ? '#ffd21f' : 'currentColor'}
                                                stroke={entry.intensity === 1 ? 'none' : 'currentColor'}
                                                opacity={entry.intensity === 1 ? 1 : 0.08}
                                                strokeDasharray={entry.dashed ? "4 4" : "0"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    <div className="obsidian-card !p-8 min-h-[500px]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em]">{t('recentLedger', lang)}</h3>
                            <LayoutGrid size={16} className="text-foreground/20" />
                        </div>
                        <div className="space-y-6">
                            {recentLedger.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40">
                                            {item.cat === 'Travel' ? <Plane size={18} /> : <Utensils size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground">{item.desc}</h4>
                                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{item.cat}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-foreground">-₺{item.amount.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p>
                                        <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-4 mt-12">
                            <button 
                                onClick={() => onTabChange?.('import')}
                                className="w-full py-5 bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-[2rem] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                            >
                                <Upload size={16} />
                                {t('uploadStatement', lang)}
                            </button>
                            <button 
                                onClick={() => generateFinancialReport(transactions, summary, 72, lang)}
                                className="w-full py-5 bg-white/5 text-white/40 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-white/10 hover:text-white transition-all"
                            >
                                {t('generateReport', lang)}
                            </button>
                        </div>
                    </div>

                    <div className="obsidian-card !p-8 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent opacity-60" />
                         <div className="relative z-10 space-y-2 mt-20">
                             <h3 className="text-xl font-black text-foreground tracking-tight">{t('automatedRules', lang)}</h3>
                             <p className="text-[10px] text-foreground/40 leading-relaxed uppercase tracking-tighter">{t('optimizingExpenditures', lang)}</p>
                         </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
