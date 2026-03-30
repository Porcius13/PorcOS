"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export";
import { Transaction } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExportButtonsProps {
  transactions: Transaction[];
}

export function ExportButtons({ transactions }: ExportButtonsProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleExport = (format: "csv" | "pdf") => {
    let filtered = transactions;

    if (dateFrom || dateTo) {
      filtered = transactions.filter((t) => {
        if (dateFrom && t.date < dateFrom) return false;
        if (dateTo && t.date > dateTo) return false;
        return true;
      });
    }

    if (filtered.length === 0) {
      alert("Dışa aktarılacak işlem bulunamadı");
      return;
    }

    if (format === "csv") {
      exportToCSV(filtered);
    } else {
      exportToPDF(filtered);
    }

    setExportDialogOpen(false);
    setDateFrom("");
    setDateTo("");
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setExportDialogOpen(true)}
      >
        <Download className="mr-2 h-4 w-4" />
        Dışa Aktar
      </Button>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dışa Aktar</DialogTitle>
            <DialogClose onClose={() => setExportDialogOpen(false)} />
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi (Opsiyonel)</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Tarihi (Opsiyonel)</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleExport("csv")}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                CSV Olarak
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleExport("pdf")}
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF Olarak
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
