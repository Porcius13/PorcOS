"use client";

import { useEffect, useState } from "react";
import { getPendingTransactions, updatePendingTransaction, deletePendingTransaction, saveTransaction } from "@/lib/storage";
import { PendingTransaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { Check, X, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserId } from "@/lib/storage";

export function PendingTransactionsList() {
  const [pendings, setPendings] = useState<PendingTransaction[]>([]);

  useEffect(() => {
    function loadData() {
      const allPendings = getPendingTransactions();
      // Show only incomplete pending transactions
      setPendings(allPendings.filter((p) => !p.is_completed));
    }

    loadData();
    
    const handleStorageChange = () => {
      loadData();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("budget-storage-change", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("budget-storage-change", handleStorageChange);
    };
  }, []);

  const handleComplete = (pending: PendingTransaction) => {
    const userId = getUserId();
    
    // Create actual transaction
    saveTransaction({
      user_id: userId,
      date: pending.due_date,
      amount: pending.amount,
      category: pending.category,
      description: pending.description,
      payment_type: pending.payment_type,
    });

    // Mark as completed
    updatePendingTransaction(pending.id, { is_completed: true });
    
    window.dispatchEvent(new Event("budget-storage-change"));
  };

  const handleSkip = (id: string) => {
    deletePendingTransaction(id);
    window.dispatchEvent(new Event("budget-storage-change"));
  };

  if (pendings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Bekleyen İşlemler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pendings.map((pending) => {
            const isIncome = pending.payment_type === "income";
            const dueDate = new Date(pending.due_date);
            const today = new Date();
            const isOverdue = dueDate < today && !pending.is_completed;

            return (
              <div
                key={pending.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  isOverdue ? "border-red-500 bg-red-50 dark:bg-red-950" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{pending.description || "Tekrarlayan İşlem"}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(pending.due_date), "d MMMM yyyy", { locale: tr })}
                    {isOverdue && <span className="text-red-600 ml-2">(Gecikmiş)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`font-bold ${
                      isIncome ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(Math.abs(pending.amount))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleComplete(pending)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Onayla
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSkip(pending.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
