import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const subs = (await db.execute(`
        SELECT s.*, c.name as category_name 
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
      `)).rows;
    return NextResponse.json(subs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, amount, category_id, frequency, next_date, type, total_installments } = await req.json();
    const result = (await db.execute({ sql: "INSERT INTO subscriptions (name, amount, category_id, frequency, next_date, type, total_installments, remaining_installments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", args: [name, amount, category_id, frequency, next_date, type, total_installments || null, total_installments || null] }));
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    (await db.execute({ sql: "DELETE FROM subscriptions WHERE id = ?", args: [id] }));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const { name, amount, category_id, frequency, next_date, type, total_installments } = await req.json();
    
    // For installments, if total_installments changed, we might want to reset remaining_installments
    // But for a simple edit, we'll just update what's provided.
    (await db.execute({ sql: `
      UPDATE subscriptions 
      SET name = ?, amount = ?, category_id = ?, frequency = ?, next_date = ?, type = ?, total_installments = ?
      WHERE id = ?
    `, args: [name, amount, category_id, frequency, next_date, type, total_installments || null, id] }));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
