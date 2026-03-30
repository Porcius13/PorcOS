import * as React from 'react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Sparkles, X, Check, Loader2 } from 'lucide-react';
import { scanReceipt } from './services/ocrService';
import { t, Lang } from './services/i18nService';
import { cn } from './lib/utils';

interface OCRScannerProps {
    onResult: (data: any) => void;
    lang: Lang;
}

export default function OCRScanner({ onResult, lang }: OCRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setPreview(base64);
            setIsScanning(true);
            try {
                const result = await scanReceipt(base64, file.type);
                onResult(result);
                setPreview(null);
            } catch (error) {
                console.error("OCR Failed:", error);
                alert(t('ocrFailedAlert', lang));
            } finally {
                setIsScanning(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="group relative w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all outline-none"
            >
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Camera size={24} />
                </div>
                <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600 transition-colors">{t('scanReceiptTitle', lang)}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{t('scanReceiptSubtitle', lang)}</p>
                </div>

                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 rounded-[1.8rem] flex flex-col items-center justify-center gap-2"
                    >
                        <Loader2 size={24} className="text-indigo-600 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 animate-pulse">{t('aiAnalyzing', lang)}</p>
                    </motion.div>
                )}
            </button>

            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute -top-40 left-0 right-0 h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl z-50 p-2"
                    >
                        <img src={preview} alt="Receipt preview" className="w-full h-full object-cover rounded-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
