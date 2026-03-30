import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const subs = db.prepare(`
        SELECT s.*, c.name as category_name 
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
      `).all();
    return NextResponse.json(subs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, amount, category_id, frequency, next_date, type } = await req.json();
    const result = db.prepare(
      "INSERT INTO subscriptions (name, amount, category_id, frequency, next_date, type) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(name, amount, category_id, frequency, next_date, type);
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
