import { NextResponse } from "next/server";
import db from "@/lib/kasa-db";

export async function GET() {
  try {
    let stats = db.prepare("SELECT * FROM user_stats LIMIT 1").get() as any;
    if (!stats) {
      db.prepare("INSERT INTO user_stats (level, exp, streak) VALUES (1, 0, 0)").run();
      stats = { level: 1, exp: 0, streak: 0 };
    }
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
