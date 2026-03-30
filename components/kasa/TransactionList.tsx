import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag,
    Trash2,
    Calendar,
    Search,
    Filter,
    Plus
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Transaction } from './types';
import { t, Lang } from './services/i18nService';
import { cn } from './lib/utils';

interface TransactionListProps {
    transactions: Transaction[];
    onDelete: (id: number) => void;
    lang: Lang;
}

export default function TransactionList({ transactions, onDelete, lang }: TransactionListProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterType, setFilterType] = React.useState<'all' | 'income' | 'expense'>('all');
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    const [minPrice, setMinPrice] = React.useState<string>('');
    const [maxPrice, setMaxPrice] = React.useState<string>('');

    const filteredTransactions = transactions.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesMin = !minPrice || item.amount >= parseFloat(minPrice);
        const matchesMax = !maxPrice || item.amount <= parseFloat(maxPrice);
        return matchesSearch && matchesType && matchesMin && matchesMax;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12 pb-12"
        >
             <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mb-2">{t('ledgerHistory', lang)}</p>
                    <h2 className="text-4xl font-black tracking-tight text-foreground leading-none">{t('transactionsTitle', lang)}</h2>
                </div>
                <div className="flex items-center gap-4">
                     <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('searchVectors', lang)}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground placeholder:text-foreground/20 outline-none transition-all focus:border-primary/50 focus:bg-foreground/10 w-64"
                        />
                    </div>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={cn(
                            "p-4 bg-foreground/5 border border-foreground/10 rounded-2xl transition-all hover:bg-foreground/10 group",
                            showAdvancedFilters ? "text-primary border-primary/30 bg-primary/5" : "text-foreground/20"
                        )}
                    >
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showAdvancedFilters && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="obsidian-card !p-8 border border-primary/10 bg-primary/5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest px-2">{t('flowDirection', lang)}</p>
                                <button
                                    onClick={() => setFilterType(prev => prev === 'all' ? 'income' : prev === 'income' ? 'expense' : 'all')}
                                    className="w-full h-14 bg-foreground/5 text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest border border-foreground/10 hover:border-primary/30 transition-all text-left px-6"
                                >
                                    {filterType === 'all' ? t('allVectors', lang) : filterType === 'income' ? t('incomeOnly', lang) : t('expenseOnly', lang)}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest px-2">{t('minimumRadius', lang)}</p>
                                <input
                                    type="number"
                                    placeholder="0 ₺"
                                    value={minPrice}
                                    onChange={e => setMinPrice(e.target.value)}
                                    className="w-full h-14 bg-foreground/5 text-foreground rounded-xl px-6 text-[10px] font-black border border-foreground/10 outline-none focus:border-primary/50 uppercase tracking-widest appearance-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest px-2">{t('maximumRadius', lang)}</p>
                                <input
                                    type="number"
                                    placeholder="∞ ₺"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                    className="w-full h-14 bg-foreground/5 text-foreground rounded-xl px-6 text-[10px] font-black border border-foreground/10 outline-none focus:border-primary/50 uppercase tracking-widest appearance-none"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="obsidian-card !p-0 overflow-hidden border border-foreground/5">
                <div className="divide-y divide-foreground/5">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-32 text-center">
                            <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-foreground/5">
                                <Tag size={32} className="text-foreground/10" />
                            </div>
                             <p className="text-sm font-black text-foreground uppercase tracking-widest leading-none">{t('noTransactionVectors', lang)}</p>
                             <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mt-4">{t('adjustFilters', lang)}</p>
                        </div>
                    ) : (
                        filteredTransactions.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="p-8 hover:bg-foreground/5 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-8">
                                    <div
                                        className="w-16 h-16 rounded-[2rem] flex items-center justify-center text-foreground relative overflow-hidden group-hover:scale-110 transition-transform border border-foreground/5"
                                        style={{ backgroundColor: `rgba(var(--foreground),0.02)` }}
                                    >
                                        <div className="absolute inset-0 opacity-10 blur-sm" style={{ backgroundColor: item.category_color || '#ffd21f' }} />
                                        <Tag size={24} strokeWidth={2.5} style={{ color: item.category_color || '#ffd21f' }} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-black text-foreground tracking-tight uppercase leading-none group-hover:text-primary transition-colors">{item.description}</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">{item.category_name}</span>
                                            <span className="w-1 h-1 bg-foreground/10 rounded-full" />
                                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={10} />
                                                {(() => {
                                                    try {
                                                         if (!item.date) return 'UNDEFINED';
                                                         const d = parseISO(item.date);
                                                         return format(d, 'd MMM yyyy', { locale: lang === 'tr' ? tr : undefined }).toUpperCase();
                                                    } catch (e) {
                                                        return item.date || 'ERROR';
                                                    }
                                                })()}
                                            </span>
                                             {item.is_ai_generated && (
                                                 <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-primary/20">{t('neuralArchive', lang)}</span>
                                             )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                         <p className={cn(
                                             "text-3xl font-black tracking-tighter leading-none mb-1",
                                             item.type === 'income' ? "text-primary" : "text-foreground"
                                         )}>
                                             {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                                         </p>
                                         <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{t('transactionValue', lang)} (TRY)</p>
                                    </div>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-4 text-foreground/5 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-500/20"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}
