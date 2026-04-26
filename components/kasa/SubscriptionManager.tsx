import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Trash2, Edit2, Bell, RefreshCw, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Subscription, Category } from './types';
import { cn } from './lib/utils';
import { apiFetch } from './lib/api';
import { t, Lang } from './services/i18nService';

interface SubscriptionManagerProps {
    categories: Category[];
    lang: Lang;
}

export default function SubscriptionManager({ categories, lang }: SubscriptionManagerProps) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);
    const [newSub, setNewSub] = useState({
        name: '',
        amount: '',
        category_id: '',
        frequency: 'monthly' as const,
        next_date: '',
        type: 'expense' as const,
        total_installments: ''
    });

    const fetchSubscriptions = async () => {
        const res = await apiFetch('/api/kasa/subscriptions');
        const data = await res.json();
        setSubscriptions(data || []);
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleAdd = async () => {
        if (!newSub.name || !newSub.amount || !newSub.category_id || !newSub.next_date) return;
        
        const payload = {
            ...newSub,
            amount: parseFloat(newSub.amount),
            category_id: parseInt(newSub.category_id),
            total_installments: newSub.total_installments ? parseInt(newSub.total_installments) : null
        };

        if (editingSub) {
            await apiFetch(`/api/kasa/subscriptions?id=${editingSub.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/api/kasa/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        setIsAdding(false);
        setEditingSub(null);
        setNewSub({ name: '', amount: '', category_id: '', frequency: 'monthly', next_date: '', type: 'expense', total_installments: '' });
        fetchSubscriptions();
    };

    const startEditing = (sub: Subscription) => {
        setEditingSub(sub);
        setNewSub({
            name: sub.name,
            amount: sub.amount.toString(),
            category_id: sub.category_id.toString(),
            frequency: sub.frequency,
            next_date: sub.next_date,
            type: sub.type as any,
            total_installments: sub.total_installments?.toString() || ''
        });
        setIsAdding(true);
    };

    const handleDelete = async (id: number) => {
        await apiFetch(`/api/kasa/subscriptions?id=${id}`, { method: 'DELETE' });
        fetchSubscriptions();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
        >
            <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mb-2">{t('recurringObligations', lang)}</p>
                    <h2 className="text-4xl font-black tracking-tight text-foreground leading-none">{t('subscriptions', lang)}</h2>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-110 transition-all flex items-center gap-2"
                >
                    {t('provisionNew', lang)} <Plus size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.length === 0 ? (
                    <div className="lg:col-span-3 obsidian-card !p-20 text-center space-y-6 border-dashed border-foreground/10 group hover:border-primary/20 transition-all">
                        <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto border border-foreground/5">
                            <RefreshCw size={32} className="text-foreground/10 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-foreground uppercase tracking-widest">{t('noActiveVectors', lang)}</p>
                            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest mt-2">{t('readyForProvisioning', lang)}</p>
                        </div>
                    </div>
                ) : (
                    subscriptions.map((sub, i) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="obsidian-card !p-8 group hover:bg-foreground/5 transition-all relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center text-foreground/20 group-hover:text-primary transition-colors border border-foreground/10">
                                    <CreditCard size={20} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{sub.frequency.toUpperCase()}</p>
                                    {sub.total_installments && (
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                                            {sub.total_installments - (sub.remaining_installments || 0)} / {sub.total_installments} {lang === 'tr' ? 'AY' : 'MO'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight uppercase leading-tight group-hover:text-primary transition-colors">{sub.name}</h3>
                                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                        <Calendar size={10} /> {t('nextExecution', lang)}: {(() => {
                                            try {
                                                return format(parseISO(sub.next_date), 'd MMM yyyy', { locale: lang === 'tr' ? tr : undefined }).toUpperCase();
                                            } catch (e) {
                                                return sub.next_date;
                                            }
                                        })()}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-foreground/5 flex justify-between items-end">
                                    <div>
                                        <p className="text-3xl font-black text-foreground tracking-tighter leading-none">
                                            {new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: 'TRY' }).format(sub.amount)}
                                        </p>
                                        <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mt-2">{t('subscriptionCost', lang)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => startEditing(sub)}
                                            className="p-3 text-foreground/10 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(sub.id!)}
                                            className="p-3 text-foreground/10 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Simulated Price Hike Detection */}
                            {sub.amount > 150 && (sub.name.toLowerCase().includes('netflix') || sub.name.toLowerCase().includes('aws')) && (
                                <div className="absolute top-0 right-0 left-0 bg-primary/10 border-b border-primary/20 px-8 py-2 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                        <Bell size={10} /> {t('burnRateIncreaseDetected', lang)}
                                    </span>
                                    <span className="text-[8px] font-black text-primary/40 uppercase">{t('actionRequired', lang)}</span>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Subscription Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsAdding(false);
                                setEditingSub(null);
                                setNewSub({ name: '', amount: '', category_id: '', frequency: 'monthly', next_date: '', type: 'expense', total_installments: '' });
                            }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg obsidian-card !p-12 border border-foreground/10"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
                                    {editingSub ? t('updateSubscription', lang) : t('recurringProvisioning', lang)}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingSub(null);
                                        setNewSub({ name: '', amount: '', category_id: '', frequency: 'monthly', next_date: '', type: 'expense', total_installments: '' });
                                    }} 
                                    className="text-foreground/20 hover:text-foreground transition-colors"
                                >
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <input
                                    type="text"
                                    placeholder={t('serviceName', lang)}
                                    className="w-full h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all uppercase tracking-widest"
                                    value={newSub.name}
                                    onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder={t('obligationAmount', lang)}
                                    className="w-full h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all uppercase tracking-widest"
                                    value={newSub.amount}
                                    onChange={e => setNewSub({ ...newSub, amount: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground/40 focus:text-foreground focus:outline-none focus:border-primary/50 transition-all uppercase text-[10px] tracking-widest appearance-none cursor-pointer"
                                        value={newSub.category_id}
                                        onChange={e => setNewSub({ ...newSub, category_id: e.target.value })}
                                    >
                                        <option value="">{t('category', lang).toUpperCase()}</option>
                                        {categories.filter(c => c.type === 'expense').map(c => (
                                            <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground/40 focus:text-foreground focus:outline-none focus:border-primary/50 transition-all uppercase text-[10px] tracking-widest appearance-none cursor-pointer"
                                        value={newSub.frequency}
                                        onChange={e => setNewSub({ ...newSub, frequency: e.target.value as any })}
                                    >
                                        <option value="monthly">{lang === 'tr' ? 'AYLIK' : 'MONTHLY'}</option>
                                        <option value="weekly">{lang === 'tr' ? 'HAFTALIK' : 'WEEKLY'}</option>
                                        <option value="yearly">{lang === 'tr' ? 'YILLIK' : 'YEARLY'}</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        className="w-full h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground/40 focus:text-foreground focus:outline-none focus:border-primary/50 transition-all uppercase text-[10px] tracking-widest cursor-pointer"
                                        value={newSub.next_date}
                                        onChange={e => setNewSub({ ...newSub, next_date: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder={t('installmentCount', lang).toUpperCase()}
                                        className="w-full h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all uppercase text-[10px] tracking-widest"
                                        value={newSub.total_installments}
                                        onChange={e => setNewSub({ ...newSub, total_installments: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={handleAdd}
                                    className="w-full h-16 bg-primary text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {editingSub ? t('reAuthorizeSchedule', lang) : t('authorizeSchedule', lang)}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
