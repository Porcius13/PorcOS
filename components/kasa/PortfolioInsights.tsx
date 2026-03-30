import * as React from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Target, Award } from 'lucide-react';
import { cn } from './lib/utils';
import { t, Lang } from './services/i18nService';

interface PortfolioInsightsProps {
    lang: Lang;
}

export default function PortfolioInsights({ lang }: PortfolioInsightsProps) {
    const score = 742; // Sample score
    const scoreColor = score > 700 ? "text-emerald-500" : score > 500 ? "text-amber-500" : "text-rose-500";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <Shield size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">{t('financialAnalysisTitle', lang)}</h2>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('creditScoreSubtitle', lang)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Credit Score Card */}
                <div className="premium-card p-6 rounded-[2.5rem] shadow-xl overflow-hidden relative border border-slate-200 dark:border-white/10">
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <Award size={32} className="text-indigo-500 mb-2" />
                        <h3 className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">{t('buddyScoreTitle', lang)}</h3>
                        <div className={cn("text-6xl font-black my-2", scoreColor)}>{score}</div>
                        <p className="text-xs font-bold text-foreground/60">
                            {t('buddyScoreDescription', lang)}
                        </p>

                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(score / 1000) * 100}%` }}
                                className="h-full bg-indigo-600 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between w-full mt-2 text-[8px] font-black text-slate-400">
                            <span>0</span>
                            <span>{t('scorePoor', lang)}</span>
                            <span>{t('scoreMedium', lang)}</span>
                            <span>{t('scoreGood', lang)}</span>
                            <span>1000</span>
                        </div>
                    </div>
                </div>

                {/* Portfolio Insights */}
                <div className="premium-card p-6 bg-primary text-black dark:bg-card dark:text-foreground rounded-[2.5rem] shadow-xl relative h-full border-none">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-white/10 p-2 rounded-xl">
                            <TrendingUp size={20} className="text-emerald-400" />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t('monthlyOpportunity', lang)}</div>
                            <div className="text-lg font-black">+1.240 ₺ {t('opportunityLoss', lang)}</div>
                        </div>
                    </div>

                    <p className="text-[11px] text-white/70 leading-relaxed mb-6">
                        {t('portfolioInsightText', lang)}
                    </p>

                    <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        {t('updateStrategyButton', lang)}
                    </button>
                </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-3xl flex gap-4 items-center border border-indigo-100 dark:border-indigo-900/30">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Target size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">{t('savingsGoalInsightShort', lang)}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">{t('savingsGoalAdvice', lang)}</p>
                </div>
            </div>
        </div>
    );
}
