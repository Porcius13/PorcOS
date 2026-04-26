import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = file.name.split('.').pop();
    const filename = `nomad-photo-${uniqueSuffix}.${extension}`;

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL path
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: 'File upload failed' }, { status: 500 });
  }
}
