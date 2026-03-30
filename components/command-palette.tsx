"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Wallet, TrendingUp, Target, PiggyBank, Repeat, BarChart3, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: BarChart3,
      action: () => {
        router.push("/dashboard");
        setOpen(false);
      },
    },
    {
      id: "transactions",
      name: "İşlemler",
      icon: Wallet,
      action: () => {
        router.push("/transactions");
        setOpen(false);
      },
    },
    {
      id: "budget",
      name: "Bütçe",
      icon: Target,
      action: () => {
        router.push("/budget");
        setOpen(false);
      },
    },
    {
      id: "savings",
      name: "Birikimler",
      icon: PiggyBank,
      action: () => {
        router.push("/savings");
        setOpen(false);
      },
    },
    {
      id: "net-worth",
      name: "Net Değer",
      icon: TrendingUp,
      action: () => {
        router.push("/net-worth");
        setOpen(false);
      },
    },
    {
      id: "recurring",
      name: "Tekrarlayan İşlemler",
      icon: Repeat,
      action: () => {
        router.push("/recurring");
        setOpen(false);
      },
    },
    {
      id: "calendar",
      name: "Mali Takvim",
      icon: Calendar,
      action: () => {
        router.push("/calendar");
        setOpen(false);
      },
    },
    {
      id: "analytics",
      name: "Analitik",
      icon: BarChart3,
      action: () => {
        router.push("/analytics");
        setOpen(false);
      },
    },
  ];

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const query = search.toLowerCase();
    return commands.filter((cmd) =>
      cmd.name.toLowerCase().includes(query) ||
      cmd.id.toLowerCase().includes(query)
    );
  }, [search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-[600px]">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Komut Paleti</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sayfa ara... (⌘K)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto px-2 pb-4">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Sonuç bulunamadı
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon;
                return (
                  <div
                    key={command.id}
                    onClick={command.action}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer transition-colors",
                      index === selectedIndex
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{command.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
