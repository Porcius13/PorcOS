"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@/types";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useMemo } from "react";

interface DashboardCardsProps {
  transactions: Transaction[];
}

export function DashboardCards({ transactions }: DashboardCardsProps) {
  const stats = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth && new Date(t.date) <= today
    );

    const totalIncome = currentMonthTransactions
      .filter((t) => t.payment_type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = currentMonthTransactions
      .filter((t) => t.payment_type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    return {
      balance,
      totalIncome,
      totalExpense,
    };
  }, [transactions]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Bakiye</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              stats.balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(stats.balance)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aylık Gider</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalExpense)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
