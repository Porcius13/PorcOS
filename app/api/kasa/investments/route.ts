import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const investments = db.prepare("SELECT * FROM investments").all();
    return NextResponse.json(investments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, subtype, amount, purchase_price, current_price, currency } = await req.json();
    const result = db.prepare(
      "INSERT INTO investments (name, type, subtype, amount, purchase_price, current_price, currency) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(name, type, subtype, amount, purchase_price, current_price, currency || 'TRY');
    
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, type, subtype, amount, purchase_price, current_price, currency } = await req.json();
    db.prepare(
      "UPDATE investments SET name = ?, type = ?, subtype = ?, amount = ?, purchase_price = ?, current_price = ?, currency = ? WHERE id = ?"
    ).run(name, type, subtype, amount, purchase_price, current_price, currency, id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) throw new Error("ID required");

    db.prepare("DELETE FROM investments WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
