import * as React from 'react';
import { useRef } from 'react';
import { motion } from 'motion/react';
import {
    FileText,
    Upload,
    Loader2,
    CheckCircle2,
    Sparkles,
    Zap
} from 'lucide-react';
import { analyzeStatement } from './services/geminiService';
import { t, Lang } from './services/i18nService';

interface AIAnalysisProps {
    isAnalyzing: boolean;
    setIsAnalyzing: (v: boolean) => void;
    aiResults: any[];
    setAiResults: (v: any[]) => void;
    isBulkApproving: boolean;
    onBulkApprove: () => void;
    onConfirmItem: (item: any) => void;
    lang: Lang;
}

export default function AIAnalysis({
    isAnalyzing,
    setIsAnalyzing,
    aiResults,
    setAiResults,
    isBulkApproving,
    onBulkApprove,
    onConfirmItem,
    lang
}: AIAnalysisProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            try {
                const results = await analyzeStatement(base64, file.type);
                setAiResults(results);
            } catch (error) {
                console.error('AI Analysis failed:', error);
                alert(t('analysisFailed', lang));
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="premium-gradient-primary rounded-[2.5rem] p-8 text-black dark:text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest opacity-60">{t('smartAnalysis', lang)}</span>
                    </div>
                    <h2 className="text-3xl font-black mb-3 leading-tight">{t('aiStatementAnalysis', lang)}</h2>
                    <p className="text-black/60 dark:text-primary-foreground/80 mb-8 max-w-xs font-medium leading-relaxed">
                        {t('uploadStatementDescription', lang)}
                    </p>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="group bg-background text-foreground dark:bg-white dark:text-indigo-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 disabled:opacity-70 shadow-xl shadow-black/10 dark:shadow-indigo-900/20"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={22} /> : <Upload size={22} className="group-hover:-translate-y-1 transition-transform" />}
                        {isAnalyzing ? t('analyzing', lang) : t('uploadStatement', lang)}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,application/pdf"
                    />
                </div>

                {/* Abstract background elements */}
                <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute right-[20px] bottom-[-40px] opacity-10 rotate-12">
                    <FileText size={240} strokeWidth={1} />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <Zap size={400} strokeWidth={1} />
                </div>
            </div>

            {aiResults.length > 0 && (
                <div className="premium-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
                        <div>
                            <h3 className="text-lg font-bold">{t('spendingFound', lang)}</h3>
                            <span className="text-xs font-black text-primary uppercase tracking-widest">{aiResults.length} {t('transactionsDetected', lang)}</span>
                        </div>
                        <button
                            onClick={onBulkApprove}
                            disabled={isBulkApproving}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-500/20 uppercase tracking-wider"
                        >
                            {isBulkApproving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            {t('approveAll', lang)}
                        </button>
                    </div>

                    <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[400px] overflow-y-auto no-scrollbar">
                        {aiResults.map((item, idx) => (
                            <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <CheckCircle2 size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{item.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-wider">{item.category_suggestion}</span>
                                            <span className="text-[11px] font-medium text-slate-400">{item.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-black text-lg text-foreground">
                                        -{item.amount} <span className="text-xs font-medium opacity-50">₺</span>
                                    </p>
                                    <button
                                        onClick={() => onConfirmItem(item)}
                                        className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center active:scale-90"
                                    >
                                        <CheckCircle2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
