import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard as CardIcon, Plus, Trash2, Edit2, Calendar, AlertCircle, Bell } from 'lucide-react';
import { CreditCard } from './types';
import { cn } from './lib/utils';
import { apiFetch } from './lib/api';
import { t, Lang } from './services/i18nService';

interface CreditCardManagerProps {
    lang: Lang;
}

export default function CreditCardManager({ lang }: CreditCardManagerProps) {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
    const [newCard, setNewCard] = useState({
        name: '',
        card_limit: '',
        balance: '',
        closing_day: '15',
        due_day: '25',
        color: '#ffd21f'
    });

    const fetchCards = async () => {
        const res = await apiFetch('/api/kasa/cards');
        if (res.ok) {
            const data = await res.json();
            setCards(data || []);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleAdd = async () => {
        if (!newCard.name || !newCard.card_limit || !newCard.balance) return;
        
        const payload = {
            ...newCard,
            card_limit: parseFloat(newCard.card_limit),
            balance: parseFloat(newCard.balance),
            closing_day: parseInt(newCard.closing_day),
            due_day: parseInt(newCard.due_day)
        };

        if (editingCard) {
            await apiFetch(`/api/kasa/cards/${editingCard.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/api/kasa/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        setIsAdding(false);
        setEditingCard(null);
        setNewCard({ name: '', card_limit: '', balance: '', closing_day: '15', due_day: '25', color: '#ffd21f' });
        fetchCards();
    };

    const startEditing = (card: CreditCard) => {
        setEditingCard(card);
        setNewCard({
            name: card.name,
            card_limit: card.card_limit.toString(),
            balance: card.balance.toString(),
            closing_day: card.closing_day.toString(),
            due_day: card.due_day.toString(),
            color: card.color || '#ffd21f'
        });
        setIsAdding(true);
    };

    const handleDelete = async (id: number) => {
        await apiFetch(`/api/kasa/cards/${id}`, { method: 'DELETE' });
        fetchCards();
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
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mb-2">{t('creditArchitecture', lang)}</p>
                    <h2 className="text-4xl font-black tracking-tight text-foreground leading-none">{t('creditCardManager', lang)}</h2>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-110 transition-all flex items-center gap-2"
                >
                    {t('issueNewCard', lang)} <Plus size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="obsidian-card !p-0 relative overflow-hidden group border border-foreground/5"
                    >
                        <div
                            className="p-10 text-foreground relative z-10 overflow-hidden min-h-[300px] flex flex-col justify-between"
                            style={{ background: `linear-gradient(135deg, var(--kasa-card-bg), var(--kasa-bg))` }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">{t('authorizedCard', lang)}</p>
                                    <h3 className="text-3xl font-black tracking-tighter uppercase">{card.name}</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => startEditing(card)}
                                        className="p-3 bg-foreground/5 hover:bg-primary/20 rounded-xl backdrop-blur-md transition-all active:scale-90 border border-foreground/10"
                                        title={t('editCard', lang)}
                                    >
                                        <Edit2 size={18} className="text-foreground/40 group-hover:text-primary" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(card.id)}
                                        className="p-3 bg-foreground/5 hover:bg-rose-500/20 rounded-xl backdrop-blur-md transition-all active:scale-90 border border-foreground/10"
                                    >
                                        <Trash2 size={18} className="text-foreground/40 group-hover:text-rose-500" />
                                    </button>
                                    <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center border border-foreground/10">
                                        <CardIcon size={24} className="text-foreground/20" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-2">{t('currentBalance', lang)}</p>
                                    <p className="text-4xl font-black tracking-tighter">₺{card.balance.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-2">{t('availableLimit', lang)}</p>
                                    <p className="text-4xl font-black tracking-tighter text-primary">₺{(card.card_limit - card.balance).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-8 mt-4 border-t border-foreground/5">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-foreground/20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{t('closingCycle', lang)}: <span className="text-foreground">{card.closing_day}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Bell size={14} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t('settlementDate', lang)}: {card.due_day}{lang === 'tr' ? '' : 'TH'}</span>
                                </div>
                            </div>

                            <div 
                                className="absolute right-[-40px] bottom-[-40px] opacity-10 blur-2xl"
                                style={{ color: card.color || '#ffd21f' }}
                            >
                                <CardIcon size={240} fill="currentColor" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsAdding(false);
                                setEditingCard(null);
                                setNewCard({ name: '', card_limit: '', balance: '', closing_day: '15', due_day: '25', color: '#ffd21f' });
                            }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg obsidian-card !p-12 border border-foreground/10"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
                                    {editingCard ? t('updateIssuance', lang) : t('financialIssuance', lang)}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingCard(null);
                                        setNewCard({ name: '', card_limit: '', balance: '', closing_day: '15', due_day: '25', color: '#ffd21f' });
                                    }} 
                                    className="text-foreground/20 hover:text-foreground transition-colors"
                                >
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <input
                                    type="text"
                                    placeholder={t('cardIdentifier', lang)}
                                    className="w-full h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all uppercase tracking-widest"
                                    value={newCard.name}
                                    onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder={t('creditLimit', lang)}
                                        className="h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all uppercase tracking-widest"
                                        value={newCard.card_limit}
                                        onChange={e => setNewCard({ ...newCard, card_limit: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder={t('currentDebt', lang)}
                                        className="h-16 px-8 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all uppercase tracking-widest"
                                        value={newCard.balance}
                                        onChange={e => setNewCard({ ...newCard, balance: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-foreground/20 px-2 tracking-widest">{t('closingCycle', lang)}</p>
                                        <input
                                            type="number"
                                            className="w-full h-12 px-6 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground focus:outline-none focus:border-primary/50 transition-all"
                                            value={newCard.closing_day}
                                            onChange={e => setNewCard({ ...newCard, closing_day: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-foreground/20 px-2 tracking-widest">{t('settlementDate', lang)}</p>
                                        <input
                                            type="number"
                                            className="w-full h-12 px-6 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold text-foreground focus:outline-none focus:border-primary/50 transition-all"
                                            value={newCard.due_day}
                                            onChange={e => setNewCard({ ...newCard, due_day: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAdd}
                                    className="w-full h-16 bg-primary text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {editingCard ? t('reAuthorizeIssuance', lang) : t('authorizeIssuance', lang)}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
