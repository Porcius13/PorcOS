import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const logs = db.prepare("SELECT * FROM statement_logs ORDER BY created_at DESC LIMIT 50").all();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, bank_name, period } = await req.json();
    const result = db.prepare(
      "INSERT INTO statement_logs (title, bank_name, period) VALUES (?, ?, ?)"
    ).run(title, bank_name, period);
    
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) throw new Error("ID required");

    db.prepare("DELETE FROM statement_logs WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
