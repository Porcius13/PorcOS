"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WeatherWidget } from "@/components/weather-widget";
import { DailyTasksWidget } from "@/components/daily-tasks-widget";
import { KasaSummaryWidget } from "@/components/dashboard/KasaSummaryWidget";
import { NomadInsightWidget } from "@/components/dashboard/NomadInsightWidget";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const SLIDES = [
  "/images/slide-1.png",
  "/images/slide-2.png",
  "/images/slide-3.png",
  "/images/slide-4.png",
  "/images/slide-5.png",
];

const SLIDE_DURATION = 12000;

export default function Home() {
  const [index, setIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const slideId = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION);

    const timeId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(slideId);
      clearInterval(timeId);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "Tünaydın";
    return "İyi Akşamlar";
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[3rem] border border-white/5 bg-neutral-950 shadow-2xl">
      {/* Dynamic Background Slideshow */}
      {SLIDES.map((src, i) => (
        <motion.div
          key={src}
          initial={false}
          animate={{ opacity: i === index ? 0.4 : 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale-[0.5]"
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}

      {/* Glass Overlay Texture */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-black/60 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 z-[2] opacity-10 pointer-events-none grain-overlay" />

      {/* Main Content Hub */}
      <div className="relative z-10 h-full w-full p-4 md:p-8 lg:p-12 flex flex-col gap-8 md:gap-12 overflow-y-auto no-scrollbar">
        
        {/* Welcome & Time Header */}
        <header className="flex flex-col md:flex-row items-baseline justify-between gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter flex items-center gap-2 md:gap-4 flex-wrap">
               <span>{getGreeting()},</span> <span className="text-primary text-glow-yellow">Kaptan</span>
            </h1>
            <p className="text-sm md:text-base font-bold text-neutral-400 uppercase tracking-[0.4em] mt-2">
              {format(currentTime, "EEEE, d MMMM", { locale: tr })}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-right"
          >
            <div className="text-5xl md:text-7xl font-black text-white/10 tracking-tighter tabular-nums leading-none">
              {format(currentTime, "HH:mm")}
            </div>
          </motion.div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-6 flex-1 min-h-0">
          
          {/* Weather - Top Left (Large square on md/lg) */}
          <div className="lg:col-span-1 lg:row-span-1 min-h-[300px]">
            <WeatherWidget />
          </div>

          {/* Kasa Insight - Financial status */}
          <div className="lg:col-span-1 lg:row-span-1 min-h-[300px]">
             <KasaSummaryWidget />
          </div>

          {/* Daily Tasks - Center-Right Vertical Span */}
          <div className="md:col-span-1 lg:col-span-1 lg:row-span-2 min-h-[400px]">
            <DailyTasksWidget />
          </div>

          {/* Nomad - Top Right Memory */}
          <div className="lg:col-span-1 lg:row-span-1 min-h-[300px]">
             <NomadInsightWidget />
          </div>

          {/* Bottom Row - Extra Space or Future Widgets */}
          <div className="lg:col-span-2 lg:row-span-1 flex items-center justify-center rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-sm p-8 text-white/20 group hover:border-primary/20 transition-all">
             <div className="text-center group-hover:text-primary/40 transition-all">
                <p className="text-xs font-black uppercase tracking-[0.5em] mb-2">System Status</p>
                <p className="text-2xl font-black tracking-tighter">BÜTÜN SİSTEMLER OPERASYONEL</p>
             </div>
          </div>
          
          {/* Quick Stats or Small Action Bar */}
          <div className="lg:col-span-1 lg:row-span-1 rounded-[2.5rem] bg-primary p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(255,210,31,0.2)]">
              <div className="text-black font-black leading-tight text-2xl tracking-tighter">
                Yeni bir gün, yeni hedefler.
              </div>
              <button className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                BUGÜNE BAŞLA
              </button>
          </div>

        </div>
      </div>
    </div>
  );
}
