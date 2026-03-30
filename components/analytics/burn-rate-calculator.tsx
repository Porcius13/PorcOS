"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { useMemo } from "react";
import { TrendingDown, Calendar } from "lucide-react";

interface BurnRateCalculatorProps {
  transactions: Transaction[];
}

export function BurnRateCalculator({ transactions }: BurnRateCalculatorProps) {
  const burnRateData = useMemo(() => {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);
    
    // Get current month expenses
    const currentMonthExpenses = transactions
      .filter(
        (t) =>
          t.payment_type === "expense" &&
          new Date(t.date) >= startOfCurrentMonth &&
          new Date(t.date) <= today
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate days passed in month
    const daysPassed = Math.floor(
      (today.getTime() - startOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Calculate daily burn rate
    const dailyBurnRate = daysPassed > 0 ? currentMonthExpenses / daysPassed : 0;

    // Calculate estimated end date (when money runs out)
    // Assuming monthly income from transactions
    const monthlyIncome = transactions
      .filter(
        (t) =>
          t.payment_type === "income" &&
          new Date(t.date) >= startOfCurrentMonth &&
          new Date(t.date) <= endOfCurrentMonth
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const remainingDays = dailyBurnRate > 0 
      ? Math.floor(monthlyIncome / dailyBurnRate)
      : null;

    const estimatedEndDate = remainingDays 
      ? addDays(startOfCurrentMonth, remainingDays)
      : null;

    return {
      currentMonthExpenses,
      daysPassed,
      dailyBurnRate,
      monthlyIncome,
      estimatedEndDate,
      isOverBudget: monthlyIncome > 0 && currentMonthExpenses > monthlyIncome,
    };
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Burn Rate Hesaplayıcı
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Bu Ay Harcanan</div>
          <div className="text-2xl font-bold">
            {formatCurrency(burnRateData.currentMonthExpenses)}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">Günlük Harcama Hızı</div>
          <div className="text-xl font-semibold">
            {formatCurrency(burnRateData.dailyBurnRate)}
            <span className="text-sm text-muted-foreground ml-2">
              / gün ({burnRateData.daysPassed} gün geçti)
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">Aylık Gelir</div>
          <div className="text-xl font-semibold">
            {formatCurrency(burnRateData.monthlyIncome)}
          </div>
        </div>

        {burnRateData.estimatedEndDate && burnRateData.dailyBurnRate > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>Tahmini Bitiş Tarihi</span>
            </div>
            <div
              className={`text-lg font-semibold ${
                burnRateData.isOverBudget ? "text-red-600" : "text-green-600"
              }`}
            >
              {format(burnRateData.estimatedEndDate, "d MMMM yyyy", { locale: tr })}
            </div>
            {burnRateData.isOverBudget && (
              <div className="text-sm text-red-600 mt-2">
                ⚠️ Mevcut hızla aylık geliriniz aşıldı!
              </div>
            )}
          </div>
        )}

        {burnRateData.dailyBurnRate === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            Henüz bu ay harcama yapılmamış
          </div>
        )}
      </CardContent>
    </Card>
  );
}
