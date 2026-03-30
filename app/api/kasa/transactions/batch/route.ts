import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function POST(req: Request) {
  try {
    const transactions = await req.json();
    const insert = db.prepare(
      "INSERT INTO transactions (amount, description, date, category_id, type, is_ai_generated) VALUES (?, ?, ?, ?, ?, ?)"
    );

    const insertMany = db.transaction((items: any[]) => {
      for (const item of items) {
        insert.run(item.amount, item.description, item.date, item.category_id, item.type, item.is_ai_generated ? 1 : 0);
      }
    });

    insertMany(transactions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
