import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const transactions = (await db.execute(`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC
    `)).rows;
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { amount, description, date, category_id, type, is_ai_generated } = await req.json();
    const isExpense = type === 'expense';
    const roundUpAmount = isExpense ? (Math.ceil(amount / 10) * 10) - amount : 0;

    const result = (await db.execute({ sql: "INSERT INTO transactions (amount, description, date, category_id, type, is_ai_generated, round_up) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [amount, description, date, category_id, type, is_ai_generated ? 1 : 0, roundUpAmount] }));

    if (roundUpAmount > 0) {
      (await db.execute({ sql: "UPDATE goals SET current_amount = current_amount + ? WHERE id = (SELECT id FROM goals ORDER BY RANDOM() LIMIT 1)", args: [roundUpAmount] }));
    }

    return NextResponse.json({ id: result.lastInsertRowid, round_up: roundUpAmount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
