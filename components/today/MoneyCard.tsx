"use client";

import React from "react";
import { useData } from "@/lib/useData";
import { moneyService } from "@/lib/services/moneyService";
import { startOfWeek, format } from "date-fns";
const loadMoney = async () => {
  const [expenses, budget] = await Promise.all([
    moneyService.getExpenses(),
    moneyService.getBudget(),
  ]);
  const start = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const end = format(new Date(), "yyyy-MM-dd");
  const spent = expenses
    .filter((e) => e.expense_date >= start && e.expense_date <= end)
    .reduce((sum, e) => sum + e.amount, 0);
  return { budget, spent, remaining: Math.round((budget - spent) * 100) / 100 };
};
import { LifeCard } from "@/components/ui/LifeCard";
import { CreditCard, ChevronRight } from "lucide-react";

interface MoneyCardProps {
  remaining?: number;
  spent?: number;
  budget?: number;
  currency?: string;
  onClick?: () => void;
}

export function MoneyCard({ currency = "£", onClick }: MoneyCardProps) {
  const { remaining, spent, budget } = useData(
    loadMoney,
    { remaining: 0, spent: 0, budget: 0 },
    "lifeos-expenses-updated",
  );
  const percentage =
    budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;

  return (
    <LifeCard
      onClick={onClick}
      className="p-5 flex flex-col justify-between cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all select-none"
    >
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-success" />
            MONEY
          </span>
          <span className="text-[11px] font-normal lowercase tracking-normal text-slate-400">
            this week
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {currency}
            {remaining}
          </span>
          <span className="text-sm font-medium text-success">left</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currency}
          {spent} of {currency}
          {budget} spent
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3.5 overflow-hidden">
          <div
            className="bg-success h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>{percentage}% of budget used</span>
        <span className="inline-flex items-center text-primary font-medium hover:underline">
          Money <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
