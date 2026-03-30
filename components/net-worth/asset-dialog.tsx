"use client";

import { useState, useEffect } from "react";
import { getUserId, saveAsset, updateAsset, deleteAsset } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Asset } from "@/types";

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset;
}

export function AssetDialog({
  open,
  onOpenChange,
  asset,
}: AssetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "cash" as Asset["type"],
    name: "",
    value: "",
    description: "",
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        type: asset.type,
        name: asset.name,
        value: asset.value.toString(),
        description: asset.description || "",
      });
    } else {
      setFormData({
        type: "cash",
        name: "",
        value: "",
        description: "",
      });
    }
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userId = getUserId();

    if (!formData.name || !formData.value) {
      setError("Lütfen zorunlu alanları doldurun");
      setLoading(false);
      return;
    }

    const value = parseFloat(formData.value);
    if (isNaN(value) || value < 0) {
      setError("Değer geçerli bir sayı olmalıdır");
      setLoading(false);
      return;
    }

    try {
      if (asset) {
        const success = updateAsset(asset.id, {
          user_id: userId,
          type: formData.type,
          name: formData.name,
          value,
          description: formData.description || null,
        });

        if (!success) {
          setError("Güncelleme başarısız oldu");
          setLoading(false);
          return;
        }
      } else {
        saveAsset({
          user_id: userId,
          type: formData.type,
          name: formData.name,
          value,
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
    if (!asset) return;

    setLoading(true);
    try {
      const success = deleteAsset(asset.id);
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
            {asset ? "Varlık Düzenle" : "Yeni Varlık"}
          </DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Varlık Tipi *</Label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Asset["type"] })}
              required
            >
              <option value="cash">Nakit</option>
              <option value="investment">Yatırım</option>
              <option value="property">Taşınmaz</option>
              <option value="vehicle">Araç</option>
              <option value="other">Diğer</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Ad *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Banka Hesabı, Ev, Araba"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Değer (₺) *</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
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
              {loading ? "Kaydediliyor..." : asset ? "Güncelle" : "Ekle"}
            </Button>
            {asset && (
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
