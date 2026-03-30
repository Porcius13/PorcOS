"use client";

import { motion } from "framer-motion";

export type DifferentialRow = {
  diagnosis: string;
  hint: string;
  scoring: string;
  isLethal?: boolean;
};

interface DifferentialTableProps {
  rows: DifferentialRow[];
  isEditable?: boolean;
  onUpdate?: (rows: DifferentialRow[]) => void;
}

export function DifferentialTable({ rows = [], isEditable = false, onUpdate }: DifferentialTableProps) {
  const handleRowChange = (index: number, field: keyof DifferentialRow, value: string | boolean) => {
    if (!onUpdate) return;
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    onUpdate(newRows);
  };

  const addRow = () => {
    if (!onUpdate) return;
    onUpdate([...rows, { diagnosis: "", hint: "", scoring: "", isLethal: false }]);
  };

  const removeRow = (index: number) => {
    if (!onUpdate) return;
    onUpdate(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="overflow-hidden border border-terminal-surface-high bg-terminal-surface">
      <div className="flex items-center justify-between border-b border-terminal-surface-high bg-terminal-surface-high px-6 py-3">
        <span className="font-label text-xs font-bold tracking-widest uppercase text-white">
          YÜKSEK RİSK AYIRICI TANI TABLOSU
        </span>
        <span className="font-label text-[10px] font-bold text-terminal-accent">
          ÖLÜMCÜL RİSK AKTİF
        </span>
      </div>
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-terminal-surface-high bg-terminal-bg font-label text-[10px] tracking-widest text-terminal-dim uppercase">
          <tr>
            <th className="px-6 py-3 font-medium">TANI</th>
            <th className="px-6 py-3 font-medium">KLİNİK İPUCU</th>
            <th className="px-6 py-3 text-right font-medium">KARAR DESTEĞİ / SKORLAMA</th>
            {isEditable && <th className="w-10 px-4 py-3"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-terminal-surface-high font-body">
          {rows.map((row, idx) => (
            <motion.tr
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`${idx % 2 === 0 ? "bg-terminal-bg/50" : ""} hover:bg-terminal-surface-high/50 transition-colors group`}
            >
              <td className="px-6 py-4">
                {isEditable ? (
                  <input
                    className="w-full bg-transparent border-b border-transparent hover:border-terminal-accent focus:border-terminal-accent focus:outline-none font-bold text-white placeholder-terminal-dim/30"
                    value={row.diagnosis}
                    placeholder="Örn. Akut MI"
                    onChange={(e) => handleRowChange(idx, "diagnosis", e.target.value)}
                  />
                ) : (
                  <div className="font-bold text-white">{row.diagnosis}</div>
                )}
              </td>
              <td className="px-6 py-4 text-xs text-terminal-accent-muted">
                 {isEditable ? (
                  <input
                    className="w-full bg-transparent border-b border-transparent hover:border-terminal-accent focus:border-terminal-accent focus:outline-none text-terminal-accent-muted placeholder-terminal-dim/20"
                    value={row.hint}
                    placeholder="Örn. ST elevasyonu..."
                    onChange={(e) => handleRowChange(idx, "hint", e.target.value)}
                  />
                ) : (
                  <div>{row.hint}</div>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  {isEditable && (
                    <button
                      onClick={() => handleRowChange(idx, "isLethal", !row.isLethal)}
                      className={`text-[9px] px-2 py-0.5 border transition-all ${
                        row.isLethal 
                        ? "bg-terminal-error border-terminal-error text-white font-bold" 
                        : "border-terminal-dim text-terminal-dim hover:text-white"
                      }`}
                    >
                      {row.isLethal ? "ÖLÜMCÜL" : "NORMAL"}
                    </button>
                  )}
                  {isEditable ? (
                    <input
                      className={`bg-transparent border-b border-transparent text-right focus:outline-none placeholder-terminal-dim/20 ${
                        row.isLethal ? "text-terminal-error font-black" : "text-white"
                      }`}
                      value={row.scoring}
                      placeholder="Skor/Bilgi"
                      onChange={(e) => handleRowChange(idx, "scoring", e.target.value)}
                    />
                  ) : (
                    <span className={`${
                      row.isLethal 
                      ? "bg-terminal-error text-white font-black px-2 py-0.5 text-[10px] tabular-nums" 
                      : "text-white text-xs"
                    }`}>
                      {row.scoring}
                    </span>
                  )}
                </div>
              </td>
              {isEditable && (
                <td className="px-4">
                  <button 
                    onClick={() => removeRow(idx)}
                    className="text-terminal-dim hover:text-terminal-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </td>
              )}
            </motion.tr>
          ))}
          {isEditable && (
            <tr>
              <td colSpan={4} className="px-6 py-3">
                <button
                  onClick={addRow}
                  className="w-full border border-dashed border-terminal-dim/30 py-2 text-[10px] font-bold tracking-widest text-terminal-dim hover:bg-terminal-surface-high hover:text-terminal-accent transition-all"
                >
                  + AYIRICI TANI SATIRI EKLE
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
