"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecurringTransaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { Edit, Trash2, Repeat } from "lucide-react";
import { RecurringDialog } from "./recurring-dialog";
import { deleteRecurringTransaction } from "@/lib/storage";
import { CATEGORIES } from "@/types";

interface RecurringListProps {
  initialRecurrings: RecurringTransaction[];
}

const FREQUENCY_LABELS: Record<RecurringTransaction["frequency"], string> = {
  monthly: "Aylık",
  weekly: "Haftalık",
  yearly: "Yıllık",
};

export function RecurringList({ initialRecurrings }: RecurringListProps) {
  const [recurrings, setRecurrings] = useState(initialRecurrings);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const { getRecurringTransactions } = require("@/lib/storage");
      setRecurrings(getRecurringTransactions());
    };
    
    window.addEventListener("budget-storage-change", handleStorageChange);
    return () => {
      window.removeEventListener("budget-storage-change", handleStorageChange);
    };
  }, []);

  const handleEdit = (recurring: RecurringTransaction) => {
    setSelectedRecurring(recurring);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bu tekrarlayan işlemi silmek istediğinize emin misiniz?")) return;

    const success = deleteRecurringTransaction(id);
    if (success) {
      setRecurrings(recurrings.filter((r) => r.id !== id));
      window.dispatchEvent(new Event("budget-storage-change"));
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId) || {
      name: categoryId,
      icon: "📦",
      color: "#6b7280",
    };
  };

  if (recurrings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Henüz tekrarlayan işlem yok</h3>
          <p className="text-muted-foreground text-center">
            Abonelik ve düzenli işlemlerinizi ekleyerek başlayın
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tekrarlayan İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recurrings.map((recurring) => {
              const category = getCategoryInfo(recurring.category);
              const isIncome = recurring.payment_type === "income";

              return (
                <div
                  key={recurring.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{recurring.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {FREQUENCY_LABELS[recurring.frequency]} • {category.name}
                        {recurring.description && ` • ${recurring.description}`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Sonraki: {format(parseISO(recurring.next_date), "d MMMM yyyy", {
                          locale: tr,
                        })}
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        isIncome ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(Math.abs(recurring.amount))}
                    </div>
                    <div className="flex items-center gap-1">
                      {!recurring.is_active && (
                        <span className="text-xs text-muted-foreground">Pasif</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(recurring)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(recurring.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <RecurringDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recurring={selectedRecurring}
      />
    </>
  );
}
