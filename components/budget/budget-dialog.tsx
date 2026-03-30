"use client";

import { useState, useEffect } from "react";
import { getUserId, saveBudget, updateBudget, deleteBudget } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Budget } from "@/types";
import { CATEGORIES } from "@/types";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
}

export function BudgetDialog({
  open,
  onOpenChange,
  budget,
}: BudgetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    limit_amount: "",
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        limit_amount: budget.limit_amount.toString(),
      });
    } else {
      setFormData({
        category: "",
        limit_amount: "",
      });
    }
  }, [budget, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userId = getUserId();

    if (!formData.limit_amount || !formData.category) {
      setError("Lütfen tüm alanları doldurun");
      setLoading(false);
      return;
    }

    try {
      if (budget) {
        const success = updateBudget(budget.id, {
          user_id: userId,
          category: formData.category,
          limit_amount: parseFloat(formData.limit_amount),
          period: "monthly" as const,
        });

        if (!success) {
          setError("Güncelleme başarısız oldu");
          setLoading(false);
          return;
        }
      } else {
        saveBudget({
          user_id: userId,
          category: formData.category,
          limit_amount: parseFloat(formData.limit_amount),
          period: "monthly" as const,
        });
      }

      // Trigger storage change event
      window.dispatchEvent(new Event("budget-storage-change"));
      onOpenChange(false);
    } catch (err) {
      setError("Bir hata oluştu");
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!budget) return;

    setLoading(true);
    try {
      const success = deleteBudget(budget.id);
      if (!success) {
        setError("Silme başarısız oldu");
        setLoading(false);
        return;
      }

      // Trigger storage change event
      window.dispatchEvent(new Event("budget-storage-change"));
      onOpenChange(false);
    } catch (err) {
      setError("Bir hata oluştu");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {budget ? "Bütçe Düzenle" : "Yeni Bütçe"}
          </DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              disabled={!!budget}
            >
              <option value="">Kategori seçin</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit_amount">Aylık Limit (₺)</Label>
            <Input
              id="limit_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.limit_amount}
              onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Kaydediliyor..." : budget ? "Güncelle" : "Ekle"}
            </Button>
            {budget && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Sil
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
