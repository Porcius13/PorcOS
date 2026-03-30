import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const wallets = db.prepare("SELECT * FROM wallets").all();
    return NextResponse.json(wallets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, currency } = await req.json();
    const result = db.prepare("INSERT INTO wallets (name, currency) VALUES (?, ?)").run(name, currency || 'TRY');
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
