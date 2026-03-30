"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type AnatomyPart = {
    id: string;
    name: string;
    category: "exterior" | "internal";
};

const EXTERIOR_PARTS = [
    { id: "head", name: "Baş & Boyun" },
    { id: "chest", name: "Göğüs (Toraks)" },
    { id: "abdomen", name: "Karın (Batın)" },
    { id: "pelvis", name: "Pelvis" },
    { id: "left-arm", name: "Sol Kol" },
    { id: "right-arm", name: "Sağ Kol" },
    { id: "left-leg", name: "Sol Bacak" },
    { id: "right-leg", name: "Sağ Bacak" },
];

const INTERNAL_PARTS = [
    { id: "brain", name: "Beyin" },
    { id: "lungs", name: "Akciğerler" },
    { id: "heart", name: "Kalp" },
    { id: "liver", name: "Karaciğer" },
    { id: "stomach", name: "Mide" },
    { id: "intestines", name: "Bağırsaklar" },
    { id: "kidneys", name: "Böbrekler" },
];

const PATHS = {
    exterior: {
        head: "M 100 15 C 114 15 119 28 116 42 C 114 48 108 55 106 60 L 108 65 L 92 65 L 94 60 C 92 55 86 48 84 42 C 81 28 86 15 100 15 Z",
        chest: "M 92 65 L 108 65 C 120 65 132 72 138 80 L 132 112 C 130 125 128 132 126 140 L 74 140 C 72 132 70 125 68 112 L 62 80 C 68 72 80 65 92 65 Z",
        abdomen: "M 74 140 L 126 140 C 124 165 125 185 118 200 L 82 200 C 75 185 76 165 74 140 Z",
        pelvis: "M 82 200 L 118 200 C 125 215 125 228 120 235 L 100 242 L 80 235 C 75 228 75 215 82 200 Z",
        leftArm: "M 62 80 C 56 80 52 83 50 88 C 44 110 38 150 34 175 C 32 185 44 185 46 175 C 52 155 60 125 68 112 L 62 80 Z",
        rightArm: "M 138 80 C 144 80 148 83 150 88 C 156 110 162 150 166 175 C 168 185 156 185 154 175 C 148 155 140 125 132 112 L 138 80 Z",
        leftLeg: "M 80 235 C 70 280 72 340 74 385 C 75 395 89 395 91 385 C 93 340 95 280 100 242 Z",
        rightLeg: "M 120 235 C 130 280 128 340 126 385 C 125 395 111 395 109 385 C 107 340 105 280 100 242 Z",
    },
    internal: {
        brain: "M 100,20 C 118,20 122,30 118,42 C 114,50 106,50 100,48 C 94,50 86,50 82,42 C 78,30 82,20 100,20 Z",
        lungsLeft: "M 90,72 C 74,68 62,88 64,116 C 66,138 78,142 88,138 C 94,136 96,120 94,110 C 90,96 92,82 90,72 Z",
        lungsRight: "M 110,72 C 126,68 138,88 136,116 C 134,138 122,142 112,138 C 106,136 104,120 106,110 C 110,96 108,82 110,72 Z",
        heart: "M 102,96 C 112,92 118,102 112,112 L 102,126 L 90,114 C 84,106 88,94 98,98 C 100,99 101,99 102,96 Z",
        liver: "M 64,138 C 84,128 112,132 122,142 C 124,148 112,152 98,154 C 76,156 60,152 64,138 Z",
        stomach: "M 102,142 C 114,134 132,136 136,146 C 140,158 118,162 106,158 C 96,154 94,146 102,142 Z",
        kidneysLeft: "M 72,164 C 82,156 88,168 82,178 C 76,188 66,182 72,164 Z",
        kidneysRight: "M 128,164 C 118,156 112,168 118,178 C 124,188 134,182 128,164 Z",
        intestinesOuter: "M 72,176 C 88,168 112,168 128,176 C 136,192 132,212 118,220 C 100,228 80,224 68,208 C 62,192 68,180 72,176 Z",
        intestinesInner: "M 78,186 C 92,180 108,180 120,186 C 126,198 122,210 110,214 C 94,220 82,216 74,204 C 70,196 74,188 78,186 Z",
    }
};

interface InteractiveAnatomyProps {
    selectedPart: AnatomyPart | null;
    onSelect: (part: AnatomyPart) => void;
}

export function InteractiveAnatomy({ selectedPart, onSelect }: InteractiveAnatomyProps) {
    const [view, setView] = useState<"exterior" | "internal">("exterior");

    const handleSelect = (id: string, name: string, category: "exterior" | "internal") => {
        onSelect({ id, name, category });
    };

    const isSelected = (id: string, category: string) => {
        return selectedPart?.id === id && selectedPart?.category === category;
    };

    const getGroupClass = (id: string, category: "exterior" | "internal") => {
        const selected = isSelected(id, category);
        if (category === "exterior") {
            return cn(
                "cursor-pointer outline-none transition-all duration-300 ease-out",
                selected
                    ? "brightness-[1.5] saturate-0 drop-shadow-[0_0_20px_rgba(255,85,69,0.8)] z-10 relative"
                    : "hover:brightness-[1.2] hover:saturate-0 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] z-0 opacity-40 hover:opacity-100 grayscale"
            );
        }
        return cn(
            "cursor-pointer transition-all duration-300 ease-in-out",
            selected
                ? "fill-terminal-error/90 stroke-white stroke-[4] drop-shadow-[0_0_15px_rgba(255,85,69,0.5)] z-10 relative"
                : "fill-neutral-800/80 stroke-neutral-700 stroke-[2] hover:fill-terminal-error/50 grayscale"
        );
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
                <button
                    type="button"
                    onClick={() => setView("exterior")}
                    className={cn(
                        "rounded-full px-4 py-1.5 transition",
                        view === "exterior"
                            ? "bg-primary text-primary-foreground shadow-sm dark:bg-primary dark:text-primary-foreground"
                            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                    )}
                >
                    Kas Sistemi (Dış)
                </button>
                <button
                    type="button"
                    onClick={() => setView("internal")}
                    className={cn(
                        "rounded-full px-4 py-1.5 transition",
                        view === "internal"
                            ? "bg-primary text-primary-foreground shadow-sm dark:bg-primary dark:text-primary-foreground"
                            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                    )}
                >
                    İç Organlar
                </button>
            </div>

            <div className={cn(
                "relative mx-auto w-full",
                view === "exterior" ? "h-[640px] max-w-sm rounded-none overflow-hidden bg-terminal-bg shadow-2xl p-4 flex items-center justify-center border border-terminal-surface-high" : "h-[480px] max-w-[250px]"
            )}>
                {view === "exterior" ? (
                    <svg viewBox="0 0 500 1000" className="h-full w-full filter hover:drop-shadow-lg">
                        <defs>
                            <radialGradient id="muscleCore" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#444" />
                                <stop offset="60%" stopColor="#222" />
                                <stop offset="100%" stopColor="#111" />
                            </radialGradient>
                            <linearGradient id="muscleGradLinear" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#333" />
                                <stop offset="45%" stopColor="#222" />
                                <stop offset="100%" stopColor="#111" />
                            </linearGradient>
                            <linearGradient id="tendonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#666" />
                                <stop offset="100%" stopColor="#333" />
                            </linearGradient>
                        </defs>

                        {/* Head & Neck */}
                        <g className={getGroupClass("head", "exterior")} style={{ transformBox: "fill-box", transformOrigin: "center" }} onClick={() => handleSelect("head", "Baş & Boyun", "exterior")}>
                            <path d="M 250 40 C 290 40 300 80 295 120 C 290 140 270 155 250 160 C 230 155 210 140 205 120 C 200 80 210 40 250 40 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                            <path d="M 220 130 C 230 160 270 160 280 130 C 270 145 230 145 220 130 Z" fill="url(#tendonGrad)" />
                            <path d="M 215 150 L 215 190 C 215 200 285 200 285 190 L 285 150 C 270 160 230 160 215 150 Z" fill="url(#muscleGradLinear)" stroke="rgba(255,255,255,0.1)" />
                            <path d="M 215 180 L 140 220 C 180 230 320 230 360 220 L 285 180 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                        </g>

                        {/* Chest (Pectoralis) */}
                        <g className={getGroupClass("chest", "exterior")} style={{ transformBox: "fill-box", transformOrigin: "center" }} onClick={() => handleSelect("chest", "Göğüs (Toraks)", "exterior")}>
                            <path d="M 248 210 L 160 220 C 150 250 155 290 175 315 C 200 330 230 315 248 305 Z" fill="url(#muscleGradLinear)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                            <path d="M 252 210 L 340 220 C 350 250 345 290 325 315 C 300 330 270 315 252 305 Z" fill="url(#muscleGradLinear)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                            <path d="M 248 210 L 252 210 L 252 305 L 248 305 Z" fill="url(#tendonGrad)" />
                            <path d="M 170 240 C 200 245 230 240 245 235" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                            <path d="M 330 240 C 300 245 270 240 255 235" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                        </g>

                        {/* Abdomen (Six-Pack) */}
                        <g className={getGroupClass("abdomen", "exterior")} style={{ transformBox: "fill-box", transformOrigin: "center" }} onClick={() => handleSelect("abdomen", "Karın (Batın)", "exterior")}>
                            <path d="M 175 315 C 200 330 230 315 248 305 L 252 305 C 270 315 300 330 325 315 C 340 380 350 450 320 493 C 260 540 240 540 250 540 C 240 540 190 530 180 493 C 150 450 160 380 175 315 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 248 305 L 252 305 L 252 495 L 248 495 Z" fill="url(#tendonGrad)" />
                            <path d="M 195 350 C 185 410 195 470 215 500" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <path d="M 305 350 C 315 410 305 470 285 500" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <path d="M 185 380 Q 215 390 248 385" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <path d="M 315 380 Q 285 390 252 385" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <path d="M 182 430 Q 215 440 248 435" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <path d="M 318 430 Q 285 440 252 435" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                        </g>

                        {/* Pelvis / Kasık */}
                        <g className={getGroupClass("pelvis", "exterior")} style={{ transformBox: "fill-box", transformOrigin: "center" }} onClick={() => handleSelect("pelvis", "Pelvis", "exterior")}>
                            <path d="M 180 493 C 190 530 240 540 250 540 C 260 540 310 530 320 493 C 290 522 210 522 180 493 Z" fill="url(#tendonGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                            <path d="M 215 505 C 190 540 180 570 190 590 C 210 580 245 545 250 540 Z" fill="url(#muscleGradLinear)" />
                            <path d="M 285 505 C 310 540 320 570 310 590 C 290 580 255 545 250 540 Z" fill="url(#muscleGradLinear)" />
                        </g>

                        {/* Left Arm (Patient Right Arm) */}
                        <g className={getGroupClass("right-arm", "exterior")} style={{ transformBox: "fill-box", transformOrigin: "center" }} onClick={() => handleSelect("right-arm", "Sağ Kol", "exterior")}>
                            <path d="M 140 170 C 110 170 100 200 115 230 C 130 240 152 230 160 220 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 115 230 C 85 270 95 330 110 350 C 125 355 140 345 155 300 C 158 260 130 240 115 230 Z" fill="url(#muscleGradLinear)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 110 350 C 80 420 70 480 85 500 C 100 505 120 490 125 430 C 130 380 125 350 110 350 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 85 500 C 75 530 85 560 95 560 C 105 560 115 530 110 500 Z" fill="url(#tendonGrad)" />
                        </g>

                        {/* Right Arm (Patient Left Arm) */}
                        <g className={getGroupClass("left-arm", "exterior")} style={{ transformBox: "fill-box", transformOrigin: "center" }} onClick={() => handleSelect("left-arm", "Sol Kol", "exterior")}>
                            <path d="M 360 170 C 390 170 400 200 385 230 C 370 240 348 230 340 220 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 385 230 C 415 270 405 330 390 350 C 375 355 360 345 345 300 C 342 260 370 240 385 230 Z" fill="url(#muscleGradLinear)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 390 350 C 420 420 430 480 415 500 C 400 505 380 490 375 430 C 370 380 375 350 390 350 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 415 500 C 425 530 415 560 405 560 C 395 560 385 530 390 500 Z" fill="url(#tendonGrad)" />
                        </g>

                        {/* Left Leg (Patient Right Leg) */}
                        <g className={getGroupClass("right-leg", "exterior")} style={{ transformBox: "fill-box", transformOrigin: "center" }} onClick={() => handleSelect("right-leg", "Sağ Bacak", "exterior")}>
                            <path d="M 180 493 C 195 515 220 530 250 540 C 230 560 210 670 195 720 L 160 720 C 140 680 130 560 180 493 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <circle cx="178" cy="735" r="15" fill="url(#tendonGrad)" />
                            <path d="M 160 720 L 195 720 L 190 750 L 165 750 Z" fill="url(#tendonGrad)" opacity="0.8" />
                            <path d="M 165 750 C 135 810 145 900 160 930 C 175 935 185 930 190 900 C 195 860 195 780 190 750 Z" fill="url(#muscleGradLinear)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 160 930 C 140 950 140 970 165 970 L 185 970 C 190 950 190 930 190 900 Z" fill="url(#tendonGrad)" />
                        </g>

                        {/* Right Leg (Patient Left Leg) */}
                        <g className={getGroupClass("left-leg", "exterior")} style={{ transformBox: "fill-box", transformOrigin: "center" }} onClick={() => handleSelect("left-leg", "Sol Bacak", "exterior")}>
                            <path d="M 320 493 C 305 515 280 530 250 540 C 270 560 290 670 305 720 L 340 720 C 360 680 370 560 320 493 Z" fill="url(#muscleCore)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <circle cx="322" cy="735" r="15" fill="url(#tendonGrad)" />
                            <path d="M 340 720 L 305 720 L 310 750 L 335 750 Z" fill="url(#tendonGrad)" opacity="0.8" />
                            <path d="M 335 750 C 365 810 355 900 340 930 C 325 935 315 930 310 900 C 305 860 305 780 310 750 Z" fill="url(#muscleGradLinear)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                            <path d="M 340 930 C 360 950 360 970 335 970 L 315 970 C 310 950 310 930 310 900 Z" fill="url(#tendonGrad)" />
                        </g>
                    </svg>
                ) : (
                    <svg viewBox="0 0 500 1000" className="h-full w-full filter drop-shadow-sm mx-auto">
                        {/* Ghost Silhouette (Uses exactly the same paths but filled with translucent gray) */}
                        <g className="fill-neutral-500/10 stroke-neutral-500/20 pointer-events-none stroke-[1]" strokeLinecap="round" strokeLinejoin="round">
                            {/* Head & Chest mapped to pure path without gradients for interior ghost */}
                            <path d="M 250 40 C 290 40 300 80 295 120 C 290 140 270 155 250 160 C 230 155 210 140 205 120 C 200 80 210 40 250 40 Z" />
                            <path d="M 248 210 L 160 220 C 150 250 155 290 175 315 C 200 330 230 315 248 305 Z" />
                            <path d="M 252 210 L 340 220 C 350 250 345 290 325 315 C 300 330 270 315 252 305 Z" />
                            <path d="M 175 315 C 200 330 230 315 248 305 L 252 305 C 270 315 300 330 325 315 C 340 380 350 450 320 493 C 260 540 240 540 250 540 C 240 540 190 530 180 493 C 150 450 160 380 175 315 Z" />
                            <path d="M 180 493 C 190 530 240 540 250 540 C 260 540 310 530 320 493 C 290 522 210 522 180 493 Z" />
                            <path d="M 140 170 C 110 170 100 200 115 230 C 130 240 152 230 160 220 Z" />
                            <path d="M 115 230 C 85 270 95 330 110 350 C 125 355 140 345 155 300 C 158 260 130 240 115 230 Z" />
                            <path d="M 110 350 C 80 420 70 480 85 500 C 100 505 120 490 125 430 C 130 380 125 350 110 350 Z" />
                            <path d="M 360 170 C 390 170 400 200 385 230 C 370 240 348 230 340 220 Z" />
                            <path d="M 385 230 C 415 270 405 330 390 350 C 375 355 360 345 345 300 C 342 260 370 240 385 230 Z" />
                            <path d="M 390 350 C 420 420 430 480 415 500 C 400 505 380 490 375 430 C 370 380 375 350 390 350 Z" />
                            <path d="M 180 493 C 195 515 220 530 250 540 C 230 560 210 670 195 720 L 160 720 C 140 680 130 560 180 493 Z" />
                            <path d="M 165 750 C 135 810 145 900 160 930 C 175 935 185 930 190 900 C 195 860 195 780 190 750 Z" />
                            <path d="M 320 493 C 305 515 280 530 250 540 C 270 560 290 670 305 720 L 340 720 C 360 680 370 560 320 493 Z" />
                            <path d="M 335 750 C 365 810 355 900 340 930 C 325 935 315 930 310 900 C 305 860 305 780 310 750 Z" />
                        </g>

                        {/* Internal Organs Mapped inside the new 500x1000 Viewport (Scale exactly 2.5x to match the old 200x400 center 100 mappings) */}
                        <g transform="scale(2.5)">
                            {/* Brain */}
                            <path d={PATHS.internal.brain} className={getGroupClass("brain", "internal")} onClick={() => handleSelect("brain", "Beyin", "internal")} strokeLinecap="round" strokeLinejoin="round" />
    
                            {/* Lungs */}
                            <path d={PATHS.internal.lungsLeft} className={getGroupClass("lungs", "internal")} onClick={() => handleSelect("lungs", "Akciğerler", "internal")} strokeLinecap="round" strokeLinejoin="round" />
                            <path d={PATHS.internal.lungsRight} className={getGroupClass("lungs", "internal")} onClick={() => handleSelect("lungs", "Akciğerler", "internal")} strokeLinecap="round" strokeLinejoin="round" />
    
                            {/* Heart */}
                            <path d={PATHS.internal.heart} className={getGroupClass("heart", "internal")} onClick={() => handleSelect("heart", "Kalp", "internal")} strokeLinecap="round" strokeLinejoin="round" />
    
                            {/* Liver */}
                            <path d={PATHS.internal.liver} className={getGroupClass("liver", "internal")} onClick={() => handleSelect("liver", "Karaciğer", "internal")} strokeLinecap="round" strokeLinejoin="round" />
    
                            {/* Stomach */}
                            <path d={PATHS.internal.stomach} className={getGroupClass("stomach", "internal")} onClick={() => handleSelect("stomach", "Mide", "internal")} strokeLinecap="round" strokeLinejoin="round" />
    
                            {/* Kidneys */}
                            <path d={PATHS.internal.kidneysLeft} className={getGroupClass("kidneys", "internal")} onClick={() => handleSelect("kidneys", "Böbrekler", "internal")} strokeLinecap="round" strokeLinejoin="round" />
                            <path d={PATHS.internal.kidneysRight} className={getGroupClass("kidneys", "internal")} onClick={() => handleSelect("kidneys", "Böbrekler", "internal")} strokeLinecap="round" strokeLinejoin="round" />
    
                            {/* Intestines */}
                            <path d={PATHS.internal.intestinesOuter} className={getGroupClass("intestines", "internal")} onClick={() => handleSelect("intestines", "Bağırsaklar", "internal")} strokeLinecap="round" strokeLinejoin="round" />
                            <path d={PATHS.internal.intestinesInner} className={cn(getGroupClass("intestines", "internal"), "opacity-80")} onClick={() => handleSelect("intestines", "Bağırsaklar", "internal")} strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                )}
            </div>
        </div>
    );
}
