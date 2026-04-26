import { NextResponse } from "next/server";
import { db } from "@/lib/maps-db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const locations = (await db.execute("SELECT * FROM locations ORDER BY created_at DESC")).rows;
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, lat, lng, category, min_zoom, status, image_url } = body;

    if (!name || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Name, lat and lng are required" }, { status: 400 });
    }

    const result = await db.execute({
      sql: `
        INSERT INTO locations (name, description, lat, lng, category, min_zoom, status, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        name, 
        description || "", 
        lat, 
        lng, 
        category || 'general', 
        min_zoom || 6, 
        status || 'not-visited', 
        image_url || ""
      ]
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid?.toString() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, lat, lng, category, min_zoom, status, image_url } = body;

    if (id === undefined || id === null || !name || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: "id, name, lat and lng are required" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `
        UPDATE locations
        SET name = ?, description = ?, lat = ?, lng = ?, category = ?, min_zoom = ?, status = ?, image_url = ?
        WHERE id = ?
      `,
      args: [
        name,
        description ?? "",
        Number(lat),
        Number(lng),
        category ?? "general",
        min_zoom ?? 6,
        status ?? "not-visited",
        image_url ?? "",
        id
      ]
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    (await db.execute({ sql: "DELETE FROM locations WHERE id = ?", args: [id] }));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
