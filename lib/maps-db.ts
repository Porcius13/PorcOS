import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:gezi.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDb() {
  try {
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        category TEXT DEFAULT 'general',
        status TEXT DEFAULT 'not-visited',
        min_zoom INTEGER DEFAULT 6,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const countRes = await db.execute("SELECT COUNT(*) AS c FROM locations");
    if (countRes.rows[0] && Number(countRes.rows[0].c) === 0) {
      const samples = [
        ["Galata Kulesi", "İstanbul'un kalbi ve tarihi bekçisi.", 41.0256, 28.9741, "historical", 6, "visited", "https://plus.unsplash.com/premium_photo-1661914757134-8c8f00030043?q=80&w=800&auto=format&fit=crop"],
        ["Kapadokya", "Peri bacaları ve sabahın ilk ışıkları.", 38.6431, 34.8303, "nature", 6, "not-visited", "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800&auto=format&fit=crop"],
        ["Efes Antik Kenti", "Binlerce yıllık bir medeniyet yürüyüşü.", 37.9411, 27.3415, "historical", 6, "not-visited", "https://images.unsplash.com/photo-1599933330310-91a67732e987?q=80&w=800&auto=format&fit=crop"],
        ["Ölüdeniz", "Huzur ve mavinin en güzel tonu.", 36.5484, 29.1244, "beach", 6, "not-visited", "https://images.unsplash.com/photo-1520638064360-155858cfd795?q=80&w=800&auto=format&fit=crop"],
        ["Kaş", "Akdeniz'in en tatlı, en huzurlu limanı.", 36.2023, 29.6322, "city", 6, "not-visited", "https://images.unsplash.com/photo-1632398457199-5f1345d3c8c7?q=80&w=800&auto=format&fit=crop"],
        ["Nemrut Dağı", "Dünyanın en yüksek açık hava müzesi.", 37.9800, 38.6231, "historical", 6, "not-visited", "https://images.unsplash.com/photo-1698246736235-9f5b66d4834b?q=80&w=800&auto=format&fit=crop"],
        ["Sumela Manastırı", "Kayaların içine gizlenmiş bir tarih.", 40.6901, 39.6583, "historical", 8, "not-visited", "https://images.unsplash.com/photo-1669469279768-45ecda15b0f4?q=80&w=800&auto=format&fit=crop"]
      ];

      for (const s of samples) {
        await db.execute({
          sql: "INSERT INTO locations (name, description, lat, lng, category, min_zoom, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: s
        });
      }
    }
  } catch (e) {
    console.error("Failed to re-initialize Maps DB:", e);
  }
}

initDb().catch(console.error);

export default db;
