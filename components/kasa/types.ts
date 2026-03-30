export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  category_id: number;
  type: 'income' | 'expense';
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  is_ai_generated?: boolean;
  currency?: string;
  tags?: string[];
}

export interface Summary {
  total_income: number;
  total_expense: number;
}

export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  month: string;
  category_name?: string;
  category_color?: string;
}

export interface Subscription {
  id: number;
  name: string;
  amount: number;
  category_id: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  type: 'income' | 'expense';
  category_name?: string;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  color: string;
  icon: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface UserStats {
  level: number;
  exp: number;
  streak: number;
  last_entry_date?: string;
}

export interface Investment {
  id: number;
  name: string;
  type: 'stock' | 'crypto' | 'gold' | 'currency' | 'other';
  subtype?: string;
  amount: number;
  purchase_price: number;
  current_price?: number;
  currency: string;
}

export interface Wallet {
  id: number;
  name: string;
  balance: number;
  currency: string;
}

export interface ForecastData {
  month: string;
  predicted: number;
  actual: number;
}

export interface CreditCard {
  id: number;
  name: string;
  card_limit: number;
  balance: number;
  closing_day: number;
  due_day: number;
  color: string;
}

