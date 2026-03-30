"use client";

// Rebuild timestamp: 2026-03-26 23:15
import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

type WeatherData = {
    temperature: number;
    weathercode: number;
    is_day: number;
};

const CITIES = [
    { name: "İstanbul", lat: 41.0082, lon: 28.9784 },
    { name: "Ankara", lat: 39.9334, lon: 32.8597 },
    { name: "İzmir", lat: 38.4127, lon: 27.1384 },
    { name: "Bursa", lat: 40.1828, lon: 29.0667 },
    { name: "Antalya", lat: 36.8969, lon: 30.7133 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "New York", lat: 40.7128, lon: -74.0060 },
];

function SunnyIcon() {
    return (
        <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-32 h-32 flex items-center justify-center shrink-0"
        >
            <div className="w-24 h-24 rounded-full bg-[#EB5757]" />
        </motion.div>
    );
}

function CloudyIcon() {
    return (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-32 h-32 flex items-center justify-center shrink-0"
        >
            <div className="absolute w-16 h-16 rounded-full bg-[#824C4C] -translate-x-6 translate-y-2" />
            <div className="absolute w-20 h-20 rounded-full bg-[#824C4C] translate-x-4" />
            <div className="absolute w-14 h-14 rounded-full bg-[#824C4C] -translate-x-2 -translate-y-6" />
        </motion.div>
    );
}

function RainIcon() {
    return (
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-32 h-32 flex flex-col items-center justify-center gap-2 shrink-0"
        >
            <div className="w-8 h-12 rounded-full bg-[#33A1FF] rotate-[15deg] -translate-x-4" />
            <div className="w-8 h-12 rounded-full bg-[#33A1FF] rotate-[15deg] translate-x-4 -translate-y-4" />
            <div className="w-8 h-12 rounded-full bg-[#33A1FF] rotate-[15deg] -translate-y-2" />
        </motion.div>
    );
}

function StormIcon() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-32 h-32 flex items-center justify-center shrink-0"
        >
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#EB5757]">
                <path
                    d="M60 10 L30 50 L70 50 L40 90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </motion.div>
    );
}

function WindIcon() {
    return (
        <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative w-32 h-32 flex flex-col items-center justify-center gap-4 shrink-0"
        >
            <div className="w-24 h-1 rounded-full bg-[#F2C94C] -translate-x-2" />
            <div className="w-24 h-1 rounded-full bg-[#F2C94C] translate-x-2" />
            <div className="w-20 h-1 rounded-full bg-[#F2C94C] -translate-x-4" />
        </motion.div>
    );
}

function SnowIcon() {
    return (
        <motion.div 
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="relative w-32 h-32 flex items-center justify-center shrink-0"
        >
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#56CCF2]">
                <path d="M50 10 V90 M10 50 H90 M20 20 L80 80 M80 20 L20 80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
            </svg>
        </motion.div>
    );
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState(CITIES[0]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const fetchWeather = async (retries = 2) => {
            if (!isMounted) return;
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current_weather=true&timezone=auto`,
                    { signal: controller.signal }
                );
                
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                
                const data = await res.json();
                if (isMounted) {
                    setWeather(data.current_weather);
                    setError(null);
                }
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                
                if (retries > 0) {
                    setTimeout(() => fetchWeather(retries - 1), 2000);
                } else if (isMounted) {
                    setError("Bağlantı Hatası");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchWeather();
        const interval = setInterval(() => fetchWeather(1), 30 * 60 * 1000);
        
        return () => {
            isMounted = false;
            controller.abort();
            clearInterval(interval);
        };
    }, [selectedCity]);

    function getWeatherIcon(code: number) {
        switch (true) {
            case code === 0: return <SunnyIcon />;
            case code === 1 || code === 2 || code === 3: return <CloudyIcon />;
            case code >= 51 && code <= 67: return <RainIcon />;
            case code >= 71 && code <= 77: return <SnowIcon />;
            case code >= 80 && code <= 82: return <RainIcon />;
            case code >= 95 && code <= 99: return <StormIcon />;
            default: return <CloudyIcon />;
        }
    }

    function getWeatherName(code: number) {
        switch (true) {
            case code === 0: return "SUNNY";
            case code === 1 || code === 2: return "CLOUDY";
            case code === 3: return "CLOUDY";
            case code >= 61 && code <= 67: return "RAIN";
            case code >= 71 && code <= 77: return "SNOWY";
            case code >= 80 && code <= 82: return "RAIN";
            case code >= 95 && code <= 99: return "STORMY";
            default: return "CLOUDY";
        }
    }

    function getWeatherDesc(code: number) {
        switch (true) {
            case code === 0: return "Açık";
            case code === 1 || code === 2: return "Parçalı Bulutlu";
            case code === 3: return "Kapalı";
            case code >= 45 && code <= 48: return "Sisli";
            case code >= 51 && code <= 57: return "Çisenti";
            case code >= 61 && code <= 67: return "Yağmurlu";
            case code >= 71 && code <= 77: return "Kar Yağışlı";
            case code >= 80 && code <= 82: return "Sağanak Yağış";
            case code >= 85 && code <= 86: return "Kar Sağanağı";
            case code >= 95 && code <= 99: return "Gök Gürültülü Fırtına";
            default: return "Bilinmiyor";
        }
    }

    return (
        <div className="relative flex flex-col justify-between rounded-[2rem] bg-[#E8E4D9] dark:bg-[#1A1A1A] p-8 shadow-2xl border border-black/5 dark:border-white/5 text-[#1A1A1A] dark:text-[#E8E4D9] overflow-hidden w-full h-full transition-all duration-700 min-h-[320px]">
            {/* Vertical Theme Label */}
            {!loading && weather && (
                <div className="absolute right-4 top-1/2 -rotate-90 origin-right translate-y-[-50%] pointer-events-none">
                    <span className="text-3xl font-black tracking-[0.2em] opacity-10 uppercase transition-all duration-700">
                        {getWeatherName(weather.weathercode)}
                    </span>
                </div>
            )}

            <div className="z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="relative group/select">
                            <select 
                                value={selectedCity.name}
                                onChange={(e) => {
                                    const city = CITIES.find(c => c.name === e.target.value);
                                    if (city) setSelectedCity(city);
                                }}
                                className="text-xl font-black bg-transparent outline-none cursor-pointer appearance-none pr-8 hover:opacity-70 transition-opacity"
                            >
                                {CITIES.map(city => (
                                    <option key={city.name} value={city.name} className="bg-[#E8E4D9] dark:bg-[#1A1A1A] text-current font-black">
                                        {city.name.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-0 top-1.5 pointer-events-none opacity-40" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Weather Protocol • {format(new Date(), 'dd MMM')}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={weather?.weathercode}
                            className="w-full flex justify-center"
                        >
                            {!loading && weather && getWeatherIcon(weather.weathercode)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="z-10 mt-auto flex items-end justify-between">
                <div className="flex flex-col">
                    {loading || !weather ? (
                        <div className="animate-pulse h-16 w-24 bg-black/5 dark:bg-white/5 rounded-2xl" />
                    ) : (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-start"
                        >
                            <span className="text-[80px] leading-[0.8] font-black tracking-tighter">
                                {Math.round(weather.temperature)}
                            </span>
                            <span className="text-2xl font-black mt-1">°</span>
                        </motion.div>
                    )}
                    <div className="mt-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                            {error ? "CONNECTION_ERROR" : (weather ? getWeatherDesc(weather.weathercode).toUpperCase() : "SYNCING...")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] pattern-grid" />
        </div>
    );
}
