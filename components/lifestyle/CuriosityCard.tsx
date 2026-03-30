import React from "react";
import { ArrowRight, Compass, Eye, Sparkles, Globe, Beaker, Leaf, MapPin, CheckCircle2, Circle, Clock, Zap } from "lucide-react";
import { CuriosityData } from "./lib/curiosity-db";

interface CuriosityCardProps extends CuriosityData {
  onStatusToggle?: (id: string, newStatus: 'Wishlist' | 'Planned' | 'Achieved') => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  "Doğa": Leaf,
  "Bilim": Beaker,
  "Uzay": Globe,
  "Hayat": Compass,
  "Tarih": ArrowRight,
  "Rota": MapPin,
  "Etkinlik": Clock,
  "Hayal": Sparkles,
};

const STATUS_CONFIG = {
  Wishlist: { label: "Hayal", color: "text-amber-500", bgColor: "bg-amber-500/10", icon: Sparkles },
  Planned: { label: "Plan", color: "text-blue-500", bgColor: "bg-blue-500/10", icon: Clock },
  Achieved: { label: "Keşfedildi", color: "text-emerald-500", bgColor: "bg-emerald-500/10", icon: CheckCircle2 },
};

export const CuriosityCard = ({
  id,
  title,
  category,
  date,
  description,
  coverImage,
  didYouKnow,
  stats,
  status = 'Wishlist',
  location,
  targetDate,
  onStatusToggle,
  onDelete
}: CuriosityCardProps) => {
  const Icon = CATEGORY_ICONS[category] || Compass;
  const statusInfo = STATUS_CONFIG[status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`group relative break-inside-avoid mb-10 cursor-pointer transition-all duration-700 hover:-translate-y-2 ${status === 'Achieved' ? 'scale-100' : ''}`}>
      {/* Visual Container (Stitch-Level Glassmorphism) */}
      <div className={`relative overflow-hidden rounded-[2.5rem] bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border transition-all duration-700 ${
        status === 'Achieved' 
          ? 'shadow-[0_20px_50px_rgba(16,185,129,0.15)] border-emerald-500/30' 
          : 'border-neutral-200/50 dark:border-white/5 group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/20'
      }`}>
        {coverImage ? (
          <div className="relative overflow-hidden aspect-[4/5]">
            <img 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                src={coverImage} 
                alt={title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent opacity-60"></div>
          </div>
        ) : (
          <div className={`w-full aspect-[4/5] flex items-center justify-center p-12 bg-gradient-to-br transition-all duration-1000 ${
            status === 'Achieved' 
              ? 'from-emerald-400/10 via-teal-500/5 to-transparent' 
              : 'from-emerald-50 to-teal-100 dark:from-emerald-950/10 dark:to-teal-950/10'
          }`}>
             <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-700 relative ${
               status === 'Achieved' 
                ? 'bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]' 
                : 'bg-emerald-500/5 dark:bg-emerald-500/10 group-hover:scale-110'
             }`}>
                {status === 'Achieved' && (
                    <div className="absolute inset-0 rounded-[2rem] border-2 border-emerald-500/50 animate-ping opacity-40"></div>
                )}
                <Icon className={`w-12 h-12 transition-colors duration-700 ${status === 'Achieved' ? 'text-emerald-500' : 'text-emerald-600/60 dark:text-emerald-400/60'}`} />
             </div>
          </div>
        )}
        
        {/* Luminous Overlay for Achieved Items */}
        {status === 'Achieved' && (
            <div className="absolute inset-0 pointer-events-none bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]"></div>
        )}

        {/* Floating Badges (Premium Style) */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
            <span className="px-4 py-2 rounded-2xl bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 shadow-2xl">
                {category}
            </span>
            {location && (
                <span className="px-4 py-2 rounded-2xl bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 shadow-2xl flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {location}
                </span>
            )}
        </div>

        {/* Achievement Status Floating Glyph */}
        {status === 'Achieved' && (
            <div className="absolute top-6 right-6 z-20">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
        )}

        {/* Interactive Prompt (Stitch Style) */}
        {status !== 'Achieved' && (
            <div className="absolute inset-x-8 bottom-8 z-30 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                <button 
                  onClick={(e) => { e.stopPropagation(); onStatusToggle?.(id, 'Achieved'); }}
                  className="w-full py-4 bg-emerald-500 text-white rounded-3xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:bg-emerald-600 active:scale-95 transition-all"
                >
                    <Sparkles className="w-4 h-4" />
                    Keşfedildi Olarak İşaretle
                </button>
            </div>
        )}
      </div>

      {/* Narrative Content */}
      <div className="mt-8 px-6">
        <div className="flex items-center gap-3 mb-4">
            <div className={`h-[1px] flex-1 bg-gradient-to-r transition-all duration-1000 ${
                status === 'Achieved' ? 'from-emerald-500/50 to-transparent' : 'from-neutral-200 dark:from-neutral-800 to-transparent'
            }`}></div>
            <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${status === 'Achieved' ? 'text-emerald-500' : 'text-neutral-400'}`}>
                {statusInfo.label}
            </span>
        </div>
        
        <h3 className={`font-headline font-black text-xl lg:text-2xl leading-[1.15] tracking-tight transition-all duration-700 ${
          status === 'Achieved' 
            ? 'text-emerald-900 dark:text-emerald-100 drop-shadow-sm' 
            : 'text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-500'
        }`}>
          {title}
        </h3>
        
        {didYouKnow && (
            <div className={`mt-6 p-5 rounded-[2rem] border transition-all duration-1000 relative overflow-hidden ${
              status === 'Achieved' 
                ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[inset_0_2px_20px_rgba(16,185,129,0.05)]' 
                : 'bg-white dark:bg-neutral-900/50 border-neutral-100/50 dark:border-white/5'
            }`}>
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-current" />
                    Explorer Note
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-[1.6] tracking-tight">
                  {didYouKnow}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};
