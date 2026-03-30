"use client";

import { Activity, ClipboardList, Microscope, Monitor, Pill, Info, ChevronRight } from "lucide-react";

interface TopicNode {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TOPIC_NODES: TopicNode[] = [
  { id: "01-sikayet", label: "01 ŞİKAYET", icon: <ClipboardList className="h-3 w-3" /> },
  { id: "02-fizik-muayene", label: "02 FİZİK MUAYENE", icon: <Activity className="h-3 w-3" /> },
  { id: "03-laboratuvar", label: "03 LABORATUVAR", icon: <Microscope className="h-3 w-3" /> },
  { id: "04-goruntuleme", label: "04 GÖRÜNTÜLEME", icon: <Monitor className="h-3 w-3" /> },
  { id: "05-acil-tedavi-plani", label: "05 ACİL TEDAVİ PLANI", icon: <Activity className="h-3 w-3" /> },
  { id: "06-recete", label: "06 REÇETE", icon: <Pill className="h-3 w-3" /> },
  { id: "07-hasta-egitimi", label: "07 HASTA EĞİTİMİ", icon: <Info className="h-3 w-3" /> },
  { id: "08-klinik-gorsel", label: "08 KLİNİK GÖRSEL", icon: <Monitor className="h-3 w-3" /> },
];

export function SmartTopicBlueprint() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6 font-label">
      <h3 className="text-[10px] font-black tracking-[0.3em] text-terminal-accent uppercase border-b border-terminal-accent/30 pb-4">
        SYSTM_TOPIC_BLUEPRINT
      </h3>
      <div className="space-y-1">
        {TOPIC_NODES.map((node) => (
          <button
            key={node.id}
            onClick={() => scrollTo(node.id)}
            className="w-full flex items-center justify-between group py-2 hover:translate-x-1 transition-all border-b border-terminal-surface-high/20 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-terminal-bg flex items-center justify-center text-neutral-400 group-hover:bg-terminal-accent group-hover:text-black transition-all">
                {node.icon}
              </div>
              <span className="text-[9px] font-bold text-neutral-500 dark:text-terminal-dim group-hover:text-neutral-900 dark:group-hover:text-white uppercase transition-colors">
                {node.label}
              </span>
            </div>
            <ChevronRight className="h-3 w-3 text-terminal-dim opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
      
      {/* Terminal Node Connection visual */}
      <div className="pt-4 flex items-center gap-1 opacity-20">
         <div className="h-1 w-1 rounded-full bg-terminal-accent" />
         <div className="h-[1px] flex-grow bg-terminal-accent" />
         <div className="h-1 w-1 rounded-full bg-terminal-accent" />
      </div>
    </div>
  );
}
