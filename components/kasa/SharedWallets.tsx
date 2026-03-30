import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Share2, Wallet, UserPlus } from 'lucide-react';
import { t, Lang } from './services/i18nService';
import { Wallet as WalletType } from './types';
import { cn } from './lib/utils';
import { apiFetch } from './lib/api';

interface SharedWalletsProps {
    lang: Lang;
}

export default function SharedWallets({ lang }: SharedWalletsProps) {
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newWallet, setNewWallet] = useState({ name: '', currency: 'TRY' });

    const fetchWallets = async () => {
        const res = await apiFetch('/api/kasa/wallets');
        const data = await res.json();
        setWallets(data);
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleCreate = async () => {
        if (!newWallet.name) return;
        await apiFetch('/api/kasa/wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newWallet)
        });
        setIsAdding(false);
        setNewWallet({ name: '', currency: 'TRY' });
        fetchWallets();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{t('sharedWalletsTitle', lang)}</h2>
                    <p className="text-sm text-foreground/40 font-medium">{t('sharedWalletsSubtitle', lang)}</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {wallets.map((wallet, i) => (
                    <motion.div
                        key={wallet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="premium-card p-6 rounded-[2rem] flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">{wallet.name}</h3>
                                <div className="flex -space-x-2 mt-1">
                                    {[1, 2, 3].map(u => (
                                        <img
                                            key={u}
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u + wallet.id}`}
                                            className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800"
                                            alt="user"
                                        />
                                    ))}
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">
                                        +2
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-foreground text-lg">
                                {new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
                            </p>
                            <button
                                onClick={() => alert(t('inviteSentAlert', lang))}
                                className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1 ml-auto"
                            >
                                <UserPlus size={10} /> {t('inviteButton', lang)}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 sm:items-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                         <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-md bg-card rounded-[2.5rem] p-8 shadow-2xl border border-foreground/10"
                        >
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">{t('createWalletTitle', lang)}</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder={t('walletNamePlaceholder', lang)}
                                    className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold placeholder:text-slate-400"
                                    value={newWallet.name}
                                    onChange={e => setNewWallet({ ...newWallet, name: e.target.value })}
                                />
                                <button
                                    onClick={handleCreate}
                                    className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 mt-4"
                                >
                                    {t('createAndShareButton', lang)}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
