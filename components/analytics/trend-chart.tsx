"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { useMemo } from "react";

interface TrendChartProps {
  transactions: Transaction[];
}

export function TrendChart({ transactions }: TrendChartProps) {
  const data = useMemo(() => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    // Get days of current month
    const currentMonthDays = eachDayOfInterval({
      start: currentMonthStart,
      end: currentMonthEnd,
    });

    // Get days of last month (same day numbers)
    const lastMonthDays = eachDayOfInterval({
      start: lastMonthStart,
      end: lastMonthEnd,
    });

    return currentMonthDays.map((day, index) => {
      const dayStr = day.toISOString().split("T")[0];
      const currentExpenses = transactions
        .filter(
          (t) =>
            t.payment_type === "expense" &&
            t.date <= dayStr &&
            new Date(t.date) >= currentMonthStart &&
            new Date(t.date) <= currentMonthEnd
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Find corresponding day in last month
      const lastMonthDay = lastMonthDays[index];
      const lastMonthDayStr = lastMonthDay?.toISOString().split("T")[0] || "";
      const lastMonthExpenses = transactions
        .filter(
          (t) =>
            t.payment_type === "expense" &&
            t.date <= lastMonthDayStr &&
            new Date(t.date) >= lastMonthStart &&
            new Date(t.date) <= lastMonthEnd
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        date: format(day, "d MMM", { locale: tr }),
        "Bu Ay": currentExpenses,
        "Geçen Ay": lastMonthExpenses,
      };
    });
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Harcama Trendi</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Bu Ay"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Geçen Ay"
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
