import * as React from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    ArrowRight, 
    Target, 
    Zap, 
    BarChart3,
    Sparkles,
    Scale
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { t, Lang } from './services/i18nService';

interface WhatIfSimulatorProps {
    currentBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    lang: Lang;
}

export default function WhatIfSimulator({ currentBalance, monthlyIncome, monthlyExpense, lang }: WhatIfSimulatorProps) {
    const [incomeAdjustment, setIncomeAdjustment] = React.useState(0);
    const [expenseAdjustment, setExpenseAdjustment] = React.useState(0);
    const [months, setMonths] = React.useState(12);
    const [savingsGoal, setSavingsGoal] = React.useState(50000);

    const calculateProjection = () => {
        const data = [];
        let balance = currentBalance;
        const adjustedIncome = monthlyIncome * (1 + incomeAdjustment / 100);
        const adjustedExpense = monthlyExpense * (1 - expenseAdjustment / 100);
        const monthlySavings = adjustedIncome - adjustedExpense;

        for (let i = 0; i <= months; i++) {
            data.push({
                month: i,
                balance: Math.round(balance + monthlySavings * i),
                goal: savingsGoal
            });
        }
        return data;
    };

    const projectionData = calculateProjection();
    const finalBalance = projectionData[projectionData.length - 1].balance;
    const goalReached = finalBalance >= savingsGoal;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-32"
        >
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-primary animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">{t('scenarioAnalysis', lang)}</p>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground leading-none">{t('whatIfSimulator', lang)}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Card */}
                <div className="lg:col-span-1 glass-card-premium p-8 space-y-10">
                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t('monthlyAdjustment', lang)} (Income)</label>
                            <span className="text-primary font-black">+{incomeAdjustment}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="100" step="5"
                            value={incomeAdjustment}
                            onChange={(e) => setIncomeAdjustment(parseInt(e.target.value))}
                            className="w-full accent-primary bg-foreground/10 h-1.5 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t('monthlyAdjustment', lang)} (Expense)</label>
                            <span className="text-indigo-400 font-black">-{expenseAdjustment}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="50" step="5"
                            value={expenseAdjustment}
                            onChange={(e) => setExpenseAdjustment(parseInt(e.target.value))}
                            className="w-full accent-indigo-400 bg-foreground/10 h-1.5 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t('savingsGoal', lang)}</label>
                            <span className="text-white font-black">₺{savingsGoal.toLocaleString()}</span>
                        </div>
                        <input 
                            type="number" 
                            value={savingsGoal}
                            onChange={(e) => setSavingsGoal(parseInt(e.target.value))}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-xl font-black focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <Zap size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Zine AI Advice</span>
                        </div>
                        <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                            Based on your {expenseAdjustment}% expense reduction, you will reach your ₺{savingsGoal.toLocaleString()} goal in {Math.ceil((savingsGoal - currentBalance) / (monthlyIncome * (1 + incomeAdjustment/100) - monthlyExpense * (1 - expenseAdjustment/100)))} months.
                        </p>
                    </div>
                </div>

                {/* Projection Chart */}
                <div className="lg:col-span-2 glass-card-premium p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-1">{t('projectedSavings', lang)}</p>
                            <h3 className="text-3xl font-black tracking-tighter">₺{finalBalance.toLocaleString()}</h3>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${goalReached ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-400'}`}>
                            <Target size={14} />
                            {goalReached ? 'Goal Achievable' : 'Adjustment Needed'}
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffd21f" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ffd21f" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="rgba(255,255,255,0.1)" 
                                    tick={{fontSize: 10, fontWeight: 900, fill: 'white', opacity: 0.2}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    hide 
                                    domain={[0, 'auto']}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#ffd21f', fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="balance" 
                                    stroke="#ffd21f" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorBalance)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/5">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-foreground/20 uppercase">Monthly Savings</p>
                            <p className="text-xl font-bold text-white">₺{(monthlyIncome*(1+incomeAdjustment/100) - monthlyExpense*(1-expenseAdjustment/100)).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-foreground/20 uppercase">Total Delta</p>
                            <p className="text-xl font-bold text-emerald-500">+₺{(finalBalance - currentBalance).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-foreground/20 uppercase">Efficiency</p>
                            <p className="text-xl font-bold text-indigo-400">%{((1 - (monthlyExpense*(1-expenseAdjustment/100))/(monthlyIncome*(1+incomeAdjustment/100)))*100).toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
