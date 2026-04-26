import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    (await db.execute({ sql: "DELETE FROM transactions WHERE id = ?", args: [id] }));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
