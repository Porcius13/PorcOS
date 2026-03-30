import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";
import { format } from "date-fns";

export async function GET() {
  try {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const budgets = db.prepare(`
      SELECT b.*, c.name as category_name, c.color as category_color
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.month = ?
    `).all(currentMonth);
    return NextResponse.json(budgets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category_id, amount } = await req.json();
    const currentMonth = format(new Date(), 'yyyy-MM');

    const existing = db.prepare("SELECT id FROM budgets WHERE category_id = ? AND month = ?").get(category_id, currentMonth) as { id: number } | undefined;

    if (existing) {
      db.prepare("UPDATE budgets SET amount = ? WHERE id = ?").run(amount, existing.id);
      return NextResponse.json({ id: existing.id, updated: true });
    } else {
      const result = db.prepare(
        "INSERT INTO budgets (category_id, amount, month) VALUES (?, ?, ?)"
      ).run(category_id, amount, currentMonth);
      return NextResponse.json({ id: result.lastInsertRowid });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
