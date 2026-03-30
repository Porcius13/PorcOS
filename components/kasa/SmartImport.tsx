import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, 
    Camera, 
    FileText, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    X,
    ShieldCheck,
    History,
    Building2,
    Calendar,
    Trash2
} from 'lucide-react';
import { scanReceipt } from './services/ocrService';
import { analyzeStatement } from './services/geminiService';
import { t, Lang } from './services/i18nService';
import { Transaction } from './types';
import { cn } from './lib/utils';

interface SmartImportProps {
    transactions: Transaction[];
    onResult: (data: any) => void;
    onBulkApprove: (items: any[], metadata?: any) => Promise<boolean>;
    isBulkApproving: boolean;
    lang: Lang;
}

interface ImportResult {
    amount: number;
    description: string;
    date: string;
    category_suggestion: string;
    type: 'income' | 'expense';
    isDuplicate?: boolean;
}

interface StatementInfo {
    bank_name: string;
    period: string;
    total_amount?: number;
}

interface StatementLog {
    id: number;
    title: string;
    bank_name: string;
    period: string;
    created_at: string;
}

export default function SmartImport({ 
    transactions, 
    onResult, 
    onBulkApprove, 
    isBulkApproving, 
    lang 
}: SmartImportProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<ImportResult[]>([]);
    const [statementInfo, setStatementInfo] = useState<StatementInfo | null>(null);
    const [history, setHistory] = useState<StatementLog[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/kasa/statements');
            const data = await res.json();
            if (Array.isArray(data)) setHistory(data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const handleDeleteLog = async (id: number) => {
        if (!confirm(t('confirmDelete', lang))) return;
        try {
            const res = await fetch(`/api/kasa/statements?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchHistory();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const checkDuplicate = (newItem: ImportResult) => {
        return transactions.some(t => 
            Math.abs(t.amount - newItem.amount) < 0.01 && 
            t.date === newItem.date &&
            (t.description.toLowerCase().includes(newItem.description.toLowerCase()) || 
             newItem.description.toLowerCase().includes(t.description.toLowerCase()))
        );
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setPreview(file.type.startsWith('image/') ? base64 : null);

            try {
                let aiData: any;
                if (file.type.startsWith('image/')) {
                    const ocrResult = await scanReceipt(base64, file.type);
                    aiData = {
                        transactions: [ocrResult],
                        statement_info: { bank_name: 'Manual Scan', period: new Date().toLocaleDateString() }
                    };
                } else {
                    aiData = await analyzeStatement(base64, file.type);
                }

                const items = aiData.transactions || [];
                setStatementInfo(aiData.statement_info || null);

                // Add duplicate flag
                const processedItems: ImportResult[] = items.map((item: any) => ({
                    ...item,
                    isDuplicate: checkDuplicate(item)
                }));

                setResults(processedItems);
            } catch (error) {
                console.error('Import failed:', error);
                alert(t('analysisFailed', lang));
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Main Upload Zone */}
            <div className="premium-gradient-primary rounded-[3rem] p-12 text-black dark:text-white relative overflow-hidden shadow-2xl shadow-primary/20 group">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-[0.3em] opacity-60">{t('smartAnalysis', lang)}</span>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter leading-none">{t('smartImport', lang)}</h2>
                        <p className="text-lg font-medium opacity-70 leading-relaxed max-w-md">
                            {t('smartImportDescription', lang)}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isAnalyzing}
                                className="bg-background text-foreground dark:bg-white dark:text-indigo-600 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-black/10"
                            >
                                {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                {isAnalyzing ? t('analyzing', lang) : t('uploadStatement', lang)}
                            </button>
                            <div className="px-6 py-5 rounded-[2rem] border border-white/20 backdrop-blur-md flex items-center gap-3">
                                <ShieldCheck size={20} className="text-white/60" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">AES-256 Encrypted</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-64 h-64 border-2 border-dashed border-white/20 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                        {preview ? (
                            <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                        ) : (
                            <>
                                <Camera size={40} className="opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('scanReceiptSubtitle', lang)}</p>
                            </>
                        )}
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 size={32} className="animate-spin text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative BG Elements */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf"
                />
            </div>

            {/* Results Section */}
            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="obsidian-card !p-0 overflow-hidden border border-primary/10 shadow-3xl"
                    >
                        <div className="p-10 border-b border-foreground/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-foreground/[0.02] gap-6">
                            <div className="flex items-center gap-6">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">{t('spendingFound', lang)}</h3>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg">
                                            <Building2 size={12} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{statementInfo?.bank_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-lg">
                                            <Calendar size={12} className="text-indigo-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{statementInfo?.period}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => {
                                        setResults([]);
                                        setStatementInfo(null);
                                    }}
                                    className="p-4 rounded-2xl bg-foreground/5 text-foreground/40 hover:text-foreground transition-all"
                                >
                                    <X size={20} />
                                </button>
                                <button
                                    onClick={async () => {
                                        const success = await onBulkApprove(results, statementInfo);
                                        if (success) {
                                            setResults([]);
                                            setStatementInfo(null);
                                            fetchHistory();
                                        }
                                    }}
                                    disabled={isBulkApproving}
                                    className="flex-1 md:flex-none bg-primary text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                >
                                    {isBulkApproving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    {t('approveAll', lang)}
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-foreground/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {results.map((item, idx) => (
                                <div key={idx} className="p-8 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors relative group">
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-16 h-16 rounded-[1.8rem] flex items-center justify-center relative overflow-hidden",
                                            item.isDuplicate ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                                        )}>
                                            {item.isDuplicate ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-black tracking-tight uppercase leading-none">{item.description}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-foreground/5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-foreground/40">{item.category_suggestion}</span>
                                                <span className="text-[10px] font-medium opacity-30">{item.date}</span>
                                                {item.isDuplicate && (
                                                    <span className="flex items-center gap-1.5 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                                                        <AlertCircle size={10} />
                                                        {t('duplicateFound', lang)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-2xl font-black",
                                            item.type === 'income' ? "text-emerald-500" : "text-foreground"
                                        )}>
                                            {item.type === 'income' ? '+' : '-'}{item.amount} ₺
                                        </p>
                                        <button 
                                            onClick={() => onResult(item)}
                                            className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:brightness-125 transition-all mt-1"
                                        >
                                            {t('reconcile', lang)}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Uploads History */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 opacity-40">
                    <History size={16} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">{t('recentStatements', lang)}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.length > 0 ? (
                        history.map((log) => (
                            <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card-premium p-6 flex flex-col gap-4 border border-white/5 hover:border-primary/20 transition-all cursor-default group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black tracking-tight leading-none group-hover:text-primary transition-colors">{log.bank_name}</p>
                                        <p className="text-[10px] font-bold text-foreground/30 mt-1 uppercase tracking-widest">{log.period}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 flex items-center gap-2">
                                        <CheckCircle2 size={10} />
                                        {t('statementAdded', lang)}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-medium opacity-20">{new Date(log.created_at).toLocaleDateString()}</span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteLog(log.id);
                                            }}
                                            className="p-1.5 hover:bg-rose-500/10 text-foreground/20 hover:text-rose-500 rounded-lg transition-all"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center opacity-20 border-2 border-dashed border-foreground/10 rounded-[2rem]">
                            <p className="text-xs font-black uppercase tracking-widest">No history yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

