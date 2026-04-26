import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const investments = (await db.execute("SELECT * FROM investments")).rows;
    return NextResponse.json(investments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, subtype, amount, purchase_price, current_price, currency } = await req.json();
    const result = (await db.execute({ sql: "INSERT INTO investments (name, type, subtype, amount, purchase_price, current_price, currency) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [name, type, subtype, amount, purchase_price, current_price, currency || 'TRY'] }));
    
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, type, subtype, amount, purchase_price, current_price, currency } = await req.json();
    (await db.execute({ sql: "UPDATE investments SET name = ?, type = ?, subtype = ?, amount = ?, purchase_price = ?, current_price = ?, currency = ? WHERE id = ?", args: [name, type, subtype, amount, purchase_price, current_price, currency, id] }));
    
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

    (await db.execute({ sql: "DELETE FROM investments WHERE id = ?", args: [id] }));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
