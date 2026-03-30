"use client";

import { useState, useEffect } from "react";
import { getUserId, saveRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { RecurringTransaction } from "@/types";
import { CATEGORIES } from "@/types";

interface RecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurring?: RecurringTransaction;
}

export function RecurringDialog({
  open,
  onOpenChange,
  recurring,
}: RecurringDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    payment_type: "expense" as "income" | "expense",
    frequency: "monthly" as RecurringTransaction["frequency"],
    next_date: "",
    duration_months: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (recurring) {
      setFormData({
        name: recurring.name,
        amount: recurring.amount.toString(),
        category: recurring.category,
        payment_type: recurring.payment_type,
        frequency: recurring.frequency,
        next_date: recurring.next_date,
        duration_months: recurring.duration_months != null ? String(recurring.duration_months) : "",
        description: recurring.description || "",
        is_active: recurring.is_active,
      });
    } else {
      const today = new Date();
      const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      
      setFormData({
        name: "",
        amount: "",
        category: "",
        payment_type: "expense",
        frequency: "monthly",
        next_date: firstOfNextMonth.toISOString().split("T")[0],
        duration_months: "",
        description: "",
        is_active: true,
      });
    }
  }, [recurring, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userId = getUserId();

    if (!formData.name || !formData.amount || !formData.category || !formData.next_date) {
      setError("Lütfen zorunlu alanları doldurun");
      setLoading(false);
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Miktar geçerli bir sayı olmalıdır");
      setLoading(false);
      return;
    }

    try {
      const durationMonths =
      formData.duration_months.trim() === ""
        ? null
        : parseInt(formData.duration_months, 10);
    const validDuration =
      durationMonths === null ||
      (Number.isInteger(durationMonths) && durationMonths > 0);
    if (!validDuration) {
      setError("Kaç ay sürecek geçerli bir sayı olmalıdır (örn: 12) veya boş bırakın.");
      setLoading(false);
      return;
    }

    if (recurring) {
        const success = updateRecurringTransaction(recurring.id, {
          user_id: userId,
          name: formData.name,
          amount,
          category: formData.category,
          payment_type: formData.payment_type,
          frequency: formData.frequency,
          next_date: formData.next_date,
          duration_months: durationMonths ?? null,
          description: formData.description || null,
          is_active: formData.is_active,
        });

        if (!success) {
          setError("Güncelleme başarısız oldu");
          setLoading(false);
          return;
        }
      } else {
        saveRecurringTransaction({
          user_id: userId,
          name: formData.name,
          amount,
          category: formData.category,
          payment_type: formData.payment_type,
          frequency: formData.frequency,
          next_date: formData.next_date,
          duration_months: durationMonths ?? null,
          description: formData.description || null,
          is_active: formData.is_active,
        });
      }

      window.dispatchEvent(new Event("budget-storage-change"));
      onOpenChange(false);
    } catch (err) {
      setError("Bir hata oluştu");
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!recurring) return;

    setLoading(true);
    try {
      const success = deleteRecurringTransaction(recurring.id);
      if (!success) {
        setError("Silme başarısız oldu");
        setLoading(false);
        return;
      }

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
            {recurring ? "Tekrarlayan İşlem Düzenle" : "Yeni Tekrarlayan İşlem"}
          </DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">İşlem Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Netflix, Kira, Maaş"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_type">İşlem Tipi *</Label>
            <Select
              id="payment_type"
              value={formData.payment_type}
              onChange={(e) =>
                setFormData({ ...formData, payment_type: e.target.value as "income" | "expense" })
              }
            >
              <option value="expense">Gider</option>
              <option value="income">Gelir</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Miktar (₺) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
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
            <Label htmlFor="frequency">Sıklık *</Label>
            <Select
              id="frequency"
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value as RecurringTransaction["frequency"] })
              }
              required
            >
              <option value="monthly">Aylık</option>
              <option value="weekly">Haftalık</option>
              <option value="yearly">Yıllık</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_date">Sonraki Tarih *</Label>
            <Input
              id="next_date"
              type="date"
              value={formData.next_date}
              onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_months">Kaç ay sürecek?</Label>
            <Input
              id="duration_months"
              type="number"
              min="1"
              placeholder="Boş bırakırsanız süresiz (takvimde hep görünür)"
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Abonelik/kredi kaç ay boyunca tekrarlansın? Takvime bu süreye kadar otomatik işlenir.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Opsiyonel"
            />
          </div>
          {recurring && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Aktif
              </Label>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Kaydediliyor..." : recurring ? "Güncelle" : "Ekle"}
            </Button>
            {recurring && (
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
