import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const goals = db.prepare("SELECT * FROM goals").all();
    return NextResponse.json(goals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, target_amount, deadline, color, icon } = await req.json();
    const result = db.prepare(
      "INSERT INTO goals (name, target_amount, deadline, color, icon) VALUES (?, ?, ?, ?, ?)"
    ).run(name, target_amount, deadline, color, icon);
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
