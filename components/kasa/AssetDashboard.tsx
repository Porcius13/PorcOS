import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Coins, 
    TrendingUp, 
    TrendingDown, 
    Plus, 
    RefreshCw, 
    ArrowUpRight,
    Wallet,
    Calendar,
    DollarSign,
    ChevronRight,
    CircleSlash,
    Upload,
    FileText,
    Edit2,
    Trash2,
    X,
    Save,
    Briefcase
} from 'lucide-react';
import { Investment } from './types';
import { fetchAssetPrices, AssetPrices } from './services/priceService';
import { t, Lang } from './services/i18nService';
import { cn } from './lib/utils';

interface AssetDashboardProps {
    lang: Lang;
    onTabChange?: (tab: any) => void;
    generateFinancialReport?: () => void;
    variant?: 'dashboard' | 'full';
}

export default function AssetDashboard({ lang, onTabChange, generateFinancialReport, variant = 'dashboard' }: AssetDashboardProps) {
    const [assets, setAssets] = useState<Investment[]>([]);
    const [prices, setPrices] = useState<AssetPrices | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Investment | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [newAsset, setNewAsset] = useState<Partial<Investment>>({
        name: '',
        type: 'gold',
        amount: 0,
        purchase_price: 0,
        currency: 'TRY',
        subtype: 'Gram'
    });

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const [assetsRes, pricesData] = await Promise.all([
                fetch('/api/kasa/investments'),
                fetchAssetPrices()
            ]);
            const assetsData = await assetsRes.json();
            setAssets(assetsData);
            setPrices(pricesData);
        } catch (error) {
            console.error("Failed to fetch assets or prices:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/kasa/investments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAsset)
            });
            if (res.ok) {
                setIsAdding(false);
                setNewAsset({ name: '', type: 'gold', amount: 0, purchase_price: 0, currency: 'TRY', subtype: 'Gram' });
                fetchData();
            }
        } catch (error) {
            console.error("Create failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAsset) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/kasa/investments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingAsset)
            });
            if (res.ok) {
                setEditingAsset(null);
                fetchData();
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('deleteAsset', lang) + "?")) return;
        try {
            const res = await fetch(`/api/kasa/investments?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const getLiveValue = (asset: Investment) => {
        if (!prices) return asset.purchase_price * asset.amount;
        
        let livePrice = asset.purchase_price;
        if (asset.type === 'gold') livePrice = prices.GOLD_GRAM;
        else if (asset.currency === 'USD') livePrice = prices.USD;
        else if (asset.currency === 'EUR') livePrice = prices.EUR;
        else if (asset.currency === 'GBP') livePrice = prices.GBP;
        else if (asset.current_price) livePrice = asset.current_price;

        return livePrice * asset.amount;
    };

    const calculateTotals = () => {
        let totalCost = 0;
        let totalCurrent = 0;

        assets.forEach(asset => {
            totalCost += asset.purchase_price * asset.amount;
            totalCurrent += getLiveValue(asset);
        });

        const profit = totalCurrent - totalCost;
        const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        return { totalCost, totalCurrent, profit, profitRate };
    };

    const { totalCurrent, profit, profitRate } = calculateTotals();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-foreground/5 rounded-[2rem]" />)}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    {variant === 'full' ? (
                        <>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('assetManagement', lang)}</p>
                            <h2 className="text-5xl font-black tracking-tight leading-none uppercase">{t('portfolioAssets', lang)}</h2>
                        </>
                    ) : (
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('totalPortfolio', lang)}</p>
                    )}
                    
                    <div className="flex items-center gap-6 mt-4">
                        <h2 className={cn(
                            "font-black tracking-tight leading-none tabular-nums",
                            variant === 'full' ? "text-6xl text-primary" : "text-5xl"
                        )}>
                            {totalCurrent.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </h2>
                        <div className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[12px] font-black uppercase tracking-widest",
                            profit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                            {profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {profitRate.toFixed(2)}%
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {variant === 'dashboard' ? (
                        <>
                            <button
                                onClick={() => onTabChange?.('import')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-3 p-4 bg-primary text-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest"
                            >
                                <Upload size={18} />
                                {t('smartImport', lang)}
                            </button>
                            <button
                                onClick={generateFinancialReport}
                                className="flex-1 md:flex-none flex items-center justify-center gap-3 p-4 bg-foreground/5 text-foreground border border-foreground/10 rounded-2xl hover:bg-foreground/10 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                <FileText size={18} />
                                {t('generateReport', lang)}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-primary text-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            <Plus size={20} />
                            {t('addNewAsset', lang)}
                        </button>
                    )}
                    <button 
                        onClick={fetchData}
                        disabled={isRefreshing}
                        className="p-5 bg-foreground/5 rounded-2xl hover:bg-foreground/10 transition-all group border border-foreground/5 shadow-inner"
                    >
                        <RefreshCw size={18} className={cn(isRefreshing && "animate-spin", "opacity-40 group-hover:opacity-100")} />
                    </button>
                </div>
            </div>

            {/* Asset Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((asset, idx) => {
                    const currentVal = getLiveValue(asset);
                    const cost = asset.purchase_price * asset.amount;
                    const p = currentVal - cost;
                    const pRate = (p / cost) * 100;

                    return (
                        <motion.div
                            key={asset.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card-premium p-8 group relative overflow-hidden"
                        >
                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                                        asset.type === 'gold' ? "bg-amber-500/10 text-amber-500" : 
                                        asset.type === 'stock' ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
                                    )}>
                                        {asset.type === 'gold' ? <Coins size={24} /> : 
                                         asset.type === 'stock' ? <Briefcase size={24} /> : 
                                         asset.type === 'currency' ? <DollarSign size={24} /> :
                                         <TrendingUp size={24} />}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <div className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                                            p >= 0 ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                                        )}>
                                            {pRate.toFixed(1)}%
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setEditingAsset(asset)}
                                                className="p-2 bg-foreground/5 rounded-lg hover:bg-foreground/10 text-foreground/40 hover:text-primary transition-all border border-foreground/5"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(asset.id)}
                                                className="p-2 bg-foreground/5 rounded-lg hover:bg-rose-500/10 text-foreground/40 hover:text-rose-500 transition-all border border-foreground/5"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">{asset.name}</h3>
                                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mt-1">{asset.amount} {asset.subtype || asset.type}</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-foreground/5">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{t('assetValue', lang)}</p>
                                        <p className="text-2xl font-black tabular-nums">{currentVal.toLocaleString('tr-TR')} ₺</p>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="opacity-20 uppercase tracking-widest">{t('purchasePrice', lang)}</span>
                                        <span className={cn(
                                            "tabular-nums opacity-60 px-2 py-0.5 rounded-md", 
                                            variant === 'full' ? "bg-foreground/5" : ""
                                        )}>
                                            {asset.purchase_price.toLocaleString('tr-TR')} ₺
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                {asset.type === 'gold' ? <Coins size={120} /> : 
                                 asset.type === 'currency' ? <DollarSign size={120} /> : 
                                 <Wallet size={120} />}
                            </div>
                        </motion.div>
                    );
                })}

                {assets.length === 0 && (
                    <div className="lg:col-span-3 py-20 flex flex-col items-center justify-center border-2 border-dashed border-foreground/10 rounded-[3rem] opacity-20 grayscale">
                        <CircleSlash size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.4em]">Stratejik varlık bulunamadı</p>
                    </div>
                )}
            </div>

            {/* Modals Interface (Add / Edit) */}
            <AnimatePresence>
                {(isAdding || editingAsset) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsAdding(false); setEditingAsset(null); }}
                            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg glass-card-premium p-10 overflow-hidden shadow-2xl shadow-primary/5"
                        >
                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-3xl font-black tracking-tight uppercase text-primary">
                                        {editingAsset ? t('editAsset', lang) : t('addNewAsset', lang)}
                                    </h2>
                                    <button 
                                        onClick={() => { setIsAdding(false); setEditingAsset(null); }}
                                        className="p-3 bg-foreground/5 rounded-2xl hover:bg-foreground/10 transition-all opacity-40 hover:opacity-100"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={editingAsset ? handleUpdate : handleCreate} className="space-y-6">
                                    {/* Asset Identity */}
                                    {!editingAsset && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {(['gold', 'stock', 'crypto', 'currency'] as const).map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => {
                                                        const updates: any = { type };
                                                        if (type === 'currency' && !newAsset.currency) updates.currency = 'USD';
                                                        setNewAsset({...newAsset, ...updates});
                                                    }}
                                                    className={cn(
                                                        "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        newAsset.type === type ? "bg-primary text-black border-primary" : "bg-foreground/5 opacity-40 border-transparent hover:opacity-100"
                                                    )}
                                                >
                                                    {t(type, lang)}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            {/* Name / Identifier */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('assetIdentifier', lang)}</label>
                                                <input 
                                                    type="text"
                                                    value={editingAsset ? editingAsset.name : newAsset.name}
                                                    onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, name: e.target.value}) : setNewAsset({...newAsset, name: e.target.value})}
                                                    placeholder="ör. BTC, AAPL, Nakit Dolar"
                                                    className="w-full p-6 bg-foreground/5 rounded-[1.5rem] border border-transparent focus:border-primary/20 focus:bg-foreground/[0.07] outline-none transition-all font-black text-xl placeholder:opacity-20 uppercase"
                                                    required
                                                />
                                            </div>

                                            {/* Currency Selector for Currency Assets */}
                                            {((editingAsset?.type || newAsset.type) === 'currency' || (editingAsset?.type || newAsset.type) === 'crypto' || (editingAsset?.type || newAsset.type) === 'stock') && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('language', lang) === 'Language' ? 'Currency' : 'Para Birimi'}</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {['USD', 'EUR', 'GBP', 'TRY'].map(curr => (
                                                            <button
                                                                key={curr}
                                                                type="button"
                                                                onClick={() => editingAsset ? setEditingAsset({...editingAsset, currency: curr}) : setNewAsset({...newAsset, currency: curr})}
                                                                className={cn(
                                                                    "py-3 rounded-xl text-[10px] font-black border transition-all",
                                                                    (editingAsset?.currency || newAsset.currency) === curr ? "bg-primary text-black border-primary" : "bg-foreground/5 opacity-40 border-transparent hover:opacity-100"
                                                                )}
                                                            >
                                                                {curr}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Quantity */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">
                                                    {t('quantity', lang)} ({editingAsset ? (editingAsset.subtype || editingAsset.type) : (newAsset.subtype || newAsset.type)})
                                                </label>
                                                <input 
                                                    type="number"
                                                    step="any"
                                                    value={(editingAsset ? editingAsset.amount : newAsset.amount) || 0}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        const safeVal = isNaN(val) ? 0 : val;
                                                        if (editingAsset) setEditingAsset({...editingAsset, amount: safeVal});
                                                        else setNewAsset({...newAsset, amount: safeVal});
                                                    }}
                                                    className="w-full p-6 bg-foreground/5 rounded-[1.5rem] border border-transparent focus:border-primary/20 focus:bg-foreground/[0.07] outline-none transition-all font-black text-xl tabular-nums"
                                                    required
                                                />
                                            </div>

                                            {/* Price */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t('purchasePrice', lang)} (₺)</label>
                                                <input 
                                                    type="number"
                                                    step="any"
                                                    value={(editingAsset ? editingAsset.purchase_price : newAsset.purchase_price) || 0}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        const safeVal = isNaN(val) ? 0 : val;
                                                        if (editingAsset) setEditingAsset({...editingAsset, purchase_price: safeVal});
                                                        else setNewAsset({...newAsset, purchase_price: safeVal});
                                                    }}
                                                    className="w-full p-6 bg-foreground/5 rounded-[1.5rem] border border-transparent focus:border-primary/20 focus:bg-foreground/[0.07] outline-none transition-all font-black text-xl tabular-nums"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full p-8 bg-primary text-black rounded-[2rem] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 text-xs disabled:opacity-50 mt-4"
                                    >
                                        {isSaving ? <RefreshCw size={24} className="animate-spin" /> : <Save size={24} />}
                                        {editingAsset ? t('updateAsset', lang) : t('authorizeAllocation', lang)}
                                    </button>
                                </form>
                            </div>

                            {/* Decorative Background Icon */}
                            <div className="absolute -right-16 -bottom-16 opacity-[0.05] pointer-events-none scale-150 transform rotate-12">
                                {(editingAsset?.type || newAsset.type) === 'gold' ? <Coins size={320} /> : <Wallet size={320} />}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
