"use client";

import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Stethoscope,
  Wallet,
  Code2,
  TreePalm,
  PanelLeft,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Brain,
  BookOpen,
  User,
  Zap,
  LayoutGrid,
  Compass,
  Cpu,
  Network
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: any;
};

type NavCategory = {
  title: string;
  icon: any;
  items: NavItem[];
};

const navCategories: NavCategory[] = [
  {
    title: "Operasyonel",
    icon: CalendarCheck,
    items: [
      { href: "/planner", label: "Planner", icon: CalendarCheck },
    ],
  },
  {
    title: "Stratejik Zeka",
    icon: Brain,
    items: [
      { href: "/lifestyle/network", label: "Network Hub", icon: Network },
      { href: "/lifestyle/research", label: "Daily ResHub", icon: LayoutDashboard },
      { href: "/lifestyle/prompts", label: "PromptHub", icon: Zap },
      { href: "/mind-map", label: "Neural Hub", icon: Cpu },
    ],
  },
  {
    title: "Profesyonel Birimler",
    icon: LayoutGrid,
    items: [
      { href: "/med-core", label: "Tıp & Sağlık", icon: Stethoscope },
      { href: "/kasa", label: "Finans & Ekonomi", icon: Wallet },
    ],
  },
  {
    title: "Yaşam & Vizyon",
    icon: TreePalm,
    items: [
      { href: "/lifestyle/magazine", label: "Magazine", icon: BookOpen },
      { href: "/lifestyle/curiosity", label: "Merak Lab", icon: Compass },
      { href: "/vibe-lab", label: "Vibe Lab", icon: Code2 },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Operasyonel": false,
    "Stratejik Zeka": true,
    "Profesyonel Birimler": false,
    "Yaşam & Vizyon": false,
  });

  const toggleCategory = (title: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenCategories((prev) => ({ ...prev, [title]: true }));
    } else {
      setOpenCategories((prev) => ({ ...prev, [title]: !prev[title] }));
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
      <aside
        className={`sticky top-0 h-screen flex flex-col border-r border-border bg-card/80 px-3 py-4 shadow-sm backdrop-blur-md transition-[width] duration-300 ease-out z-40 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="mb-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-primary/50 hover:bg-muted"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden pb-4">
          <div className="flex flex-col gap-1 mb-2">
            <Link
              href="/"
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                pathname === "/"
                  ? (collapsed ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground shadow-sm")
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={collapsed ? "Dashboard" : undefined}
            >
              <LayoutDashboard className={`h-5 w-5 shrink-0 ${pathname === "/" && collapsed ? "text-primary" : ""}`} />
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${
                  collapsed ? "pointer-events-none opacity-0 hidden" : "opacity-100 block"
                }`}
              >
                Dashboard
              </span>
            </Link>
          </div>

          {navCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isOpen = openCategories[category.title];
            const hasActiveChild = category.items.some(
              (item) =>
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
            );

            return (
              <div key={category.title} className="flex flex-col gap-1">
                <button
                  onClick={() => toggleCategory(category.title)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    hasActiveChild && !isOpen && collapsed
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={collapsed ? category.title : undefined}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon
                      className={`h-5 w-5 shrink-0 ${
                        hasActiveChild && collapsed ? "text-primary" : ""
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap transition-opacity duration-200 ${
                        collapsed ? "pointer-events-none opacity-0 hidden" : "opacity-100 block"
                      }`}
                    >
                      {category.title}
                    </span>
                  </div>
                  {!collapsed && (
                    <div className="shrink-0 text-neutral-400 dark:text-neutral-500">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </button>

                {(!collapsed && isOpen) && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-border pl-2">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const active =
                        item.href === "/"
                          ? pathname === item.href
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-background/50 backdrop-blur-md">
          <div className="flex-1 max-w-2xl">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/profil" 
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
              title="Profil & Ayarlar"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

