import { Transaction, Budget, Saving, Asset, Debt, RecurringTransaction, PendingTransaction } from "@/types";

// Local storage keys
const USER_ID_KEY = "budget_app_user_id";
const TRANSACTIONS_KEY = "budget_app_transactions";
const BUDGETS_KEY = "budget_app_budgets";
const SAVINGS_KEY = "budget_app_savings";
const ASSETS_KEY = "budget_app_assets";
const DEBTS_KEY = "budget_app_debts";
const RECURRING_KEY = "budget_app_recurring";
const PENDING_KEY = "budget_app_pending";

// User ID management
export function getUserId(): string {
  if (typeof window === "undefined") {
    return "guest-user";
  }
  
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function clearUserId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(BUDGETS_KEY);
    localStorage.removeItem(SAVINGS_KEY);
    localStorage.removeItem(ASSETS_KEY);
    localStorage.removeItem(DEBTS_KEY);
    localStorage.removeItem(RECURRING_KEY);
    localStorage.removeItem(PENDING_KEY);
  }
}

// Transactions CRUD
export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  if (!data) return [];
  
  try {
    const transactions = JSON.parse(data) as Transaction[];
    return transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export function saveTransaction(transaction: Omit<Transaction, "id" | "created_at">): Transaction {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return newTransaction;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): boolean {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  
  if (index === -1) return false;
  
  transactions[index] = { ...transactions[index], ...updates };
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return true;
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  
  if (filtered.length === transactions.length) return false;
  
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
  return true;
}

// Budgets CRUD
export function getBudgets(): Budget[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const data = localStorage.getItem(BUDGETS_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as Budget[];
  } catch {
    return [];
  }
}

export function saveBudget(budget: Omit<Budget, "id" | "created_at">): Budget {
  const budgets = getBudgets();
  
  // Check if budget already exists for this category and period
  const existingIndex = budgets.findIndex(
    (b) => b.category === budget.category && b.period === budget.period
  );
  
  const newBudget: Budget = {
    ...budget,
    id: existingIndex !== -1 ? budgets[existingIndex].id : `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: existingIndex !== -1 ? budgets[existingIndex].created_at : new Date().toISOString(),
  };
  
  if (existingIndex !== -1) {
    budgets[existingIndex] = newBudget;
  } else {
    budgets.push(newBudget);
  }
  
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  return newBudget;
}

export function updateBudget(id: string, updates: Partial<Budget>): boolean {
  const budgets = getBudgets();
  const index = budgets.findIndex((b) => b.id === id);
  
  if (index === -1) return false;
  
  budgets[index] = { ...budgets[index], ...updates };
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  return true;
}

export function deleteBudget(id: string): boolean {
  const budgets = getBudgets();
  const filtered = budgets.filter((b) => b.id !== id);
  
  if (filtered.length === budgets.length) return false;
  
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(filtered));
  return true;
}

// Savings CRUD
export function getSavings(): Saving[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const data = localStorage.getItem(SAVINGS_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as Saving[];
  } catch {
    return [];
  }
}

export function saveSaving(saving: Omit<Saving, "id" | "created_at">): Saving {
  const savings = getSavings();
  const newSaving: Saving = {
    ...saving,
    id: `saving-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  
  savings.push(newSaving);
  localStorage.setItem(SAVINGS_KEY, JSON.stringify(savings));
  return newSaving;
}

export function updateSaving(id: string, updates: Partial<Saving>): boolean {
  const savings = getSavings();
  const index = savings.findIndex((s) => s.id === id);
  
  if (index === -1) return false;
  
  savings[index] = { ...savings[index], ...updates };
  localStorage.setItem(SAVINGS_KEY, JSON.stringify(savings));
  return true;
}

export function deleteSaving(id: string): boolean {
  const savings = getSavings();
  const filtered = savings.filter((s) => s.id !== id);
  
  if (filtered.length === savings.length) return false;
  
  localStorage.setItem(SAVINGS_KEY, JSON.stringify(filtered));
  return true;
}

// Assets CRUD
export function getAssets(): Asset[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const data = localStorage.getItem(ASSETS_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as Asset[];
  } catch {
    return [];
  }
}

export function saveAsset(asset: Omit<Asset, "id" | "created_at">): Asset {
  const assets = getAssets();
  const newAsset: Asset = {
    ...asset,
    id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  
  assets.push(newAsset);
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  return newAsset;
}

export function updateAsset(id: string, updates: Partial<Asset>): boolean {
  const assets = getAssets();
  const index = assets.findIndex((a) => a.id === id);
  
  if (index === -1) return false;
  
  assets[index] = { ...assets[index], ...updates };
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  return true;
}

export function deleteAsset(id: string): boolean {
  const assets = getAssets();
  const filtered = assets.filter((a) => a.id !== id);
  
  if (filtered.length === assets.length) return false;
  
  localStorage.setItem(ASSETS_KEY, JSON.stringify(filtered));
  return true;
}

// Debts CRUD
export function getDebts(): Debt[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const data = localStorage.getItem(DEBTS_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as Debt[];
  } catch {
    return [];
  }
}

export function saveDebt(debt: Omit<Debt, "id" | "created_at">): Debt {
  const debts = getDebts();
  const newDebt: Debt = {
    ...debt,
    id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  
  debts.push(newDebt);
  localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  return newDebt;
}

export function updateDebt(id: string, updates: Partial<Debt>): boolean {
  const debts = getDebts();
  const index = debts.findIndex((d) => d.id === id);
  
  if (index === -1) return false;
  
  debts[index] = { ...debts[index], ...updates };
  localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  return true;
}

export function deleteDebt(id: string): boolean {
  const debts = getDebts();
  const filtered = debts.filter((d) => d.id !== id);
  
  if (filtered.length === debts.length) return false;
  
  localStorage.setItem(DEBTS_KEY, JSON.stringify(filtered));
  return true;
}

// Recurring Transactions CRUD
export function getRecurringTransactions(): RecurringTransaction[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const data = localStorage.getItem(RECURRING_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as RecurringTransaction[];
  } catch {
    return [];
  }
}

export function saveRecurringTransaction(recurring: Omit<RecurringTransaction, "id" | "created_at">): RecurringTransaction {
  const recurrings = getRecurringTransactions();
  const newRecurring: RecurringTransaction = {
    ...recurring,
    id: `recurring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  
  recurrings.push(newRecurring);
  localStorage.setItem(RECURRING_KEY, JSON.stringify(recurrings));
  return newRecurring;
}

export function updateRecurringTransaction(id: string, updates: Partial<RecurringTransaction>): boolean {
  const recurrings = getRecurringTransactions();
  const index = recurrings.findIndex((r) => r.id === id);
  
  if (index === -1) return false;
  
  recurrings[index] = { ...recurrings[index], ...updates };
  localStorage.setItem(RECURRING_KEY, JSON.stringify(recurrings));
  return true;
}

export function deleteRecurringTransaction(id: string): boolean {
  const recurrings = getRecurringTransactions();
  const filtered = recurrings.filter((r) => r.id !== id);
  
  if (filtered.length === recurrings.length) return false;
  
  localStorage.setItem(RECURRING_KEY, JSON.stringify(filtered));
  return true;
}

// Pending Transactions CRUD
export function getPendingTransactions(): PendingTransaction[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const data = localStorage.getItem(PENDING_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as PendingTransaction[];
  } catch {
    return [];
  }
}

export function savePendingTransaction(pending: Omit<PendingTransaction, "id" | "created_at">): PendingTransaction {
  const pendings = getPendingTransactions();
  const newPending: PendingTransaction = {
    ...pending,
    id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  
  pendings.push(newPending);
  localStorage.setItem(PENDING_KEY, JSON.stringify(pendings));
  return newPending;
}

export function updatePendingTransaction(id: string, updates: Partial<PendingTransaction>): boolean {
  const pendings = getPendingTransactions();
  const index = pendings.findIndex((p) => p.id === id);
  
  if (index === -1) return false;
  
  pendings[index] = { ...pendings[index], ...updates };
  localStorage.setItem(PENDING_KEY, JSON.stringify(pendings));
  return true;
}

export function deletePendingTransaction(id: string): boolean {
  const pendings = getPendingTransactions();
  const filtered = pendings.filter((p) => p.id !== id);
  
  if (filtered.length === pendings.length) return false;
  
  localStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
  return true;
}

// Recurring Engine: Generate pending transactions for current month
export function generatePendingTransactions(): void {
  const recurrings = getRecurringTransactions().filter((r) => r.is_active);
  const pendings = getPendingTransactions();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  recurrings.forEach((recurring) => {
    const nextDate = new Date(recurring.next_date);
    
    // Check if we need to create pending transaction for this month
    if (nextDate >= startOfMonth && nextDate <= endOfMonth) {
      // Check if pending already exists
      const exists = pendings.some(
        (p) => p.recurring_id === recurring.id && p.due_date === recurring.next_date
      );
      
      if (!exists) {
        savePendingTransaction({
          user_id: recurring.user_id,
          recurring_id: recurring.id,
          amount: recurring.amount,
          category: recurring.category,
          payment_type: recurring.payment_type,
          due_date: recurring.next_date,
          description: recurring.description,
          is_completed: false,
        });
        
        // Update next_date for recurring transaction
        const newNextDate = new Date(nextDate);
        if (recurring.frequency === "monthly") {
          newNextDate.setMonth(newNextDate.getMonth() + 1);
        } else if (recurring.frequency === "weekly") {
          newNextDate.setDate(newNextDate.getDate() + 7);
        } else if (recurring.frequency === "yearly") {
          newNextDate.setFullYear(newNextDate.getFullYear() + 1);
        }
        
        updateRecurringTransaction(recurring.id, {
          next_date: newNextDate.toISOString().split("T")[0],
        });
      }
    }
  });
}
