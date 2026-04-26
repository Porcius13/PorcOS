import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";
import { format } from "date-fns";

export async function GET() {
  try {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const budgets = (await db.execute({ sql: `
      SELECT b.*, c.name as category_name, c.color as category_color
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.month = ?
    `, args: [currentMonth] })).rows;
    return NextResponse.json(budgets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category_id, amount } = await req.json();
    const currentMonth = format(new Date(), 'yyyy-MM');

    const existing = (await db.execute({ sql: "SELECT id FROM budgets WHERE category_id = ? AND month = ?", args: [category_id, currentMonth] })).rows[0] as any as { id: number } | undefined;

    if (existing) {
      (await db.execute({ sql: "UPDATE budgets SET amount = ? WHERE id = ?", args: [amount, existing.id] }));
      return NextResponse.json({ id: existing.id, updated: true });
    } else {
      const result = (await db.execute({ sql: "INSERT INTO budgets (category_id, amount, month) VALUES (?, ?, ?)", args: [category_id, amount, currentMonth] }));
      return NextResponse.json({ id: result.lastInsertRowid });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
