"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { Edit, Trash2, Search, X } from "lucide-react";
import { TransactionDialog } from "./transaction-dialog";
import { CATEGORIES } from "@/types";
import { deleteTransaction, updateTransaction } from "@/lib/storage";

interface TransactionsListProps {
  initialTransactions: Transaction[];
}

export function TransactionsList({ initialTransactions }: TransactionsListProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [amountFrom, setAmountFrom] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");

  // Update transactions when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const { getTransactions } = require("@/lib/storage");
      setTransactions(getTransactions());
    };
    
    window.addEventListener("budget-storage-change", handleStorageChange);
    return () => {
      window.removeEventListener("budget-storage-change", handleStorageChange);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = t.description?.toLowerCase().includes(query);
        const matchesCategory = CATEGORIES.find((c) => c.id === t.category)?.name.toLowerCase().includes(query);
        if (!matchesDescription && !matchesCategory) return false;
      }
      if (amountFrom) {
        const amount = Number(t.amount);
        const from = parseFloat(amountFrom);
        if (isNaN(from) || amount < from) return false;
      }
      if (amountTo) {
        const amount = Number(t.amount);
        const to = parseFloat(amountTo);
        if (isNaN(to) || amount > to) return false;
      }
      return true;
    });
  }, [transactions, dateFrom, dateTo, categoryFilter, searchQuery, amountFrom, amountTo]);

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bu işlemi silmek istediğinize emin misiniz?")) return;

    const success = deleteTransaction(id);
    if (success) {
      setTransactions(transactions.filter((t) => t.id !== id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      window.dispatchEvent(new Event("budget-storage-change"));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size} işlemi silmek istediğinize emin misiniz?`)) return;

    selectedIds.forEach((id) => {
      deleteTransaction(id);
    });

    setTransactions(transactions.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    window.dispatchEvent(new Event("budget-storage-change"));
  };

  const handleBulkCategoryChange = () => {
    if (selectedIds.size === 0 || !bulkCategory) return;
    if (!confirm(`${selectedIds.size} işlemin kategorisini değiştirmek istediğinize emin misiniz?`)) return;

    selectedIds.forEach((id) => {
      updateTransaction(id, { category: bulkCategory });
    });

    setTransactions(transactions.map((t) => 
      selectedIds.has(t.id) ? { ...t, category: bulkCategory } : t
    ));
    setSelectedIds(new Set());
    setBulkCategory("");
    window.dispatchEvent(new Event("budget-storage-change"));
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCategoryFilter("");
    setSearchQuery("");
    setAmountFrom("");
    setAmountTo("");
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId) || {
      name: categoryId,
      icon: "📦",
      color: "#6b7280",
    };
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Henüz işlem yok</h3>
          <p className="text-muted-foreground text-center mb-4">
            İlk işleminizi ekleyerek başlayın
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Açıklama veya kategori ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {(dateFrom || dateTo || categoryFilter || searchQuery || amountFrom || amountTo) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Temizle
                </Button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Başlangıç Tarihi</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bitiş Tarihi</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori</label>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Tümü</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Min. Miktar (₺)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountFrom}
                  onChange={(e) => setAmountFrom(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max. Miktar (₺)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountTo}
                  onChange={(e) => setAmountTo(e.target.value)}
                  placeholder="∞"
                />
              </div>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <span className="text-sm font-medium">
                  {selectedIds.size} işlem seçildi
                </span>
                <div className="flex gap-2 ml-auto">
                  <Select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-48"
                  >
                    <option value="">Kategori seçin</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkCategoryChange}
                    disabled={!bulkCategory}
                  >
                    Kategori Değiştir
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    Toplu Sil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Filtre kriterlerine uygun işlem bulunamadı
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    Tümünü seç
                  </span>
                </div>
              )}
              {filteredTransactions.map((transaction) => {
                const category = getCategoryInfo(transaction.category);
                const isIncome = transaction.payment_type === "income";
                const isSelected = selectedIds.has(transaction.id);

                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                      isSelected ? "bg-accent border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(transaction.id)}
                        className="rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="text-2xl">{category.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(parseISO(transaction.date), "d MMMM yyyy", {
                            locale: tr,
                          })}
                          {transaction.description && ` • ${transaction.description}`}
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          isIncome ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(Math.abs(Number(transaction.amount)))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={selectedTransaction}
      />
    </>
  );
}
