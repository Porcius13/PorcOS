"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { useMemo } from "react";

interface CashFlowChartProps {
  transactions: Transaction[];
}

export function CashFlowChart({ transactions }: CashFlowChartProps) {
  const data = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date;
    });

    return days.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayTransactions = transactions.filter((t) => t.date === dateStr);

      const income = dayTransactions
        .filter((t) => t.payment_type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = dayTransactions
        .filter((t) => t.payment_type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        date: format(date, "dd MMM", { locale: tr }),
        Gelir: income,
        Gider: expense,
      };
    });
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son 7 Gün Nakit Akışı</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Gelir" fill="#10b981" />
            <Bar dataKey="Gider" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
