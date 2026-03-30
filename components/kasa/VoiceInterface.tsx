import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Sparkles, X, Check, Loader2 } from 'lucide-react';
import { cn } from './lib/utils';
import { t, Lang } from './services/i18nService';

interface VoiceInterfaceProps {
    onResult: (text: string) => void;
    onClose: () => void;
    lang: Lang;
}

export default function VoiceInterface({ onResult, onClose, lang }: VoiceInterfaceProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Support for Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang === 'tr' ? 'tr-TR' : 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const text = event.results[current][0].transcript;
            setTranscript(text);
        };
    }

    const toggleListening = () => {
        if (!recognition) {
            alert(t('speechNotSupported', lang));
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            setTranscript('');
            recognition.start();
        }
    };

    const handleConfirm = async () => {
        if (!transcript) return;
        setIsProcessing(true);
        // Simulate AI processing wait
        await new Promise(r => setTimeout(r, 1000));
        onResult(transcript);
        setIsProcessing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-32 z-[110] bg-card rounded-[2.5rem] shadow-2xl border border-foreground/10 p-8 overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <AnimatePresence>
                    {isListening && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="w-1/3 h-full bg-indigo-500"
                        />
                    )}
                </AnimatePresence>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center text-indigo-600">
                        <Mic size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{t('voiceCommandTitle', lang)}</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <X size={18} className="text-slate-400" />
                </button>
            </div>

            <div className="text-center space-y-6">
                <div className="min-h-[60px] flex items-center justify-center italic text-foreground/60 text-lg font-medium px-4 leading-tight">
                    {transcript || (isListening ? t('listening', lang) : t('voiceExample', lang))}
                </div>

                <div className="flex justify-center items-center gap-6">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleListening}
                        className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative",
                            isListening ? "bg-rose-500 shadow-rose-500/30 scale-110" : "bg-indigo-600 shadow-indigo-600/30"
                        )}
                    >
                        {isListening ? (
                            <div className="relative">
                                <MicOff size={32} className="text-white" />
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="absolute inset-0 bg-white rounded-full -z-10"
                                />
                            </div>
                        ) : (
                            <Mic size={32} className="text-white" />
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {transcript && !isListening && (
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onClick={handleConfirm}
                                disabled={isProcessing}
                                className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {isListening ? t('stopListening', lang) : t('startListening', lang)}
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center gap-3">
                <Sparkles size={14} className="text-indigo-400" />
                <p className="text-[9px] font-medium text-slate-400">
                    {t('voiceProviderNote', lang)}
                </p>
            </div>
        </motion.div>
    );
}
