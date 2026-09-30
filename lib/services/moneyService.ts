import { Expense } from '@/types';
import { createClient } from '@/lib/supabase/client';

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  icon: string;
  color: string;
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  period: 'monthly' | 'yearly';
  renewal_date: string;
  category: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  current_amount: number;
  target_amount: number;
  target_date?: string;
}

const EXPENSES_STORAGE_KEY = 'lifeos_expenses_store';
const BUDGET_STORAGE_KEY = 'lifeos_budget_store';

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    user_id: 'guest',
    amount: 14.50,
    description: 'Tesco',
    category: 'Food',
    expense_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'exp-2',
    user_id: 'guest',
    amount: 37.50,
    description: "Sainsbury's groceries",
    category: 'Food',
    expense_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'exp-3',
    user_id: 'guest',
    amount: 31.00,
    description: 'Amazon tech accessories',
    category: 'Shopping',
    expense_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
  },
  {
    id: 'exp-4',
    user_id: 'guest',
    amount: 18.00,
    description: 'TfL travelcard',
    category: 'Transport',
    expense_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
  },
  {
    id: 'exp-5',
    user_id: 'guest',
    amount: 7.00,
    description: 'Cinema ticket',
    category: 'Entertainment',
    expense_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
  },
];

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', name: 'Netflix', cost: 10.99, period: 'monthly', renewal_date: '12 October', category: 'Entertainment' },
  { id: 'sub-2', name: 'Phone Bill', cost: 34.00, period: 'monthly', renewal_date: '18 October', category: 'Bills' },
  { id: 'sub-3', name: 'Gym Membership', cost: 25.00, period: 'monthly', renewal_date: '1 November', category: 'Health' },
];

export const DEFAULT_SAVINGS: SavingsGoal[] = [
  { id: 'sav-1', title: 'Emergency Fund', current_amount: 1420, target_amount: 3000 },
  { id: 'sav-2', title: 'Camera', current_amount: 320, target_amount: 800 },
];

function getLocalExpenses(): Expense[] {
  if (typeof window === 'undefined') return DEFAULT_EXPENSES;
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(DEFAULT_EXPENSES));
      return DEFAULT_EXPENSES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EXPENSES;
  }
}

function saveLocalExpenses(expenses: Expense[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    window.dispatchEvent(new Event('lifeos-expenses-updated'));
  } catch (e) {
    console.error('Failed to save expenses:', e);
  }
}

export const moneyService = {
  async getExpenses(): Promise<Expense[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false });

          if (!error && data) return data as Expense[];
        }
      } catch (err) {
        console.warn('Supabase expense fetch failed, using local storage:', err);
      }
    }
    return getLocalExpenses();
  },

  async addExpense(input: {
    amount: number;
    description: string;
    category: string;
    expense_date?: string;
    notes?: string;
  }): Promise<Expense> {
    // Decimal safe rounding
    const cleanAmount = Math.round(Number(input.amount) * 100) / 100;
    const newExpense: Expense = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}`,
      user_id: 'guest',
      amount: cleanAmount,
      description: input.description.trim(),
      category: input.category,
      expense_date: input.expense_date || new Date().toISOString().split('T')[0],
      notes: input.notes?.trim() || '',
    };

    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          newExpense.user_id = user.id;
          const { data, error } = await supabase
            .from('expenses')
            .insert(newExpense)
            .select()
            .single();

          if (!error && data) {
            window.dispatchEvent(new Event('lifeos-expenses-updated'));
            return data as Expense;
          }
        }
      } catch (err) {
        console.warn('Supabase expense insert failed, saving locally:', err);
      }
    }

    const expenses = getLocalExpenses();
    const updated = [newExpense, ...expenses];
    saveLocalExpenses(updated);
    return newExpense;
  },

  async deleteExpense(id: string): Promise<void> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('expenses').delete().eq('id', id);
          window.dispatchEvent(new Event('lifeos-expenses-updated'));
          return;
        }
      } catch (err) {
        console.warn('Supabase expense delete failed:', err);
      }
    }

    const expenses = getLocalExpenses().filter((e) => e.id !== id);
    saveLocalExpenses(expenses);
  },

  getCategoryBreakdown(expenses: Expense[]): CategorySummary[] {
    const categoryMap: Record<string, { total: number; count: number }> = {};
    for (const exp of expenses) {
      const cat = exp.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, count: 0 };
      }
      categoryMap[cat].total = Math.round((categoryMap[cat].total + exp.amount) * 100) / 100;
      categoryMap[cat].count += 1;
    }

    const colorMap: Record<string, { icon: string; color: string }> = {
      Food: { icon: 'utensils', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
      Shopping: { icon: 'shopping-bag', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
      Transport: { icon: 'car', color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' },
      Entertainment: { icon: 'film', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
      Bills: { icon: 'receipt', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
      Subscriptions: { icon: 'refresh-cw', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
      Other: { icon: 'tag', color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' },
    };

    return Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
      icon: colorMap[category]?.icon || 'tag',
      color: colorMap[category]?.color || 'text-slate-500 bg-slate-50',
    })).sort((a, b) => b.total - a.total);
  },

  getBudget(period: 'weekly' | 'monthly' = 'weekly'): number {
    if (typeof window === 'undefined') return 150;
    try {
      const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed[period] || (period === 'weekly' ? 150 : 600);
      }
    } catch {}
    return period === 'weekly' ? 150 : 600;
  },

  setBudget(amount: number, period: 'weekly' | 'monthly' = 'weekly') {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : { weekly: 150, monthly: 600 };
      parsed[period] = amount;
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new Event('lifeos-budget-updated'));
    } catch {}
  },
};
