"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  getDay,
} from "date-fns";
import { tr } from "date-fns/locale/tr";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import {
  getTransactions,
  getPendingTransactions,
  getDebts,
  getRecurringTransactions,
} from "@/lib/storage";
import type {
  Transaction,
  PendingTransaction,
  Debt,
  RecurringTransaction,
} from "@/types";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

type ItemVariant = "destructive" | "primary" | "secondary";

type CalendarItem = {
  id: string;
  label: string;
  amount: number;
  date: string;
  variant: ItemVariant;
  source: "transaction" | "pending" | "debt" | "recurring";
  payment_type?: "income" | "expense";
  raw?: Transaction | PendingTransaction | Debt | RecurringTransaction;
};

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function getVariantFromCategory(category: string): ItemVariant {
  if (category === "faturalar") return "primary";
  if (category === "ulasim") return "destructive";
  return "secondary";
}

function getCategoryName(categoryId: string): string {
  return CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

function getRecurringDatesInMonth(
  r: RecurringTransaction,
  year: number,
  month: number
): string[] {
  const dates: string[] = [];
  const next = parseISO(r.next_date);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);

  // Süre sınırı: duration_months varsa bu ay bitişten sonra mı?
  if (r.duration_months != null && r.duration_months > 0) {
    const endDate = addMonths(next, r.duration_months - 1);
    if (monthStart > endDate) return [];
  }

  if (r.frequency === "monthly") {
    const day = next.getDate();
    const d = new Date(year, month - 1, day);
    if (d >= monthStart && d <= monthEnd && d >= next)
      dates.push(format(d, "yyyy-MM-dd"));
  } else if (r.frequency === "weekly") {
    let d = new Date(next);
    if (d > monthEnd) {
      while (d > monthEnd) d = addDays(d, -7);
    }
    while (d < monthStart) d = addDays(d, 7);
    while (d <= monthEnd) {
      if (d >= next) dates.push(format(d, "yyyy-MM-dd"));
      d = addDays(d, 7);
    }
  } else if (r.frequency === "yearly") {
    if (next.getMonth() === month - 1) {
      const d = new Date(year, month - 1, next.getDate());
      if (d >= next) dates.push(format(d, "yyyy-MM-dd"));
    }
  }
  return dates;
}

function buildCalendarItems(
  year: number,
  month: number,
  transactions: Transaction[],
  pendings: PendingTransaction[],
  debts: Debt[],
  recurrings: RecurringTransaction[]
): CalendarItem[] {
  const items: CalendarItem[] = [];
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);

  transactions
    .filter((t) => {
      const d = parseISO(t.date);
      return d >= monthStart && d <= monthEnd;
    })
    .forEach((t) => {
      items.push({
        id: t.id,
        label: t.description?.slice(0, 20) || getCategoryName(t.category),
        amount: t.amount,
        date: t.date,
        variant: getVariantFromCategory(t.category),
        source: "transaction",
        payment_type: t.payment_type,
        raw: t,
      });
    });

  pendings
    .filter((p) => {
      const d = parseISO(p.due_date);
      return d >= monthStart && d <= monthEnd;
    })
    .forEach((p) => {
      const cat = p.category;
      items.push({
        id: p.id,
        label: p.description?.slice(0, 20) || getCategoryName(cat),
        amount: p.amount,
        date: p.due_date,
        variant: getVariantFromCategory(cat),
        source: "pending",
        payment_type: p.payment_type,
        raw: p,
      });
    });

  debts
    .filter((d) => d.due_date)
    .forEach((d) => {
      const firstDue = parseISO(d.due_date!);
      const termMonths = d.term_months ?? 1;
      for (let i = 0; i < termMonths; i++) {
        const payDate = addMonths(firstDue, i);
        if (payDate >= monthStart && payDate <= monthEnd) {
          const dateStr = format(payDate, "yyyy-MM-dd");
          items.push({
            id: `${d.id}-${dateStr}`,
            label: d.name,
            amount: d.min_payment ?? d.balance,
            date: dateStr,
            variant: "destructive",
            source: "debt",
            raw: d,
          });
        }
      }
    });

  recurrings
    .filter((r) => r.is_active)
    .forEach((r) => {
      const dates = getRecurringDatesInMonth(r, year, month);
      dates.forEach((dateStr) => {
        items.push({
          id: `${r.id}-${dateStr}`,
          label: r.name,
          amount: r.amount,
          date: dateStr,
          variant: getVariantFromCategory(r.category),
          source: "recurring",
          payment_type: r.payment_type,
          raw: r,
        });
      });
    });

  return items;
}

function getItemsByDate(items: CalendarItem[]): Record<string, CalendarItem[]> {
  const map: Record<string, CalendarItem[]> = {};
  items.forEach((item) => {
    if (!map[item.date]) map[item.date] = [];
    map[item.date].push(item);
  });
  return map;
}

export function FinancialCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendings, setPending] = useState<PendingTransaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);

  useEffect(() => {
    const load = () => {
      setTransactions(getTransactions());
      setPending(getPendingTransactions());
      setDebts(getDebts());
      setRecurrings(getRecurringTransactions());
    };
    load();
    window.addEventListener("budget-storage-change", load);
    return () => window.removeEventListener("budget-storage-change", load);
  }, []);

  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth() + 1;

  const calendarItems = useMemo(
    () =>
      buildCalendarItems(
        y,
        m,
        transactions,
        pendings,
        debts,
        recurrings
      ),
    [y, m, transactions, pendings, debts, recurrings]
  );

  const itemsByDate = useMemo(
    () => getItemsByDate(calendarItems),
    [calendarItems]
  );

  const gridDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const gridStart = startOfWeek(start, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(end, { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [currentMonth]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setSheetOpen(true);
  };

  const dayItems = selectedDate
    ? itemsByDate[format(selectedDate, "yyyy-MM-dd")] ?? []
    : [];

  const variantClasses: Record<ItemVariant, string> = {
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
    primary: "bg-primary/15 text-primary border-primary/30",
    secondary: "bg-secondary text-secondary-foreground border-secondary",
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60",
        "md:p-6"
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Mali Takvim</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">
            {format(currentMonth, "MMMM yyyy", { locale: tr })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayItemsList = itemsByDate[dateStr] ?? [];
          const inMonth = isSameMonth(day, currentMonth);
          const isWeekend = getDay(day) === 0 || getDay(day) === 6;
          const isTodayDate = isToday(day);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDayClick(day)}
              className={cn(
                "min-h-[80px] rounded-lg border p-2 text-left transition-colors hover:bg-muted/50",
                "flex flex-col gap-1",
                !inMonth && "bg-muted/30 text-muted-foreground",
                inMonth && isWeekend && "bg-muted/40",
                inMonth && isTodayDate && "ring-2 ring-primary bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  !inMonth && "text-muted-foreground",
                  inMonth && isTodayDate && "text-primary"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayItemsList.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "truncate rounded border px-1 py-0.5 text-[10px] font-medium",
                      variantClasses[item.variant]
                    )}
                    title={`${item.label} ${formatCurrency(item.amount)}`}
                  >
                    {item.label.slice(0, 12)}
                    {item.label.length > 12 ? "…" : ""} {formatCurrency(item.amount)}
                  </div>
                ))}
                {dayItemsList.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{dayItemsList.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader className="relative pr-10">
            <SheetClose onClose={() => setSheetOpen(false)} />
            <SheetTitle>
              {selectedDate
                ? format(selectedDate, "d MMMM yyyy", { locale: tr })
                : "Gün detayı"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {dayItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bu tarihte kayıtlı işlem yok.
              </p>
            ) : (
              <ul className="space-y-3">
                {dayItems.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "rounded-lg border p-3",
                      variantClasses[item.variant]
                    )}
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.source === "transaction" && "İşlem"}
                        {item.source === "pending" && "Bekleyen (Tekrarlayan)"}
                        {item.source === "debt" && "Borç"}
                        {item.source === "recurring" && "Tekrarlayan"}
                      </span>
                      <span className="font-semibold">
                        {item.payment_type === "income"
                          ? "+"
                          : item.payment_type === "expense" || item.source === "debt"
                            ? "-"
                            : ""}
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    {item.raw &&
                      "category" in item.raw &&
                      item.raw.category && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {getCategoryName(item.raw.category)}
                        </div>
                      )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
