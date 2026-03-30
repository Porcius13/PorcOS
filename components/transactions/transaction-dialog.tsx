"use client";

import { useState, useEffect } from "react";
import { getUserId, saveTransaction, updateTransaction, deleteTransaction } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Transaction } from "@/types";
import { CATEGORIES } from "@/types";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "",
    description: "",
    payment_type: "expense" as "income" | "expense",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description || "",
        payment_type: transaction.payment_type,
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        category: "",
        description: "",
        payment_type: "expense",
      });
    }
  }, [transaction, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userId = getUserId();

    if (!formData.amount || !formData.category) {
      setError("Lütfen tüm alanları doldurun");
      setLoading(false);
      return;
    }

    try {
      if (transaction) {
        const success = updateTransaction(transaction.id, {
          user_id: userId,
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || null,
          payment_type: formData.payment_type,
        });

        if (!success) {
          setError("Güncelleme başarısız oldu");
          setLoading(false);
          return;
        }
      } else {
        saveTransaction({
          user_id: userId,
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || null,
          payment_type: formData.payment_type,
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
    if (!transaction) return;

    setLoading(true);
    try {
      const success = deleteTransaction(transaction.id);
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
            {transaction ? "İşlem Düzenle" : "Yeni İşlem"}
          </DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_type">İşlem Tipi</Label>
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
            <Label htmlFor="date">Tarih</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Miktar (₺)</Label>
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
            <Label htmlFor="category">Kategori</Label>
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
              {loading ? "Kaydediliyor..." : transaction ? "Güncelle" : "Ekle"}
            </Button>
            {transaction && (
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
