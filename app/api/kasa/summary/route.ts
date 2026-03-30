import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";
import { format } from "date-fns";

export async function GET() {
  try {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const summary = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
      FROM transactions
      WHERE strftime('%Y-%m', date) = ?
    `).get(currentMonth);
    return NextResponse.json(summary || { total_income: 0, total_expense: 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
