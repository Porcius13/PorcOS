"use client";

import { useEffect, useState } from "react";
import { Compass, MapPin, Camera, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type NomadData = {
    lastLocation: string;
    date: string;
    imageUrl?: string;
    totalCountries: number;
};

export function NomadInsightWidget() {
    const [data, setData] = useState<NomadData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNomad() {
            try {
                // Mocking fetching from locations API
                const res = await fetch("/api/locations");
                if (res.ok) {
                    const locations = await res.json();
                    if (locations.length > 0) {
                        const last = locations[0];
                        setData({
                            lastLocation: last.name || "Bilinmeyen Durak",
                            date: last.date || "Şimdi",
                            imageUrl: last.images?.[0],
                            totalCountries: new Set(locations.map((l: any) => l.country)).size
                        });
                    }
                }
            } catch (error) {
                console.error("Nomad fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNomad();
    }, []);

    const displayData = data || {
        lastLocation: "Kapadokya, TR",
        date: "12 Nisan 2026",
        imageUrl: "/images/nomad-placeholder.jpg",
        totalCountries: 12
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative flex flex-col justify-between rounded-[2.5rem] bg-neutral-900/40 p-8 shadow-2xl backdrop-blur-3xl border border-white/5 overflow-hidden h-full glass-premium-hover"
        >
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-30 grayscale group-hover:grayscale-0"
                style={{ backgroundImage: `url('${displayData.imageUrl}')` }}
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="z-10 flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500/80 flex items-center gap-2">
                        <Compass className="w-4 h-4 animate-spin-slow" />
                        Nomad Günlüğü
                    </h3>
                </div>
                <Link 
                    href="/nomad"
                    className="p-2 rounded-full bg-white/10 hover:bg-emerald-500/20 text-white/40 hover:text-emerald-500 transition-all"
                >
                    <ArrowUpRight className="w-5 h-5" />
                </Link>
            </div>

            <div className="z-10 mt-auto">
                <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <p className="text-xl font-black text-white tracking-tighter">
                        {displayData.lastLocation}
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{displayData.date}</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Camera className="w-3 h-3 text-neutral-400" />
                        <span className="text-[10px] font-black text-white">{displayData.totalCountries} Ülke</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
