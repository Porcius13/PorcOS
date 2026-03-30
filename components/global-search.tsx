"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define a common interface for search results
interface SearchResult {
  id: string | number;
  title: string;
  type: string;
  source: "medCore" | "lifestyle" | "vibeLab";
  url: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close search when route changes
  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, [pathname]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Performance optimized search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const searchStr = query.toLowerCase();

    // Helper to safely parse local storage
    const getLocalData = (key: string) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch (e) {
        return [];
      }
    };

    const medCoreData = getLocalData("medCoreItems");
    const lifestyleData = getLocalData("lifestyleItems");
    const vibeLabData = getLocalData("vibeLabItems");

    const allResults: SearchResult[] = [];

    // Search Med-Core (Clinical Guides & Methodologies)
    medCoreData.forEach((item: any) => {
      if (item.title?.toLowerCase().includes(searchStr) || item.details?.text?.toLowerCase().includes(searchStr)) {
        allResults.push({
          id: item.id,
          title: item.title,
          type: item.type || "Med-Core",
          source: "medCore",
          url: `/med-core/${item.id}`
        });
      }
    });

    // Search Lifestyle (Mera & The Bar)
    lifestyleData.forEach((item: any) => {
      if (item.title?.toLowerCase().includes(searchStr)) {
        allResults.push({
          id: item.id,
          title: item.title,
          type: item.type || "Lifestyle",
          source: "lifestyle",
          url: `/lifestyle` // Navigate to dashboard since individual view not built yet
        });
      }
    });

    // Search Vibe Lab (Logs & Zine)
    vibeLabData.forEach((item: any) => {
      if (item.title?.toLowerCase().includes(searchStr)) {
        allResults.push({
          id: item.id,
          title: item.title,
          type: item.type || "Vibe Lab",
          source: "vibeLab",
          url: `/vibe-lab` // Navigate to dashboard
        });
      }
    });

    setResults(allResults);
  }, [query]);

  return (
    <div className="relative w-full max-w-sm mr-4" ref={searchRef}>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3 flex h-full items-center text-neutral-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length > 0) setIsOpen(true);
          }}
          placeholder="Ara... (Sitikolin, Mera, Log)"
          className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-100/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-neutral-500 focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/20 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:border-primary/50 dark:focus:bg-neutral-900"
        />
      </div>

      {/* Search Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-12 right-0 z-50 w-full min-w-[300px] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 dark:border-neutral-800 dark:bg-neutral-900">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
              "{query}" için sonuç bulunamadı.
            </div>
          ) : (
            <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
              <span className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider dark:text-neutral-500">
                Sonuçlar ({results.length})
              </span>
              
              {results.map((result, idx) => (
                <Link
                  key={`${result.source}-${result.id}-${idx}`}
                  href={result.url}
                  className="group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {result.title}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {result.type} &bull; {result.source === "medCore" ? "Med-Core" : result.source === "lifestyle" ? "Lifestyle" : "Vibe Lab"}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
