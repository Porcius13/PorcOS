"use client";

import { useState, useEffect } from "react";
import { getUserId, saveSaving, updateSaving, deleteSaving } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Saving } from "@/types";

interface SavingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: Saving;
}

export function SavingDialog({
  open,
  onOpenChange,
  saving,
}: SavingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    description: "",
    target_date: "",
  });

  useEffect(() => {
    if (saving) {
      setFormData({
        name: saving.name,
        target_amount: saving.target_amount.toString(),
        current_amount: saving.current_amount.toString(),
        description: saving.description || "",
        target_date: saving.target_date || "",
      });
    } else {
      setFormData({
        name: "",
        target_amount: "",
        current_amount: "",
        description: "",
        target_date: "",
      });
    }
  }, [saving, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userId = getUserId();

    if (!formData.name || !formData.target_amount || !formData.current_amount) {
      setError("Lütfen zorunlu alanları doldurun");
      setLoading(false);
      return;
    }

    const targetAmount = parseFloat(formData.target_amount);
    const currentAmount = parseFloat(formData.current_amount);

    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError("Hedef tutar geçerli bir sayı olmalıdır");
      setLoading(false);
      return;
    }

    if (isNaN(currentAmount) || currentAmount < 0) {
      setError("Mevcut tutar geçerli bir sayı olmalıdır");
      setLoading(false);
      return;
    }

    if (currentAmount > targetAmount) {
      setError("Mevcut tutar hedef tutardan fazla olamaz");
      setLoading(false);
      return;
    }

    try {
      if (saving) {
        const success = updateSaving(saving.id, {
          user_id: userId,
          name: formData.name,
          target_amount: targetAmount,
          current_amount: currentAmount,
          description: formData.description || null,
          target_date: formData.target_date || null,
        });

        if (!success) {
          setError("Güncelleme başarısız oldu");
          setLoading(false);
          return;
        }
      } else {
        saveSaving({
          user_id: userId,
          name: formData.name,
          target_amount: targetAmount,
          current_amount: currentAmount,
          description: formData.description || null,
          target_date: formData.target_date || null,
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
    if (!saving) return;

    setLoading(true);
    try {
      const success = deleteSaving(saving.id);
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
            {saving ? "Birikim Düzenle" : "Yeni Birikim"}
          </DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Birikim Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Tatil, Araba, Ev"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_amount">Hedef Tutar (₺) *</Label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_amount">Mevcut Tutar (₺) *</Label>
            <Input
              id="current_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.current_amount}
              onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_date">Hedef Tarih</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Kaydediliyor..." : saving ? "Güncelle" : "Ekle"}
            </Button>
            {saving && (
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
