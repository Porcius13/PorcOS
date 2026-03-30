import { Transaction } from "@/types";
import { formatCurrency } from "./utils";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale/tr";
import Papa from "papaparse";
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

export function exportToCSV(transactions: Transaction[], filename: string = "islemler") {
  const data = transactions.map((t) => ({
    Tarih: format(parseISO(t.date), "dd/MM/yyyy"),
    Tip: t.payment_type === "income" ? "Gelir" : "Gider",
    Kategori: t.category,
    Miktar: t.amount,
    Açıklama: t.description || "",
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(transactions: Transaction[], filename: string = "islemler") {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text("İşlem Raporu", 14, 22);
  
  // Date range
  if (transactions.length > 0) {
    const dates = transactions.map((t) => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = format(dates[0], "dd MMMM yyyy", { locale: tr });
    const endDate = format(dates[dates.length - 1], "dd MMMM yyyy", { locale: tr });
    doc.setFontSize(10);
    doc.text(`Tarih Aralığı: ${startDate} - ${endDate}`, 14, 30);
  }

  // Summary
  const totalIncome = transactions
    .filter((t) => t.payment_type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.payment_type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  doc.setFontSize(10);
  doc.text(`Toplam Gelir: ${formatCurrency(totalIncome)}`, 14, 38);
  doc.text(`Toplam Gider: ${formatCurrency(totalExpense)}`, 14, 44);
  doc.text(`Bakiye: ${formatCurrency(balance)}`, 14, 50);

  // Table data
  const tableData = transactions.map((t) => [
    format(parseISO(t.date), "dd/MM/yyyy"),
    t.payment_type === "income" ? "Gelir" : "Gider",
    t.category,
    formatCurrency(Number(t.amount)),
    t.description || "-",
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["Tarih", "Tip", "Kategori", "Miktar", "Açıklama"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  doc.save(`${filename}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
