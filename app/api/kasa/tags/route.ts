import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    const tags = (await db.execute("SELECT * FROM tags")).rows;
    return NextResponse.json(tags);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, color } = await req.json();
    const result = (await db.execute({ sql: "INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)", args: [name, color] }));
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
