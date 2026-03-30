"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Saving } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { Edit, Trash2, Target } from "lucide-react";
import { SavingDialog } from "./saving-dialog";
import { deleteSaving } from "@/lib/storage";

interface SavingsListProps {
  initialSavings: Saving[];
}

export function SavingsList({ initialSavings }: SavingsListProps) {
  const [savings, setSavings] = useState(initialSavings);
  const [selectedSaving, setSelectedSaving] = useState<Saving | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (saving: Saving) => {
    setSelectedSaving(saving);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bu birikimi silmek istediğinize emin misiniz?")) return;

    const success = deleteSaving(id);
    if (success) {
      setSavings(savings.filter((s) => s.id !== id));
      // Trigger storage change event
      window.dispatchEvent(new Event("budget-storage-change"));
    }
  };

  const getProgress = (saving: Saving) => {
    if (saving.target_amount === 0) return 0;
    return Math.min((saving.current_amount / saving.target_amount) * 100, 100);
  };

  const getRemaining = (saving: Saving) => {
    return saving.target_amount - saving.current_amount;
  };

  if (savings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4">
            <Image
              src="/safe-icon.png"
              alt="Birikim kasası"
              width={72}
              height={72}
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Henüz birikim yok</h3>
          <p className="text-muted-foreground text-center mb-4">
            Birikim hedeflerinizi ekleyerek başlayın
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savings.map((saving) => {
          const progress = getProgress(saving);
          const remaining = getRemaining(saving);
          const isCompleted = saving.current_amount >= saving.target_amount;

          return (
            <Card key={saving.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{saving.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(saving)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(saving.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Mevcut</span>
                    <span className={isCompleted ? "text-green-600 font-semibold" : ""}>
                      {formatCurrency(saving.current_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Hedef</span>
                    <span>{formatCurrency(saving.target_amount)}</span>
                  </div>
                  <Progress value={progress} className={isCompleted ? "bg-green-200" : ""} />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Kalan</span>
                    <span
                      className={
                        remaining <= 0
                          ? "text-green-600 font-semibold"
                          : "text-muted-foreground"
                      }
                    >
                      {remaining <= 0 ? "Tamamlandı! 🎉" : formatCurrency(remaining)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    %{progress.toFixed(1)} tamamlandı
                  </div>
                </div>
                {saving.target_date && (
                  <div className="text-sm text-muted-foreground">
                    Hedef Tarih: {format(parseISO(saving.target_date), "d MMMM yyyy", {
                      locale: tr,
                    })}
                  </div>
                )}
                {saving.description && (
                  <div className="text-sm text-muted-foreground">
                    {saving.description}
                  </div>
                )}
                {isCompleted && (
                  <div className="text-sm text-green-600 font-medium">
                    ✅ Hedef tamamlandı!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SavingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        saving={selectedSaving}
      />
    </>
  );
}
