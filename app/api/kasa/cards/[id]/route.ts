import { NextResponse } from "next/server";
import { db } from "@/lib/kasa-db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    db.prepare("DELETE FROM cards WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Kasa API: Error deleting card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
