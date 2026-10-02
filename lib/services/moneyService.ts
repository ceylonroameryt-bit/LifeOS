import { Expense, Subscription, SavingsGoal } from "@/types";
import {
  authenticated,
  list,
  insert,
  remove,
  reportError,
  changed,
  upsert,
} from "./store";
import { offline } from "@/lib/offline";
type Category = { id: string; name: string; user_id: string | null };
async function categories(): Promise<Category[]> {
  const { client, user } = await authenticated();
  if (!navigator.onLine) {
    const rows = await offline.read<Category>(user.id, "expense_categories");
    if (!rows)
      return reportError(
        "Open Money online once before adding offline expenses.",
      );
    return rows;
  }
  const { data, error } = await client
    .from("expense_categories")
    .select("id,name,user_id");
  if (error) return reportError(error.message);
  await offline.write(user.id, "expense_categories", data || []);
  return data || [];
}
export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  icon: string;
  color: string;
}
type ExpenseRow = Expense & { expense_categories?: { name: string } | null };
export const moneyService = {
  async getExpenses(): Promise<Expense[]> {
    const [rows, data] = await Promise.all([
      list<Expense>("expenses"),
      categories(),
    ]);
    return rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      category: data.find((c) => c.id === r.category_id)?.name || "Other",
    }));
  },
  async addExpense(input: {
    amount: number;
    description: string;
    category: string;
    expense_date?: string;
    notes?: string;
  }): Promise<Expense> {
    if (!Number.isFinite(input.amount) || input.amount < 0)
      throw new Error("Enter a valid non-negative amount");
    const { client, user } = await authenticated();
    const matches = (await categories()).filter(
      (c) => c.name === input.category,
    );
    let category =
      matches.find((c) => c.user_id === user.id) ||
      matches.find((c) => c.user_id === null);
    if (!category && !navigator.onLine)
      return reportError(
        "This expense category is not available offline. Reconnect to create it.",
      );
    if (!category) {
      const result = await client
        .from("expense_categories")
        .insert({ name: input.category, user_id: user.id })
        .select()
        .single();
      if (result.error) return reportError(result.error.message);
      category = result.data;
    }
    const row = await insert<Expense>(
      "expenses",
      {
        amount: Math.round(input.amount * 100) / 100,
        description: input.description.trim(),
        category_id: category!.id,
        expense_date:
          input.expense_date || new Date().toISOString().slice(0, 10),
        notes: input.notes?.trim() || "",
      },
      "expenses",
    );
    return { ...row, category: input.category };
  },
  deleteExpense: (id: string) => remove("expenses", id, "expenses"),
  getSubscriptions: () => list<Subscription>("subscriptions"),
  getSavingsGoals: () => list<SavingsGoal>("savings_goals"),
  async getBudget(period: "weekly" | "monthly" = "weekly"): Promise<number> {
    return (
      (await list<{ period_type: string; amount: number }>("budgets")).find(
        (b) => b.period_type === period,
      )?.amount || 0
    );
  },
  async setBudget(amount: number, period: "weekly" | "monthly" = "weekly") {
    if (!Number.isFinite(amount) || amount < 0)
      return reportError("Enter a valid budget");
    await upsert(
      "budgets",
      { period_type: period, amount },
      "user_id,period_type",
      "budget",
    );
  },
  getCategoryBreakdown(expenses: Expense[]): CategorySummary[] {
    const categoryMap: Record<string, { total: number; count: number }> = {};
    for (const exp of expenses) {
      const cat = exp.category || "Other";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, count: 0 };
      }
      categoryMap[cat].total =
        Math.round((categoryMap[cat].total + exp.amount) * 100) / 100;
      categoryMap[cat].count += 1;
    }

    const colorMap: Record<string, { icon: string; color: string }> = {
      Food: {
        icon: "utensils",
        color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
      },
      Shopping: {
        icon: "shopping-bag",
        color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
      },
      Transport: {
        icon: "car",
        color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40",
      },
      Entertainment: {
        icon: "film",
        color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
      },
      Bills: {
        icon: "receipt",
        color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
      },
      Subscriptions: {
        icon: "refresh-cw",
        color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
      },
      Other: {
        icon: "tag",
        color: "text-slate-500 bg-slate-50 dark:bg-slate-800",
      },
    };

    return Object.entries(categoryMap)
      .map(([category, stats]) => ({
        category,
        total: stats.total,
        count: stats.count,
        icon: colorMap[category]?.icon || "tag",
        color: colorMap[category]?.color || "text-slate-500 bg-slate-50",
      }))
      .sort((a, b) => b.total - a.total);
  },
};
