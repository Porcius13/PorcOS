export type Transaction = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  category: string;
  description: string | null;
  payment_type: "income" | "expense";
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  period: "monthly";
  created_at: string;
};

export type Saving = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  description: string | null;
  target_date: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  { id: "market", name: "Market", icon: "🛒", color: "#3b82f6" },
  { id: "ulasim", name: "Ulaşım", icon: "🚗", color: "#ef4444" },
  { id: "eglence", name: "Eğlence", icon: "🎬", color: "#f59e0b" },
  { id: "saglik", name: "Sağlık", icon: "🏥", color: "#10b981" },
  { id: "egitim", name: "Eğitim", icon: "📚", color: "#8b5cf6" },
  { id: "faturalar", name: "Faturalar", icon: "💡", color: "#ec4899" },
  { id: "giyim", name: "Giyim", icon: "👕", color: "#06b6d4" },
  { id: "diger", name: "Diğer", icon: "📦", color: "#6b7280" },
];

export type Asset = {
  id: string;
  user_id: string;
  type: "cash" | "investment" | "property" | "vehicle" | "other";
  name: string;
  value: number;
  description: string | null;
  created_at: string;
};

export type Debt = {
  id: string;
  user_id: string;
  type: "credit_card" | "loan" | "mortgage" | "other";
  name: string;
  balance: number;
  interest_rate: number | null;
  min_payment: number | null;
  due_date: string | null;
  term_months: number | null;
  description: string | null;
  created_at: string;
};

export type RecurringTransaction = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  payment_type: "income" | "expense";
  frequency: "monthly" | "weekly" | "yearly";
  next_date: string;
  duration_months: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type PendingTransaction = {
  id: string;
  user_id: string;
  recurring_id: string;
  amount: number;
  category: string;
  payment_type: "income" | "expense";
  due_date: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
};

