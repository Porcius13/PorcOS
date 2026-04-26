import { NextResponse } from "next/server";
import { db } from "@/lib/kasa-db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    (await db.execute({ sql: "DELETE FROM cards WHERE id = ?", args: [id] }));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Kasa API: Error deleting card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await req.json();
    const { name, card_limit, balance, closing_day, due_day, color } = body;

    (await db.execute({ sql: `
      UPDATE cards 
      SET name = ?, card_limit = ?, balance = ?, closing_day = ?, due_day = ?, color = ?
      WHERE id = ?
    `, args: [name, card_limit, balance, closing_day, due_day, color, id] }));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Kasa API: Error updating card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
