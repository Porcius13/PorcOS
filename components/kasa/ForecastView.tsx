import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Calendar, Sparkles } from 'lucide-react';
import { Transaction, ForecastData } from './types';
import { t, Lang } from './services/i18nService';
import { getSpendingForecast } from './services/insightsService';
import { cn } from './lib/utils';

interface ForecastViewProps {
    transactions: Transaction[];
    lang: Lang;
}

export default function ForecastView({ transactions, lang }: ForecastViewProps) {
    const [forecast, setForecast] = useState<ForecastData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadForecast = async () => {
            const data = await getSpendingForecast(transactions);
            setForecast(data);
            setIsLoading(false);
        };
        loadForecast();
    }, [transactions]);

    if (isLoading) {
        return (
            <div className="premium-card p-12 rounded-[3rem] flex flex-col items-center justify-center gap-4 border-none bg-slate-50 dark:bg-slate-800/50">
                <Sparkles size={40} className="text-indigo-500 animate-pulse" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">{t('predictingFuture', lang)}</p>
            </div>
        );
    }

    const maxPredicted = Math.max(...forecast.map(f => f.predicted), 1);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{t('forecastTitle', lang)}</h2>
                    <p className="text-sm text-slate-500 font-medium">{t('forecastSubtitle', lang)}</p>
                </div>
            </div>

            <div className="premium-card p-8 rounded-[3rem] space-y-8">
                <div className="flex gap-4 items-end h-64 h-80">
                    {forecast.map((f, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="relative w-full flex items-end justify-center gap-1 h-full">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(f.predicted / maxPredicted) * 100}%` }}
                                    className="w-12 bg-indigo-500/10 dark:bg-indigo-500/20 border-2 border-dashed border-indigo-500/30 rounded-t-2xl relative"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        <p className="text-[10px] font-black text-white dark:text-slate-900 uppercase">{t('forecastPrediction', lang)}: {f.predicted} ₺</p>
                                    </div>
                                </motion.div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{f.month.split(' ')[0]}</p>
                                <p className="text-[8px] font-bold text-slate-300">{f.month.split(' ')[1]}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                            <Sparkles size={16} className="text-indigo-600" />
                        </div>
                        <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
                            {t('forecastInsight', lang)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
