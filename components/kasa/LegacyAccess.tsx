import * as React from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Shield,
    Heart,
    Lock,
    UserPlus,
    Mail,
    ChevronRight,
    Smartphone,
    Database,
    Bell,
    ShieldCheck,
    Key
} from 'lucide-react';
import { cn } from './lib/utils';

import { t, Lang } from './services/i18nService';

interface LegacyAccessProps {
    lang: Lang;
}

export default function LegacyAccess({ lang }: LegacyAccessProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12 pb-12"
        >
            <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mb-2">{t('continuityProtocols', lang)}</p>
                    <h2 className="text-4xl font-black tracking-tight text-foreground leading-none">{t('legacyAccess', lang)}</h2>
                </div>
                <span className="px-4 py-1.5 rounded-full border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 flex items-center gap-2">
                    <ShieldCheck size={12} /> {t('secureVault', lang)}
                </span>
            </div>

            <div className="obsidian-card !p-12 relative overflow-hidden group border-l-4 border-rose-500/50">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center gap-3">
                             <Heart size={24} className="text-rose-500" />
                             <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">{t('digitalMirasProtocolX', lang)}</p>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">
                            {t('whoInheritsTitle', lang)}
                        </h1>
                        <p className="text-sm font-medium leading-relaxed text-foreground/40">
                             {t('legacyDescription', lang)}
                        </p>
                    </div>
                </div>
                <div className="absolute right-[-20px] top-[-20px] text-white/5 pointer-events-none group-hover:text-primary/10 transition-colors">
                    <Shield size={220} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                     <div className="obsidian-card !p-8 flex items-center justify-between group cursor-pointer hover:border-primary transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{t('designateHeir', lang)}</h3>
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">{t('noBeneficiaryAssigned', lang)}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-white/20" />
                     </div>

                     <div className="obsidian-card !p-8">
                        <div className="flex items-center justify-between mb-8">
                             <div>
                                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">{t('accessPermissions', lang)}</h3>
                                <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{t('encryptionLevel4', lang)}</p>
                             </div>
                             <Lock size={16} className="text-white/20" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: t('balanceLedger', lang), icon: <Database />, active: true },
                                { label: t('transactionHistory', lang), icon: <Smartphone />, active: true },
                                { label: t('documentCrypt', lang), icon: <Shield />, active: false },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-white/20 group-hover:text-primary transition-colors">{React.cloneElement(item.icon as any, { size: 18 })}</div>
                                        <span className="text-sm font-black text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</span>
                                    </div>
                                    <div className={cn(
                                        "w-12 h-6 rounded-full transition-all relative cursor-pointer border",
                                        item.active ? "bg-primary border-primary" : "bg-white/5 border-white/10"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 w-3.5 h-3.5 rounded-full transition-all",
                                            item.active ? "right-1 bg-black" : "left-1 bg-white/20"
                                        )} />
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>

                <div className="space-y-8">
                    <div className="obsidian-card !p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Bell size={18} className="text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">{t('inactivityTrigger', lang)}</h3>
                        </div>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">{t('timeoutThreshold', lang)}</p>
                        <div className="grid grid-cols-1 gap-4">
                             {[`3 ${t('months', lang)}`, `6 ${t('months', lang)}`, `12 ${t('months', lang)}`].map((opt, i) => (
                                 <button 
                                    key={i}
                                    className={cn(
                                        "w-full h-14 px-8 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-between group",
                                        i === 1 ? "bg-primary border-primary text-black" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                    )}
                                 >
                                     {opt}
                                     {i === 1 && <Key size={14} />}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <button className="w-full py-6 obsidian-card !bg-primary !text-black rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        {t('initializeProtocol', lang)} <ChevronRight className="inline ml-2" size={16} />
                    </button>
                    
                    <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-[0.30em]">
                        {t('secureAesTransition', lang)}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
