"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Debt } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2, CreditCard } from "lucide-react";
import { DebtDialog } from "./debt-dialog";
import { deleteDebt } from "@/lib/storage";

interface DebtsListProps {
  debts: Debt[];
}

const DEBT_TYPE_LABELS: Record<Debt["type"], string> = {
  credit_card: "Kredi Kartı",
  loan: "Kredi",
  mortgage: "Mortgage",
  other: "Diğer",
};

export function DebtsList({ debts }: DebtsListProps) {
  const [selectedDebt, setSelectedDebt] = useState<Debt | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bu borcu silmek istediğinize emin misiniz?")) return;

    const success = deleteDebt(id);
    if (success) {
      window.dispatchEvent(new Event("budget-storage-change"));
    }
  };

  if (debts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Borçlar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Henüz borç eklenmemiş
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Borçlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{debt.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {DEBT_TYPE_LABELS[debt.type]}
                    {debt.interest_rate && ` • %${debt.interest_rate} faiz`}
                    {debt.min_payment && ` • Min: ${formatCurrency(debt.min_payment)}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-bold text-red-600">
                    {formatCurrency(debt.balance)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(debt)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(debt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DebtDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        debt={selectedDebt}
      />
    </>
  );
}
