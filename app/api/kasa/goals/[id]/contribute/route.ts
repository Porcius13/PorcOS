import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const { amount } = await req.json();
    db.prepare("UPDATE goals SET current_amount = current_amount + ? WHERE id = ?").run(amount, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
