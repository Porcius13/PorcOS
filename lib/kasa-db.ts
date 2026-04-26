import { createClient } from "@libsql/client";
import { format } from "date-fns";

// Unique Marker: TURSO_SCHEMA_V5
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:budget.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDb() {
  try {
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        icon TEXT,
        color TEXT
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        category_id INTEGER,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        is_ai_generated INTEGER DEFAULT 0,
        round_up REAL DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        amount REAL NOT NULL,
        month TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        category_id INTEGER,
        frequency TEXT NOT NULL,
        next_date TEXT NOT NULL,
        type TEXT DEFAULT 'expense',
        total_installments INTEGER,
        remaining_installments INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        deadline TEXT,
        color TEXT,
        icon TEXT
      );
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT
      );
      CREATE TABLE IF NOT EXISTS transaction_tags (
        transaction_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (transaction_id, tag_id),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        last_entry_date TEXT,
        legacy_contact TEXT,
        stealth_mode INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        subtype TEXT,
        amount REAL NOT NULL,
        purchase_price REAL NOT NULL,
        current_price REAL,
        currency TEXT DEFAULT 'TRY'
      );
      CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT 'TRY'
      );
      CREATE TABLE IF NOT EXISTS wallet_users (
        wallet_id INTEGER,
        user_id TEXT,
        role TEXT DEFAULT 'member',
        PRIMARY KEY (wallet_id, user_id),
        FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT,
        content TEXT,
        expiry_date DATETIME,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        card_limit REAL NOT NULL,
        balance REAL DEFAULT 0,
        closing_day INTEGER NOT NULL,
        due_day INTEGER NOT NULL,
        color TEXT
      );
      CREATE TABLE IF NOT EXISTS statement_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        bank_name TEXT,
        period TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try { await db.execute("ALTER TABLE subscriptions ADD COLUMN total_installments INTEGER"); } catch (e) {}
    try { await db.execute("ALTER TABLE subscriptions ADD COLUMN remaining_installments INTEGER"); } catch (e) {}

    const countRes = await db.execute("SELECT COUNT(*) as count FROM categories");
    if (countRes.rows[0] && Number(countRes.rows[0].count) === 0) {
      const defaults = [
        ['Maaş', 'income', 'Wallet', '#10b981'],
        ['Ek Gelir', 'income', 'PlusCircle', '#34d399'],
        ['Gıda', 'expense', 'Utensils', '#f59e0b'],
        ['Kira', 'expense', 'Home', '#3b82f6'],
        ['Ulaşım', 'expense', 'Car', '#6366f1'],
        ['Eğlence', 'expense', 'Music', '#ec4899'],
        ['Sağlık', 'expense', 'HeartPulse', '#ef4444'],
        ['Alışveriş', 'expense', 'ShoppingBag', '#f97316'],
        ['Faturalar', 'expense', 'Zap', '#eab308'],
        ['Diğer', 'expense', 'MoreHorizontal', '#94a3b8']
      ];
      for (const cat of defaults) {
        await db.execute({
          sql: "INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)",
          args: cat
        });
      }
    }
  } catch (e) {
    console.error("Failed to ensure Turso tables:", e);
  }
}

// Ensure DB schemas exist asynchronously without blocking export.
initDb().catch(console.error);

export async function processSubscriptions() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dueRes = await db.execute({
      sql: "SELECT * FROM subscriptions WHERE next_date <= ?",
      args: [today]
    });
    const due = dueRes.rows as any[];

    for (const sub of due) {
      await db.execute({
        sql: "INSERT INTO transactions (amount, description, date, category_id, type) VALUES (?, ?, ?, ?, ?)",
        args: [sub.amount, sub.name, today, sub.category_id, sub.type]
      });

      if (sub.remaining_installments !== null && sub.remaining_installments !== undefined) {
        const remaining = sub.remaining_installments - 1;
        if (remaining <= 0) {
          await db.execute({ sql: "DELETE FROM subscriptions WHERE id = ?", args: [sub.id] });
          continue;
        }
        await db.execute({ sql: "UPDATE subscriptions SET remaining_installments = ? WHERE id = ?", args: [remaining, sub.id] });
      }

      const nextDate = new Date(sub.next_date as string);
      if (sub.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (sub.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (sub.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      await db.execute({
        sql: "UPDATE subscriptions SET next_date = ? WHERE id = ?",
        args: [format(nextDate, 'yyyy-MM-dd'), sub.id]
      });
    }
  } catch (e) {
    console.error("Subscription processor failed:", e);
  }
}

export default db;
