"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Budget, Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Edit } from "lucide-react";
import { BudgetDialog } from "./budget-dialog";
import { CATEGORIES } from "@/types";
import { useMemo } from "react";

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
}

export function BudgetList({ budgets, transactions }: BudgetListProps) {
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const budgetsWithSpending = useMemo(() => {
    return budgets.map((budget) => {
      const categorySpending = transactions
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const limit = Number(budget.limit_amount);
      const percentage = limit > 0 ? (categorySpending / limit) * 100 : 0;
      const remaining = limit - categorySpending;

      return {
        ...budget,
        spent: categorySpending,
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget: categorySpending > limit,
      };
    });
  }, [budgets, transactions]);

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setDialogOpen(true);
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId) || {
      name: categoryId,
      icon: "📦",
      color: "#6b7280",
    };
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold mb-2">Henüz bütçe yok</h3>
          <p className="text-muted-foreground text-center mb-4">
            Kategori bazlı harcama limitleri belirleyerek başlayın
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgetsWithSpending.map((budget) => {
          const category = getCategoryInfo(budget.category);
          const isOverBudget = budget.isOverBudget;

          return (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(budget)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Harcanan</span>
                    <span className={isOverBudget ? "text-red-600 font-semibold" : ""}>
                      {formatCurrency(budget.spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Limit</span>
                    <span>{formatCurrency(Number(budget.limit_amount))}</span>
                  </div>
                  <Progress
                    value={budget.percentage}
                    className={isOverBudget ? "bg-red-200" : ""}
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Kalan</span>
                    <span
                      className={
                        budget.remaining >= 0
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {formatCurrency(budget.remaining)}
                    </span>
                  </div>
                </div>
                {isOverBudget && (
                  <div className="text-sm text-red-600 font-medium">
                    ⚠️ Bütçe limiti aşıldı!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={selectedBudget}
      />
    </>
  );
}
