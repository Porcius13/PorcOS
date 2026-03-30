import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { ChatMessage, getChatResponse } from './services/chatService';
import { Transaction, Summary } from './types';
import { cn } from './lib/utils';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { t, Lang } from './services/i18nService';

interface AIChatProps {
    transactions: Transaction[];
    summary: Summary;
    lang: Lang;
}

export default function AIChat({ transactions, summary, lang }: AIChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: t('aiWelcome', lang) }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const burnData = [
        { name: t('projected', lang), value: 4200, color: 'rgba(var(--foreground),0.1)' },
        { name: t('actual', lang), value: 3150, color: '#ffd21f' }
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        const response = await getChatResponse([...messages, userMsg], transactions, summary);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setIsLoading(false);
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
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mb-2">{t('intelligenceSuite', lang)}</p>
                    <h2 className="text-4xl font-black tracking-tight text-foreground leading-none">{t('zineAssistant', lang)}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                            />
                        ))}
                    </div>
                    <span className="px-4 py-1.5 rounded-full border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5">
                        {t('neuralInterfaceActive', lang)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Chat Window */}
                    <div className="obsidian-card !p-0 flex flex-col min-h-[500px] border-l-4 border-primary bg-bg">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar">
                            <AnimatePresence>
                                {messages.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "flex flex-col gap-2 max-w-[80%]",
                                            m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                        )}
                                    >
                                        <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{m.role === 'user' ? t('authUser', lang) : t('zineAi', lang)}</p>
                                        <div className={cn(
                                            "px-8 py-5 rounded-3xl text-sm font-bold leading-relaxed",
                                            m.role === 'user' 
                                                ? "bg-foreground text-bg" 
                                                : "bg-foreground/5 text-foreground border border-foreground/10"
                                        )}>
                                            {m.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Recurring Optimization Card embedded in chat flow or separate */}
                        <div className="px-12 pb-8">
                             <div className="obsidian-card !bg-foreground/5 border-dashed border-foreground/20 !p-8 flex justify-between items-center group cursor-pointer hover:border-primary transition-all">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck size={16} className="text-primary" />
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">{t('recurrentSubscriptionOptimization', lang)}</h3>
                                    </div>
                                    <p className="text-[10px] text-foreground/40 uppercase tracking-tighter">{t('protocolZ9', lang)}</p>
                                </div>
                                <button className="px-6 py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-110 transition-all flex items-center gap-2">
                                    {t('executeRule', lang)} <Zap size={12} fill="currentColor" />
                                </button>
                             </div>
                        </div>

                        <div className="p-8 border-t border-foreground/10">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={t('enterCommand', lang)}
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-full py-5 pl-8 pr-20 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-3 top-3 bottom-3 px-6 bg-primary text-black rounded-full text-[10px] font-black uppercase tracking-widest"
                                >
                                    {t('send', lang)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                     {/* Projected Burn Card */}
                     <div className="obsidian-card !p-8">
                        <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-8">{t('burnAnalysis', lang)}</p>
                        <div className="h-[200px] w-full mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={burnData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ display: 'none' }} />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                                        {burnData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{t('projectedBurn', lang)}</span>
                                <span className="text-sm font-black text-foreground">₺4,200</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('actualBurn', lang)}</span>
                                <span className="text-sm font-black text-primary">₺3,150</span>
                            </div>
                        </div>
                     </div>

                     <div className="obsidian-card !p-8 bg-primary text-black">
                         <div className="flex items-center gap-2 mb-4">
                             <TrendingUp size={20} />
                             <h4 className="text-sm font-black uppercase tracking-widest">{t('insightEngine', lang)}</h4>
                         </div>
                         <p className="text-xs font-bold leading-relaxed mb-6">
                             {t('insightRecommendation', lang)}
                         </p>
                         <button className="text-[9px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1">{t('viewReallocationPlan', lang)}</button>
                     </div>
                </div>
            </div>
        </motion.div>
    );
}
