"use client";

import { useEffect, useState } from "react";
import { WeatherWidget } from "@/components/weather-widget";
import { DailyTasksWidget } from "@/components/daily-tasks-widget";

const SLIDES = [
  "/images/slide-1.png",
  "/images/slide-2.png",
  "/images/slide-3.png",
  "/images/slide-4.png",
  "/images/slide-5.png",
];

const SLIDE_DURATION = 9000; // 9 seconds

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-[calc(100vh-2rem)] items-center justify-center">
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200/40 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transform-gpu bg-contain bg-center bg-no-repeat transition-opacity duration-1000 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url('${src}')`,
            }}
          />
        ))}

        <div className="pointer-events-none absolute inset-0 bg-black/10" />

        {/* Widgets Overlay */}
        <div className="absolute inset-0 p-8 pointer-events-none">
            <div className="pointer-events-auto h-full w-full relative flex flex-col items-end gap-6 overflow-y-auto pr-2">
                {/* Weather Widget Top Right */}
                <div className="w-[22rem] shrink-0">
                    <WeatherWidget />
                </div>
                
                {/* Daily Tasks Widget Bottom Right */}
                <div className="w-[22rem] h-[28rem] shrink-0">
                    <DailyTasksWidget />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
