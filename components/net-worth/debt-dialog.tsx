"use client";

import { useState, useEffect } from "react";
import { getUserId, saveDebt, updateDebt, deleteDebt } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Debt } from "@/types";

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: Debt;
}

export function DebtDialog({
  open,
  onOpenChange,
  debt,
}: DebtDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "credit_card" as Debt["type"],
    name: "",
    balance: "",
    interest_rate: "",
    min_payment: "",
    due_date: "",
    term_months: "",
    description: "",
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        type: debt.type,
        name: debt.name,
        balance: debt.balance.toString(),
        interest_rate: debt.interest_rate?.toString() || "",
        min_payment: debt.min_payment?.toString() || "",
        due_date: debt.due_date || "",
        term_months: debt.term_months != null ? String(debt.term_months) : "",
        description: debt.description || "",
      });
    } else {
      setFormData({
        type: "credit_card",
        name: "",
        balance: "",
        interest_rate: "",
        min_payment: "",
        due_date: "",
        term_months: "",
        description: "",
      });
    }
  }, [debt, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userId = getUserId();

    if (!formData.name || !formData.balance) {
      setError("Lütfen zorunlu alanları doldurun");
      setLoading(false);
      return;
    }

    const balance = parseFloat(formData.balance);
    if (isNaN(balance) || balance < 0) {
      setError("Bakiye geçerli bir sayı olmalıdır");
      setLoading(false);
      return;
    }

    const termMonths =
      formData.term_months.trim() === ""
        ? null
        : parseInt(formData.term_months, 10);
    const validTerm =
      termMonths === null ||
      (Number.isInteger(termMonths) && termMonths > 0);
    if (!validTerm && formData.term_months !== "") {
      setError("Kaç ay sürecek geçerli bir sayı olmalıdır (örn: 12) veya boş bırakın.");
      setLoading(false);
      return;
    }

    try {
      if (debt) {
        const success = updateDebt(debt.id, {
          user_id: userId,
          type: formData.type,
          name: formData.name,
          balance,
          interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
          min_payment: formData.min_payment ? parseFloat(formData.min_payment) : null,
          due_date: formData.due_date || null,
          term_months: termMonths ?? null,
          description: formData.description || null,
        });

        if (!success) {
          setError("Güncelleme başarısız oldu");
          setLoading(false);
          return;
        }
      } else {
        saveDebt({
          user_id: userId,
          type: formData.type,
          name: formData.name,
          balance,
          interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
          min_payment: formData.min_payment ? parseFloat(formData.min_payment) : null,
          due_date: formData.due_date || null,
          term_months: termMonths ?? null,
          description: formData.description || null,
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
    if (!debt) return;

    setLoading(true);
    try {
      const success = deleteDebt(debt.id);
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
            {debt ? "Borç Düzenle" : "Yeni Borç"}
          </DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Borç Tipi *</Label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Debt["type"] })}
              required
            >
              <option value="credit_card">Kredi Kartı</option>
              <option value="loan">Kredi</option>
              <option value="mortgage">Mortgage</option>
              <option value="other">Diğer</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Ad *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Kredi Kartı, Ev Kredisi"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Bakiye (₺) *</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              min="0"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Faiz Oranı (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_payment">Min. Ödeme (₺)</Label>
              <Input
                id="min_payment"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_payment}
                onChange={(e) => setFormData({ ...formData, min_payment: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">İlk Vade Tarihi</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="term_months">Kaç ay sürecek?</Label>
            <Input
              id="term_months"
              type="number"
              min="1"
              placeholder="Örn: 12 — Takvimde her ay bu ödeme görünür"
              value={formData.term_months}
              onChange={(e) => setFormData({ ...formData, term_months: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Kredi/kredi kartı ödemesi kaç ay boyunca yapılacak? Takvime otomatik işlenir.
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Kaydediliyor..." : debt ? "Güncelle" : "Ekle"}
            </Button>
            {debt && (
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
