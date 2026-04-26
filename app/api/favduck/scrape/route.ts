import { NextResponse } from "next/server";
import { scrapeProduct } from "@/lib/favduck/scraper";

export const maxDuration = 60; // Allows Vercel hobby plan to run up to 60s
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        console.log("[FavDuck API] Starting scrape for URL:", url);
        const data = await scrapeProduct(url);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[FavDuck API] Scraping error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || "Bilinmeyen bir hata oluştu." 
        }, { status: 500 });
    }
}
