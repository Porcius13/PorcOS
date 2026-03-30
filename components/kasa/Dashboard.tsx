import * as React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Upload,
    Activity,
    Zap,
    Trophy
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Tooltip
} from 'recharts';
import { Transaction, Category, Summary } from './types';
import { getFinancialInsights, getFinancialHealthScore, getFinancialMetrics } from './services/insightsService';
import { generateFinancialReport } from './services/pdfService';
import { t, Lang } from './services/i18nService';
import { cn } from './lib/utils';

import AssetDashboard from './AssetDashboard';

interface DashboardProps {
    summary: Summary;
    transactions: Transaction[];
    categories: Category[];
    onTabChange?: (tab: any) => void;
    lang: Lang;
}

export default function Dashboard({ summary, transactions, categories, onTabChange, lang }: DashboardProps) {
    const { theme } = useTheme();
    const [insight, setInsight] = React.useState<string | null>(null);
    const [isLoadingInsight, setIsLoadingInsight] = React.useState(false);
    const [healthScore, setHealthScore] = React.useState<number>(72);
    const [metrics, setMetrics] = React.useState<any>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            setIsLoadingInsight(true);
            const [text, score] = await Promise.all([
                getFinancialInsights(transactions, summary),
                getFinancialHealthScore(transactions, summary)
            ]);
            setInsight(text);
            setHealthScore(score);
            setMetrics(getFinancialMetrics(transactions, summary));
            setIsLoadingInsight(false);
        };
        fetchData();
    }, [transactions, summary]);

    if (!mounted) return null;

    const operatingExpenses = [
        { id: 'EXP-001', name: t('fixedAssetsRent', lang), spent: 4500, limit: 5000, color: '#ffd21f' },
        { id: 'EXP-002', name: t('cateringDining', lang), spent: 840, limit: 1200, color: '#ffd21f' },
        { id: 'EXP-003', name: t('leisureTravel', lang), spent: 2150, limit: 2000, color: '#f43f5e' }
    ];

    const categoryData = [
        { name: t('operations', lang), value: 65, color: '#ffd21f' },
        { name: t('marketing', lang), value: 20, color: mounted && theme === 'light' ? '#18181b' : '#ffffff' },
        { name: t('logistics', lang), value: 15, color: '#4f46e5' }
    ];

    const settlements = transactions.slice(0, 3).map(item => ({
        id: item.id,
        name: item.description,
        type: item.type === 'income' ? 'credit' : 'debit',
        amount: item.amount,
        status: t('completed', lang),
        time: '14:22 PM'
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
        >
            <AssetDashboard lang={lang} onTabChange={onTabChange} generateFinancialReport={() => generateFinancialReport(transactions, summary, healthScore, lang)} />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-3 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mb-2">{t('zineAiInsights', lang)}</p>
                        <h2 className="text-4xl font-black tracking-tight text-foreground leading-none lowercase" style={{ fontVariant: 'small-caps' }}>{t('insights', lang)}</h2>
                    </div>
                </div>
            </div>

            {/* Health Score & Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                <div className="obsidian-card p-8 flex items-center justify-between col-span-1 lg:col-span-2 relative overflow-hidden group border-primary/20 bg-primary/[0.02]">
                    <div className="relative z-10 flex items-center gap-8">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/5" />
                                <circle 
                                    cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" 
                                    strokeDasharray={251.2}
                                    strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                                    className="text-primary transition-all duration-1000" 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black">{healthScore}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">{t('financialHealth', lang)}</p>
                            <h3 className="text-xl font-black tracking-tight">{t('healthScore', lang)}</h3>
                            <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mt-1">{t('healthScoreDescription', lang)}</p>
                        </div>
                    </div>
                    <Activity className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 text-primary" size={80} />
                </div>

                <div className="obsidian-card p-8 flex items-center gap-6 border-indigo-500/20 bg-indigo-500/[0.02]">
                    <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">{t('burnRateVelocity', lang)}</p>
                        <h4 className="text-xl font-black">₺{metrics?.burnRate.toFixed(2)} <span className="text-[10px] font-medium opacity-20">/ DAY</span></h4>
                    </div>
                </div>

                <div className="obsidian-card p-8 flex items-center gap-6 border-emerald-500/20 bg-emerald-500/[0.02]">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">{t('efficiencyIncrease', lang)}</p>
                        <h4 className="text-xl font-black">%{metrics?.efficiency.toFixed(1)}</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Balance Card */}
                <div className="lg:col-span-2 glass-card-premium relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="text-right">
                           <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">{t('monthlyDelta', lang)}</p>
                           <p className="text-2xl font-black text-primary">+12.4%</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">{t('availableBalance', lang)}</p>
                        <h1 className="text-6xl font-black text-foreground tracking-tighter privacy-blur group-hover:scale-[1.02] transition-transform origin-left">
                            ₺{(summary.total_income - summary.total_expense).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mt-12">
                        <div>
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">{t('yieldProjection', lang)}</p>
                            <p className="text-xl font-bold text-foreground/80">₺4,200.00 / {t('perMonth', lang)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">{t('assetLiquidity', lang)}</p>
                            <p className="text-xl font-bold text-foreground/80">88.4%</p>
                        </div>
                    </div>
                    
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 blur-[120px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
                </div>

                <div className="space-y-8">
                    <div className="glass-card-premium !p-8 flex flex-col justify-center border-l-4 border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                             <p className="text-[10px] font-black text-foreground/80 uppercase tracking-widest">{t('activeExchange', lang)}</p>
                        </div>
                        <p className="text-[10px] text-foreground/40 leading-relaxed uppercase tracking-tighter">{t('systemsOptimal', lang)}</p>
                    </div>

                    <button className="w-full glass-card-premium !p-8 bg-primary/10 text-primary group hover:bg-primary hover:text-black transition-all flex justify-between items-center text-left border-primary/20">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{t('assetTransfer', lang)}</p>
                            <h3 className="text-xl font-black tracking-tight uppercase">{t('initiateWire', lang)}</h3>
                        </div>
                        <TrendingUp size={24} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expense Matrix */}
                <div className="glass-card-premium">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] mb-8">{t('expenseMatrix', lang)}</p>
                    <div className="h-[200px] relative flex items-center justify-center mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ display: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{t('total', lang)}</p>
                            <p className="text-2xl font-black text-foreground">₺{(summary.total_expense/1000).toFixed(0)}k</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {categoryData.map(cat => (
                           <div key={cat.name} className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                  <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">{cat.name}</span>
                               </div>
                               <span className="text-[10px] font-black text-foreground uppercase">{cat.value}%</span>
                           </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="obsidian-card !p-8">
                            <TrendingUp size={20} className="text-primary mb-4" />
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">{t('monthlyYield', lang)}</p>
                            <h4 className="text-2xl font-black text-foreground">₺{(summary.total_income/10).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}</h4>
                            <p className="text-[10px] font-black text-primary uppercase mt-2">+8.2% <span className="opacity-40">{t('vsLastMonth', lang)}</span></p>
                        </div>
                        <div className="obsidian-card !p-8">
                            <TrendingDown size={20} className="text-indigo-500 mb-4" />
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">{t('operationalBurn', lang)}</p>
                            <h4 className="text-2xl font-black text-foreground">₺{summary.total_expense.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}</h4>
                            <p className="text-[10px] font-black text-primary uppercase mt-2">-2.1% <span className="opacity-40">{t('efficiencyIncrease', lang)}</span></p>
                        </div>
                    </div>

                    <div className="obsidian-card relative overflow-hidden min-h-[220px] group">
                        <div className="relative z-10 p-2">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">{t('zineAiInsights', lang)}</p>
                            <p className="text-lg font-bold text-foreground/80 leading-relaxed max-w-md">
                                {isLoadingInsight ? t('analyzingSimulations', lang) : insight}
                            </p>
                            <button className="mt-8 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                {t('readAnalysis', lang)} <TrendingUp size={12} className="rotate-45" />
                            </button>
                        </div>
                        
                        <div className="absolute right-0 bottom-0 top-0 w-1/3 pointer-events-none opacity-40">
                             <svg viewBox="0 0 200 200" className="w-full h-full text-foreground/10" fill="currentColor">
                                <path d="M0,200 L50,80 L100,150 L150,20 L200,120 L200,200 Z" />
                             </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Settlements */}
            <div>
                <div className="flex justify-between items-center mb-6 px-4">
                    <h3 className="text-xl font-black text-foreground tracking-tight uppercase flex items-center gap-3">
                        <Activity className="text-primary" size={20} />
                        {t('recentSettlements', lang)}
                    </h3>
                    <button className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] hover:text-primary transition-all">{t('viewAllArchive', lang)}</button>
                </div>
                <div className="space-y-3">
                    {settlements.map((item, idx) => (
                        <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card-premium !p-6 flex items-center justify-between group hover:bg-primary/[0.05]"
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                    item.type === 'credit' ? "bg-primary/10 text-primary shadow-lg shadow-primary/5" : "bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/5"
                                )}>
                                    {item.type === 'credit' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{item.name}</h4>
                                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mt-1">{item.type} • 14:22 PM</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "text-2xl font-black tracking-tighter",
                                    item.type === 'credit' ? "text-primary" : "text-foreground"
                                )}>
                                    {item.type === 'credit' ? '+' : '-'}₺{item.amount.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                                </p>
                                <p className="text-[9px] font-black text-foreground/10 uppercase tracking-widest mt-1">{item.status}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
