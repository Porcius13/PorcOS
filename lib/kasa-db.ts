import Database from "better-sqlite3";
import path from "path";
import { format } from "date-fns";

// Support both Next.js hot-reloading and global scope sharing
declare global {
  var kasaDb: Database.Database | undefined;
}

// In Next.js, process.cwd() points to the root of the project where `budget.db` is located.
const dbPath = path.join(process.cwd(), "budget.db");

// We use a global variable to prevent opening multiple DB connections during hot-reloads
export const db = globalThis.kasaDb || new Database(dbPath);

if (process.env.NODE_ENV !== "production") {
  globalThis.kasaDb = db;
}

// Initialize Database structure securely
try {
  db.exec(`
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
} catch (e) {
  console.error("Failed to ensure SQLite tables:", e);
}

// Seed default categories if empty
try {
  const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare("INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)");
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
    defaults.forEach(cat => insertCategory.run(...cat));
  }
} catch (e) {
  // Ignore
}

// Subscription Processor
export function processSubscriptions() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const due = db.prepare("SELECT * FROM subscriptions WHERE next_date <= ?").all(today) as any[];

    for (const sub of due) {
      // Create transaction
      db.prepare("INSERT INTO transactions (amount, description, date, category_id, type) VALUES (?, ?, ?, ?, ?)")
        .run(sub.amount, sub.name, today, sub.category_id, sub.type);

      // Update next date (basic monthly increment)
      const nextDate = new Date(sub.next_date);
      if (sub.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (sub.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (sub.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      db.prepare("UPDATE subscriptions SET next_date = ? WHERE id = ?").run(format(nextDate, 'yyyy-MM-dd'), sub.id);
    }
  } catch (e) {
    console.error("Subscription processor failed:", e);
  }
}

export default db;
