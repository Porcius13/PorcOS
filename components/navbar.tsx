"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Wallet, LayoutDashboard, Receipt, CreditCard, PiggyBank, TrendingUp, Repeat, Calendar, BarChart3 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "İşlemler", icon: Receipt },
  { href: "/budget", label: "Bütçe", icon: CreditCard },
  { href: "/savings", label: "Birikimler", icon: PiggyBank },
  { href: "/net-worth", label: "Net Değer", icon: TrendingUp },
  { href: "/recurring", label: "Tekrarlayan", icon: Repeat },
  { href: "/calendar", label: "Takvim", icon: Calendar },
  { href: "/analytics", label: "Analitik", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/kasa"
            className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 font-semibold transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </span>
            <span className="hidden text-foreground sm:inline">Bütçe Takip</span>
          </Link>

          <div className="flex min-w-0 flex-1 justify-center">
            <div className="hidden md:flex md:max-w-4xl md:flex-1 md:justify-center md:gap-0.5 md:rounded-lg md:border md:border-border/60 md:bg-muted/30 md:px-1 md:py-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Tema değiştir</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobil: yatay kaydırılabilir sekmeler */}
        <div className="flex gap-1 overflow-x-auto px-1 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
